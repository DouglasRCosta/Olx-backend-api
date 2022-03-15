
const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

const CategorySchema = mongoose.Schema({
    name: {
        type: String
    },
    slug: {
        type: String
    }
});

const modelName = 'Category';

if(mongoose.connection && mongoose.connection.models[modelName]){
    module.exports =  mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName , CategorySchema);
}