const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { checkVoiceChannel } = require('../utils/checkVoiceChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the currently playing stream.'),

  /**
   * @param {CommandInteraction} interaction
   * @returns {Promise<void>}
   *
   */

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);

    const userVoiceChannel = interaction.member.voice.channel;

    if (!userVoiceChannel) {
      return interaction.reply(
        'You need to be in a voice channel to use this command.',
      );
    }

    if (!checkVoiceChannel(interaction)) {
      return interaction.reply('You cannot perform this action.');
    }

    await interaction.deferReply({ ephemeral: false });
    try {
      if (!queue) {
        return await interaction.followUp(
          'I am not currently playing any songs.',
        );
      }

      interaction.client.distube.shuffle(interaction.guild.id);
      return await interaction.followUp('Queue is Shuffled!');
    } catch (err) {
      console.error(err);
      return interaction.followUp('There is no song playing to shuffle.');
    }
  },
};
