const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');

const { checkVoiceChannel } = require('../utils/checkVoiceChannel');
const { embedMessage } = require('../utils/embedHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('noise')
    .setDescription('Play this background noise helps you to focus music.')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Choose what kind of noise you want to listen.')
        .addChoice('Brown 🏜️', 'brown')
        .addChoice('Black 🌑', 'black')
        .addChoice('White ❄️', 'white')
        .addChoice('Pink 🎈', 'pink')
        .addChoice('Raindrops 🌧️', 'raindrops')
        .addChoice('Ocean 🌊', 'ocean'),
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @returns {Promise<void>}
   */

  async execute(interaction) {
    const { distube } = interaction.client;

    const keywords = interaction.options.getString('type') || `Brown`;
    const query = `${keywords} noise relax live `;

    if (!query) {
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
        await distube.play(userVoiceChannel, query, {
          textChannel: interaction.channel.name,
          member: interaction.member.nickname,
        });

        const addedSong = queue.songs[queue.songs.length - 1];
        await interaction.followUp({
          embeds: [embedMessage('Added to the queue: ', 'ffa500', addedSong)],
        });
      } else {
        // If no queue exists, start playing the new song
        await distube.play(userVoiceChannel, query, {
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
