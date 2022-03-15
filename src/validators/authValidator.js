const { checkSchema } = require('express-validator');

module.exports = {
    signup: checkSchema({
        name: {
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Nome precisa ter pelo menos 2 caracteres'
        },
        email: {
            trim: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail invalido'
        },
        password: {
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Senha precisa ter pelo menos 2 caracteres'
        },
        state: {
            notEmpty: true,
            errorMessage: 'Estado nao preenchido'
        }
    }),
    signin: checkSchema({
        email: {
            trim: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail invalido'
        },
        password: {
            trim: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Senha invalida'
        }
    })

};
