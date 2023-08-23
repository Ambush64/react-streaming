const mongoose = require("mongoose")
const config = require('./config.js');
mongoose.connect(config.database.url)
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log('failed');
    })


const newSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const collection = mongoose.model("user-db", newSchema)

module.exports = collection
