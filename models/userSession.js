const mongoose = require('mongoose');

// Define the Mongoose schema for user sessions
const userSessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  conversationID: { type: String, required: true },
  responseID: { type: String, required: true },
  choiceID: { type: String, required: true },
  _reqID: { type: Number, required: true },
  user_username: { type: String, required: true },
});

// Create the UserSession model using the userSessionSchema
const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = { UserSession };
