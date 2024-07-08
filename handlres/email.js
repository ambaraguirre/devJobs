const emailConfig = require('../config/email.js');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');
const path = require('path')


let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth:{
        user : emailConfig.user,
        pass: emailConfig.pass
    }
});

// Configurar Handlebars como el motor de vista
transport.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        partialsDir: path.join(__dirname, '../views/emails'),
        layoutsDir: path.join(__dirname, '../views/emails'),
        defaultLayout: false,
    },
    viewPath: path.join(__dirname, '../views/emails'),
    extName: '.handlebars'
}));

exports.enviar = async ( opciones ) =>{
    const opcionesEmail = {
        from: 'devJobs <noreplay@devjobs.com',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.reseUrl
        }
    }
    
    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}