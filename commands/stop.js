const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { checkVoiceChannel } = require('../utils/checkVoiceChannel');
const { embedMessage } = require('../utils/embedHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the currently playing queue.'),

  async execute(interaction) {
    const { distube } = interaction.client;

    const userVoiceChannel = interaction.member.voice.channel;

    if (!userVoiceChannel) {
      return interaction.reply(
        'You need to be in a voice channel to use this command.',
      );
    }

    if (!checkVoiceChannel(interaction)) {
      return interaction.reply('You cannot perform this action.');
    }

    const queue = distube.getQueue(interaction.guild.id);

    if (!queue) {
      return interaction.reply('I am not currently playing any songs.');
    }

    await interaction.deferReply({ ephemeral: false });

    distube.stop(interaction);
    await interaction.followUp({
      embeds: [embedMessage('🎶 | The current queue is stopped! ', '#ff0000')],
    });
  },
};
