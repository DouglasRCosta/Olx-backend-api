require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileupload = require('express-fileupload');

const apiRoutes = require('./src/routes/routes');

mongoose.connect(process.env.DATABASE || `mongodb://127.0.0.1:27017/olx`, {
    useUnifiedTopology: true
});

mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => {
    console.log("Erro ", error.message);
})

const server = express();

server.use(cors());

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileupload());

server.use(express.static(__dirname + '/public'));

server.use('/', apiRoutes);

server.listen(process.env.PORT || '5000', () => {
    console.log('rodando ' + process.env.BASE||'http://localhost:5000')
});