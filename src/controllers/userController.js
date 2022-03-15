const { validationResult, matchedData } = require('express-validator');

const Category = require('../models/category');
const State = require('../models/state');
const User = require('../models/user')
const Ad = require('../models/ad');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');


module.exports = {
    getState: async (req, res) => {
        let states = await State.find({ name: { $regex: '' } });
        res.json({
            states: states,
        })
        return;
    },
    info: async (req, res) => {
        let token = req.query.token || req.body.token;

        const user = await User.findOne({ token });
        const state = await State.findById(user.state);
        const ads = await Ad.find({ idUser: user._id.toString() })
        let adsList = [];
        for (let i in ads) {
            let cat = await Category.find({ slug: ads[i].category });

            adsList.push({
                id: ads[i]._id,
                name: ads[i].name,
                state: ads[i].state,
                images: ads[i].images,
                dateCreated: ads[i].dateCreated,
                title: ads[i].title,
                price: ads[i].price,
                priceNegotiable: ads[i].priceNegotiable,
                description: ads[i].description,
                viwes: ads[i].viwes,
                status: ads[i].status,
                category: cat.slug
            })
        }

        res.json({
            user: {
                name: user.name,
                email: user.email,
                state: state.name
            },
            ads: adsList
        });
    },
    editAction: async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.json({ error: error.mapped() })
            return;
        }
        let data = matchedData(req);
        let updates = {};

        if (data.name) {
            updates.name = data.name;
        }

        if (data.email) {
            let emailCheck = await User.findOne({ email: data.email });
            if (emailCheck) {
                res.json({ error: 'email ja existente' });
                return
            } else {
                updates.email = data.email;
            };
        };
        if (data.state) {
            if (mongoose.Types.ObjectId.isValid(data.state)) {
                let checkState = await State.findById(data.state)
                if (!checkState) {
                    res.json({ error: 'estado nao existe' });
                    return;
                };
                updates.state = data.state;
            };
        };
        if (data.password) {
            let passwordHash = await bcrypt.hash(data.password, 10);
            updates.passwordHash = passwordHash;
        };


        await User.findOneAndUpdate({ token: data.token }, { $set: updates });
        res.json({ updates })
    }
}