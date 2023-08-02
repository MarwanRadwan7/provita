const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { checkVoiceChannel } = require('../utils/checkVoiceChannel');
const { embedMessage } = require('../utils/embedHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('Play the next song in the queue'),

  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const userVoiceChannel = interaction.member.voice.channel;

    if (!userVoiceChannel) {
      return interaction.reply(
        'You need to be in a voice channel to use this command.',
      );
    }

    if (!checkVoiceChannel(interaction)) {
      return interaction.reply('You cannot perform this action.');
    }

    try {
      const queue = interaction.client.distube.getQueue(interaction.guild.id);

      if (!queue || queue.songs.length <= 1) {
        return interaction.reply('There are no songs to play.');
      }
      await interaction.deferReply({ ephemeral: false });

      await interaction.client.distube.skip(interaction.guild.id);
      await interaction.followUp({
        embeds: [embedMessage('🎶 | Playing the next song!', '#E1C16E')],
      });
    } catch (err) {
      console.error(err);
      await interaction.followUp('Error happened, try again!');
    }
  },
};
