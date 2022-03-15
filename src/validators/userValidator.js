const { checkSchema } = require('express-validator');

module.exports = {
   editAction: checkSchema({
       token:{
           notEmpty:true
       },
        name: {
            optional:true,
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Nome precisa ter pelo menos 2 caracteres'
        },
        email: {
            optional:true,
            trim: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail invalido'
        },
        password: {
            optional:true,
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Senha precisa ter pelo menos 2 caracteres'
        },
        state: {
            optional:true,
            errorMessage: 'Estado nao preenchido'
        }
    })

};
