const { validationResult, matchedData } = require('express-validator');

const mongoose = require('mongoose');
const User = require('../models/user');
const State = require('../models/state')
const bcript = require('bcrypt');

module.exports = {
    signin: async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.json({ error: error.mapped() })
            return;
        }
        let data = matchedData(req);
        //validando email
        let user = await User.findOne({
            email: data.email
        })
        if (!user) {
            res.json({ error: 'Email e/ou senha invalido.' });
            return
        }
        //validando senha

        let match = await bcript.compare(data.password, user.passwordHash);
        if (!match) {
            res.json({ error: 'Email e/ou senha invalido.' });
            return
        }

        const payload = (Date.now() + Math.random()).toString();

        const token = await bcript.hash(payload, 10);

        user.token = token;
        await user.save();

        res.json({ token })

    },
    signup: async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.json({ error: error.mapped() })
            return;
        }
        let data = matchedData(req);

        // verificar se existe email
        const userEmail = await User.findOne({
            email: data.email
        });
        if (userEmail) {
            res.json({
                error: {
                    email: {
                        msg: 'email ja cadastrado'
                    }
                }
            });
            return;
        }
        // verificar estado
        if (mongoose.Types.ObjectId.isValid(data.state)) {

            const stateItem = await State.findById(data.state);
            if (!stateItem) {
                res.json({
                    error: {
                        state: {
                            msg: 'estado nao existe'
                        }
                    }
                });
                return;
            }
        } else {
            res.json({
                error: {
                    state: {
                        msg: 'estado incorreto'
                    }
                }
            });
            return;
        }

        const passwordHash = await bcript.hash(data.password, 10);
        const payload = (Date.now() + Math.random()).toString();

        const token = await bcript.hash(payload, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash: passwordHash,
            token,
            state: data.state
        });
        await newUser.save();




        res.json({ token })
    }
}