require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URL;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectToMongo = async () => {
  try {
    await mongoose.connect(uri, options);
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

module.exports = {
  connectToMongo,
};
