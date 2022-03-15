const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    state: {
        type: String
    },
    passwordHash: {
        type: String
    },
    token: {
        type: String
    }
});

const modelName = 'User';

if(mongoose.connection && mongoose.connection.models[modelName]){
    module.exports =  mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName , UserSchema);
}