module.exports ={
    seleccionarSkills : (seleccionados = [], opciones)=>{
        const skills = ['HTML5' ,'CSS3' ,'Node', 'CSSGrid', 'Flexbox' ,'Angular', 'VueJS', 'ReactJS', 'React Hooks' , 'JavaScript', 'jQuery' , 'GraphQL', 'TypeScript', 'PHP', 'Redux', 'Apollo' ,'Laravel', 'Symfony' , 'ORM', 'Sequelize', 'Mongoose' , 'Python', 'Django' , 'SQL' , 'MVC' , 'SASS', 'WordPress' ]; 

        let html = '';
        skills.forEach(skill =>{
            html += `
                <li ${seleccionados.includes(skill)  ? 'class="activo"' : ''}>${skill}</li>
            `;
        });

        return opciones.fn().html = html;

    },

    tipoContrato: (seleccionado, opciones) =>{
        return opciones.fn(this).replace(
            new RegExp(`value="${seleccionado}"`), '$& selected="selected"'
        )
    },
    mostrarAlertas: (errores = {}, alertas) =>{
        const categoria = Object.keys(errores);

        let html = '';

        if(categoria.length){
            errores[categoria].forEach(error => {
                html += ` <div class="${categoria} alerta">
                        ${error}
              </div>  `;
            })
        }

       return alertas.fn().html = html;
    }
}