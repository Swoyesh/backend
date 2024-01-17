const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/iNotebook"

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connected to Mongo successfully!!");
    })
}

mongoose.set('strictQuery', false);

module.exports = connectToMongo;