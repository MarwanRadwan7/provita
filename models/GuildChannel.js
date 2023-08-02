const mongoose = require('mongoose');

const guildChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  guildName: {
    type: String,
    required: true,
  },
});

const GuildChannel = mongoose.model('GuildChannel', guildChannelSchema);

module.exports = { GuildChannel };
