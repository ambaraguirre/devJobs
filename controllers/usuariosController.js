const {validationResult, check } = require('express-validator');
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortId = require('shortid');


//opciones de multer
const configuracionMulter = {
    limits: {fileSize : 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, __dirname+'../../public/uploads/perfiles');
        },
        filename: (req, file, cb) =>{
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
            //el callback se ejecuta como true o false: true como la imagen se acepta
            cb(null, true);
        }
        else{
            cb(new Error('Formato no valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');


exports.subirImagen = (req, res, next) =>{
    upload(req,res, function(error){
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
            res.redirect('/administracion');
            return;
        }
        else{
            return next();
        }
    });
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    })
}


exports.validarRegistro = async (req, res, next) => {

    await check('nombre').notEmpty().escape().withMessage('El nombre no puede ir vacio').run(req);
    await check('email').isEmail().escape().withMessage('Debe ser un email valido').run(req);
    await check('password').notEmpty().escape().withMessage('El password no puede ir vacio').run(req);
    await check('confirmar').notEmpty().escape().withMessage('El password se debe confirmar').run(req);
    await check('confirmar').equals(req.body.password).escape().withMessage('El password debe coincidir').run(req);


    const errores = validationResult(req);

    if(!errores.isEmpty()){
        //si hay errores
        req.flash('error', errores.array().map(error => error.msg));

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash()
        });
        return;
    }

    //si toda la validacion es correcta
    next();
}

exports.crearUsuario = async (req, res, next) => {

    //crear usuario
    const usuario = new Usuarios(req.body);
   
    try{
        await usuario.save();
        res.redirect('/iniciar-sesion');
    }catch(error){
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }


}


//formulario para iniciar sesion
exports.formIniciarSesion = (req,res) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar sesión devJobs',

    })
}

//editar el perfil
exports.formEditarPerfil = (req, res) =>{
    res.render('editar-perfil',{
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//guardar cambios editar perfil
exports.editarPerfil = async (req, res) =>{
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password
    }

    if(req.file){
        usuario.imagen = req.file.filename;
    }
    
    await usuario.save();

    req.flash('correcto', 'Cambios guardados correctamente');

    //Redirect
    res.redirect('/administracion');
}

//validar y sanitizar perfil
exports.validarPerfil = async(req, res, next) =>{

    await check('nombre').escape().notEmpty().withMessage('Debe ingresar un nombre').run(req);
    await check('email').escape().notEmpty().withMessage('Debe ingresar un email').run(req);
    await check('email').escape().isEmail().withMessage('Debe ingresar un email valido').run(req);
    if(req.body.password){
        await check('password').escape().run(req);
    }
 
    const errores = validationResult(req);
    
    if(!errores.isEmpty()){
        req.flash('error', errores.array().map(error => error.msg));

        res.render('editar-perfil',{
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
        return;
    }

    //si no hay errores
    next();

}