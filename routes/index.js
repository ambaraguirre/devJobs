const express = require("express");
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const vacantesController = require('../controllers/vacantesController.js');
const usuariosController = require('../controllers/usuariosController.js');
const authController = require('../controllers/authController.js');
module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //crear vacantes
    router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.agregarVacante)

    //mostrar vacante singular
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //editar vacante 
    router.get('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.editarVacante);

    //crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario);

    //autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //cerrar sesion
    router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);

    //resetear password
    router.get('/restablecer-password', authController.formRestablecerPassword);
    router.post('/restablecer-password', authController.enviarToken);
    //resetear passsword(almacenar en la base de datos)
    router.get('/restablecer-password/:token', authController.restablecerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);

    //panel de administracion
    router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);

    //editar perfil
    router.get('/editar-perfil', authController.verificarUsuario, usuariosController.formEditarPerfil);
    router.post('/editar-perfil', authController.verificarUsuario, 
        usuariosController.subirImagen,
        usuariosController.editarPerfil);

    //eliminar vacantes
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);


    // router.get('/ejemplo', (req, res) => {
    //     console.log(req.user); // Mostrará todo el objeto req en la consola
    
    //     // Puedes continuar con el manejo de la solicitud aquí
    //     res.send('Respuesta enviada');
    // });
    

    //recibir mensajes de candidatos
    router.post('/vacantes/:url',vacantesController.subirCV, vacantesController.contactar);


    //muestra los candidatos por vacante
    router.get('/candidatos/:id', authController.verificarUsuario, vacantesController.mostrarCandidatos);

    //buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes);

    

    return router;
}