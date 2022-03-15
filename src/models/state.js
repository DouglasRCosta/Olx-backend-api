const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

const StateSchema = mongoose.Schema({
    name: {
        type: String
    }
});

const modelName = 'state';

if(mongoose.connection && mongoose.connection.models[modelName]){
    module.exports =  mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName , StateSchema);
}