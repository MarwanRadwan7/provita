const { MessageEmbed } = require('discord.js');

/**
 * @param {String} title The title of the embed message.
 * @param {Song} song Song object that has the name, duration and thumbnail.
 * @param {HexColorString} color Color of the ebbed message.
 * @returns {MessageEmbed} MessageEmbed object that will sent to the user.
 */

const embedMessage = function (title,color , song = undefined) {
  const embed = new MessageEmbed().setTitle(title).setColor(color);
  if (song) {
    embed.setDescription(song.name).setThumbnail(song.thumbnail).addFields({
      name: 'Duration',
      value: song.formattedDuration,
      inline: true,
    });
  }

  return embed;
};

module.exports = { embedMessage };
