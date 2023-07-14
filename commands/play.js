const { CommandInteraction, Interaction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  createAudioResource,
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const yt = require('../apis/youtubeAPI').youtubeSearch;
const { checkBot } = require('../utils/checkChannels');

const songQueue = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play an audio from youtube')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The song to play')
        .setRequired(true),
    ),

  /**
   * @param {Interaction} interaction
   */

  async execute(interaction) {
    const songQuery = interaction.options.getString('song');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply(
        'You need to be in a voice channel to use this command.',
      );
    }

    const songs = await yt(songQuery);

    const songURL = songs[0].link;
    const songTitle = songs[0].title;
    const songId = ytdl.getVideoID(songURL);

    console.log(songURL, songTitle);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true,
    });

    const stream = ytdl(songId, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });

    const resource = createAudioResource(stream);
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    // Check if there is already a song playing or in the queue
    if (songQueue.has(interaction.guildId)) {
      const queue = songQueue.get(interaction.guildId);
      queue.songs.push({ url: songURL, title: songTitle });
      return interaction.reply({
        content: `Added to queue: ${songTitle}`,
        ephemeral: false,
        fetchReply: false,
      });
    }

    // If no songs in the queue, play the current song
    const queueConstruct = {
      voiceChannel,
      textChannel: interaction.channel,
      connection,
      songs: [{ url: songURL, title: songTitle }],
      volume: 5,
      playing: true,
    };

    songQueue.set(interaction.guildId, queueConstruct);

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      if (songQueue.has(interaction.guildId)) {
        const queue = songQueue.get(interaction.guildId);
        queue.songs.shift(); // Remove the first song from the queue

        if (queue.songs.length > 0) {
          const nextSong = queue.songs[0];
          const nextStream = ytdl(ytdl.getVideoID(nextSong.url), {
            filter: 'audioonly',
            quality: 'highestaudio',
          });
          const nextResource = createAudioResource(nextStream);

          player.play(nextResource);
          interaction.followUp({
            content: `Now playing: ${songTitle}`,
            ephemeral: false,
            fetchReply: false,
          });
        } else {
          // Queue is empty, destroy the connection
          connection.destroy();
          songQueue.delete(interaction.guildId);
        }
      }
    });

    await interaction.reply({
      content: `Now playing: ${songTitle}`,
      ephemeral: false,
      fetchReply: false,
    });
  },
};
