// permissions.js
const { GuildMember, VoiceChannel } = require('discord.js');

/**
 * Check if the user has the necessary permissions and is in the correct voice channel.
 * @param {GuildMember} member - The GuildMember to check permissions for.
 * @param {VoiceChannel} voiceChannel - The VoiceChannel the user should be in.
 * @returns {boolean} - Whether the user has the necessary permissions and is in the correct voice channel.
 */
function hasPermissionsAndInVoiceChannel(member, voiceChannel) {
  if (!member || !(member instanceof GuildMember) || !voiceChannel || !(voiceChannel instanceof VoiceChannel)) {
    return false;
  }

  // Check if the user has the 'CONNECT' permission in the voice channel
  const hasConnectPermission = voiceChannel.permissionsFor(member).has('CONNECT');
  // Check if the user has the 'SPEAK' permission in the voice channel
  const hasSpeakPermission = voiceChannel.permissionsFor(member).has('SPEAK');

  return hasConnectPermission && hasSpeakPermission;
}

module.exports = {
  hasPermissionsAndInVoiceChannel,
};