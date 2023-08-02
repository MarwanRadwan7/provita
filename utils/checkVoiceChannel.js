const { GuildMember, VoiceChannel, CommandInteraction } = require('discord.js');

/**
 * Check if the user and the bot are in the correct voice channel.
 * @param {CommandInteraction} interaction - An object contains <GuildMember> and <VoiceChannel> objects
 * @returns {boolean} - Whether the user has the necessary permissions and is in the correct voice channel.
 */
function checkVoiceChannel(interaction) {
  const userVoiceChannelID = interaction.member.voice.channel.id;
  const botVoiceChannelID = interaction.guild.members.me.voice.channelId;

  if (!botVoiceChannelID) return true;

  return userVoiceChannelID === botVoiceChannelID;
}

module.exports = {
  checkVoiceChannel,
};
