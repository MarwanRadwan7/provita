const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { checkVoiceChannel } = require('../utils/checkVoiceChannel');
const { embedMessage } = require('../utils/embedHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lofi')
    .setDescription('Play LoFi music.')
    .addStringOption((option) =>
      option
        .setName('keywords')
        .setDescription('genres or keywords if you want'),
    ),

  /**
   *
   * @param {CommandInteraction} interaction
   * @returns {Promise<void>}
   */

  async execute(interaction) {
    const { distube } = interaction.client;

    const keywords = interaction.options.getString('keywords') || ``;
    const songQuery = `lofi beats live ${keywords}`;

    if (!songQuery) {
      return interaction.reply('Please provide a song to play.');
    }

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
      const queue = distube.getQueue(interaction);

      if (queue) {
        // If a queue already exists, add the new song to the queue
        await distube.play(userVoiceChannel, songQuery, {
          textChannel: interaction.channel.name,
          member: interaction.member.nickname,
        });

        const addedSong = queue.songs[queue.songs.length - 1];
        await interaction.followUp({
          embeds: [embedMessage('Added to the queue: ', 'ffa500', addedSong)],
        });
      } else {
        // If no queue exists, start playing the new song
        await distube.play(userVoiceChannel, songQuery, {
          textChannel: interaction.channel.name,
          member: interaction.member.nickname,
          addToQueue: true, // This will start the autoplay feature when the queue is empty
        });

        const nowPlaying = distube.getQueue(interaction).songs[0];
        await interaction.followUp({
          embeds: [embedMessage('🎶 | Now playing:', '#00ff00', nowPlaying)],
        });

        // Listen for the songChanged event to update the now playing message when the bot moves to the next song
        distube.on('playSong', async (queue, newSong) => {
          await interaction.followUp({
            embeds: [embedMessage('🎶 | Now playing:', '#00ff00', newSong)],
          });
        });
        distube.on('disconnect', async (botQueue) => {
          botQueue.stop();
        });
      }
    } catch (error) {
      console.error('Error playing song:', error);
      interaction.followUp('An error occurred while playing the song.');
    }
  },
};
