// live.js

const { CommandInteraction, Interaction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  createAudioResource,
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const { songQueue } = require('../commands/play'); // Assuming 'play.js' contains the play command logic
const yt = require('../apis/youtubeAPI').youtubeSearch;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lofi')
    .setDescription('Play LoFi music.')
    .addStringOption((option) =>
      option
        .setName('keywords')
        .setDescription('genres or keywords if you want'),
    ),

  async execute(interaction) {
    const keywords = interaction.options.getString('keywords') || ``;
    const songQuery = `lofi live + ${keywords}`;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.editReply(
        'You need to be in a voice channel to use this command.',
      );
    }

    await interaction.deferReply();
    try {
      const songs = await yt(songQuery);
      let songURL;
      let songTitle;

      for (let song of songs) {
        songURL = song.link;
        songTitle = song.title;
        const liveDetails = (await ytdl.getInfo(songURL)).player_response
          .videoDetails;
        const isLowLatencyLiveStream = liveDetails.isLowLatencyLiveStream;
        const isLiveContent = liveDetails.isLiveContent;
        if (
          isLiveContent &&
          song.kind !== 'youtube#video' &&
          i < 10 &&
          isLiveContent &&
          isLowLatencyLiveStream
        )
          continue;
        else break;
      }

      const songId = ytdl.getVideoID(songURL);
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
        status: 'playing',
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 200000);

      const stream = ytdl(songId, {
        filter: 'audioandvideo',
        quality: 'highest',
        liveBuffer: 10000000,
        // format: {
        //   // isLive: true,
        //   isHLS: true,
        // },
      });

      const resource = createAudioResource(stream);
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });

      // console.log(resource);

      connection.subscribe(player);
      player.play(resource);
      songQueue.set(interaction.guildId, {
        voiceChannel,
        textChannel: interaction.channel,
        connection,
        isLive: true,
      });

      await interaction.editReply({
        content: `Now playing: ${songTitle}`,
        ephemeral: false,
        fetchReply: false,
      });
    } catch (error) {
      console.error('Error starting live stream:', error);
      await interaction.editReply({
        content: 'An error occurred while starting the live stream.',
        ephemeral: false,
        fetchReply: false,
      });
    }
  },
};
