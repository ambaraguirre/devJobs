const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortId = require('shortid');
const { cerrarSesion } = require('./authController');



exports.formularioNuevaVacante = (req,res)=>{
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//agrega las vacantes a la bd

exports.agregarVacante = async (req, res) =>{
    const vacante = new Vacante(req.body);

    //usuario autor de la vacante
    vacante.autor = req.user._id;
    
    //crear arreglo de habilidades
    vacante.skills = req.body.skills.split(',');

    //almacenar en la base de datos
    const nuevaVacante = await vacante.save()

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

//muestra una vacante
exports.mostrarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor');
    if(!vacante) return next();

    res.render('vacante',{
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) =>{
    const vacante = await Vacante.findOne({url: req.params.url});

    if(!vacante) return next();

    res.render('editarVacante',{
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.body.nombre,
        imagen: req.user.imagen
    })

}

exports.editarVacante = async (req, res) =>{
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);
}

//eliminar vacante
exports.eliminarVacante = async(req, res) =>{
    const { id } = req.params;

    const vacante = await Vacante.findById(id);
    
    if(verificarAutor(vacante, req.user)){
        //eliminar
        await Vacante.deleteOne({_id: id})
        res.status(200).send('Vacante eliminada correctamente');
    }
    else{
        //no permitido
        res.status(403).send('Error');
    }
}

const verificarAutor = (vacante = {}, usuario = {}) =>{
    if(!vacante.autor.equals(usuario._id)){
        return false
    }
    
    return true;
}   


//validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = async(req, res, next) =>{
    //sanitizar los campos y validar
    await check('titulo').escape().notEmpty().withMessage('Agrega un titulo a la vacante').run(req);
    await check('empresa').escape().notEmpty().withMessage('Agregar un nombre de empresa').run(req);
    await check('ubicacion').escape().notEmpty().withMessage('Agrega la úbicacion').run(req);
    await check('salario').escape().run(req);
    await check('contrato').escape().notEmpty().withMessage('Selecciona un tipo de contrato').run(req);
    await check('skills').escape().notEmpty().withMessage('Agrega al menos una habilidad').run(req);


    const errores = validationResult(req);

    if(!errores.isEmpty()){
        req.flash('error', errores.array().map(error => error.msg));

        res.render('nueva-vacante',{
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
        
        return;
    }

    next(); //si no hay errores
}

//subir curriculum
exports.subirCV = (req, res, next) =>{
    upload(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                }
                else{
                    req.flash('error', error.message);
                }
            }
            else{
                req.flash('error', error.message);
            }

            res.redirect('back');
            return;
        }
        else{
            return next();
        }
    });
}

const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: ( req, file, cb) =>{
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'application/pdf'){
            //el callback se ejecuta como true o false: true cuando la imagen se acepta
            cb(null, true);
        }
        else{
            cb(new Error('Formato no valido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');


//almacenar los candidatos en la base de datos
exports.contactar = async(req, res, next ) =>{
    const vacante = await Vacante.findOne({ url : req.params.url});

    //si no existe la vacante 
    if(!vacante) return next();

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    //almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu cv correctamente');
    res.redirect('/')
}

exports.mostrarCandidatos = async(req, res, next) =>{
    const vacante = await Vacante.findById(req.params.id);


    if(!vacante.autor == req.user._id.toString()){
        return next();
    }

    if(!vacante) return next();

    res.render('candidatos',{
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

//buscador de vacantes
exports.buscarVacantes = async (req, res) =>{
    const vacantes = await Vacante.find({
        $text:{
            $search : req.body.q
        }
    });

    //mostrar las vacantes
    res.render('home',{
        nombrePagina: `Resultados para la busqueda ${req.body.q}`,
        barra: true,
        vacantes
    })

}

