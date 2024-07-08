const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante');


exports.mostrarTrabajos = async(req,res,next)=>{

    const vacantes = await Vacante.find();


    if(!vacantes) return next();

    res.render('home',{
        nombrePagina: 'devJobs',
        tagLine: 'Encuentra y pública trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes
    })
}