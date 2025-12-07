const mongoose = require('mongoose');


async function connectDB() {
    try {
        mongoose.connect(process.env.MONGODB_URI).then(() => {
            console.log('Connected to MongoDB');
        }).catch((error) => {
            console.log('Error connecting to MongoDB', error);
        });
    } catch (error) {
        console.log('Error connecting to DB', error);
    }
}


module.exports = connectDB;