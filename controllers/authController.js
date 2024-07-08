const passport = require('passport');
const mongoose= require('mongoose');
const Vacantes = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlres/email.js');


exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) =>{

    //revisar el usuario
    if(req.isAuthenticated()){
        return next(); //esta autenticado
    }

    //redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async(req, res) =>{

    //consultar el usuario autenticado
    const vacantes = await Vacantes.find({autor: req.user._id});
    res.render('administracion',{
        nombrePagina: 'Panel de administración',
        tagline: 'Crea y administra tus vacantes desde aqui',
        vacantes,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}


// Cerrar sesión con Passport y Express
exports.cerrarSesion = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        req.flash('correcto', 'Cerraste sesión correctamente');
        res.redirect('/iniciar-sesion');
    });
};


exports.formRestablecerPassword = (req, res) =>{
    res.render('restablecer-password', {
        nombrePagina: 'Restablece tu password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email.'
    })
}



//generar el token en la tabla del usuario
exports.enviarToken = async(req, res) =>{
    const usuario = await Usuarios.findOne({email: req.body.email});
    
    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    //el usuario existe generar token 
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //guardar el usuario 
    await usuario.save();
    const reseUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;
   
    //enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Resetear password',
        reseUrl,
        archivo: 'reset'
    });


    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

//valida si el token es valido y el ususairo existe muestra la vista
exports.restablecerPassword = async(req,res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/restablecer-password');
    }

    //Todo bien, mostrar el formulario
    res.render('nuevo-password',{
        nombrePagina: 'Nuevo password',
    })
}

//almacena el nuevo password en la base de datos
exports.guardarPassword = async(req, res) =>{
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });

    //no existe el usuario o el token ya es invalido
    if(!usuario){
        req.flash('error', 'El formulario ya no es valido, intente de nuevo');
        return res.redirect('/restablecer-password');
    }

    //asignar nuevo password y limpiar los valores de token y expira
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //guardaar en la bd
    await usuario.save();

    //redirigir
    req.flash('correcto', 'Password modificado correctamente');
    res.redirect('/iniciar-sesion');
}


