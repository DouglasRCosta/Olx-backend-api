const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

const AdSchema = mongoose.Schema({

    idUser: {
        type: String
    },
    name: {
        type: String
    },
    state: {
        type: String
    },
    category: {
        type: String
    },
    images: {
        type: [Object]
    },
    dateCreated: {
        type: Date
    },
    title: {
        type: String
    },
    price: {
        type: Number
    },
    priceNegotiable: {
        type: Boolean
    },
    description: {
        type: String
    },
    views: {
        type: Number
    },
    status: {
        type: String
    },
});

const modelName = 'Ad';

if (mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection.models[modelName];
} else {
    module.exports = mongoose.model(modelName, AdSchema);
}