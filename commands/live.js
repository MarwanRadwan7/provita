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

const { songQueue } = require('./play'); // Assuming 'play.js' contains the play command logic
const yt = require('../apis/youtubeAPI').youtubeSearch;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('live')
    .setDescription('Start playing a live stream from YouTube')
    .addStringOption((option) =>
      option
        .setName('stream')
        .setDescription('The live stream to play')
        .setRequired(true),
    ),

  async execute(interaction) {
    const songQuery = interaction.options.getString('stream');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.editReply(
        'You need to be in a voice channel to use this command.',
      );
    }

    await interaction.deferReply();
    // if (containsLive(songQuery)) {
    //   // console.log('live :))');
    //   // while (songs.kind !== 'youtube#video' && i < 10) {
    //   //   songURL = songs[i].link;
    //   //   songTitle = songs[i].title;
    //   //   const liveDetails = (await ytdl.getBasicInfo(songURL)).player_response
    //   //     .videoDetails;
    //   //   const isLowLatencyLiveStream = liveDetails.isLowLatencyLiveStream;
    //   //   const isLiveContent = liveDetails.isLiveContent;
    //   //   i++;
    //   //   if (isLiveContent && isLowLatencyLiveStream) break;

    //   // }
    //   return await interaction.editReply(
    //     `Use **/live** command instead to play live audios from youtube`,
    //   );
    // } else {
    //   for (let song of songs) {
    //     //songs.kind !== 'youtube#video' && i < 10
    //     songURL = song.link;
    //     songTitle = song.title;
    //     const isLiveContent = (await ytdl.getBasicInfo(songURL)).player_response
    //       .videoDetails.isLive;
    //     console.log(isLiveContent);
    //     if (isLiveContent && song.kind !== 'youtube#video') continue;
    //     else break;
    //   }
    // }
    try {
      const songs = await yt(songQuery);
      let songURL;
      let songTitle;
      // let i = 0;

      for (let song of songs) {
        songURL = song.link;
        songTitle = song.title;
        const liveDetails = (await ytdl.getBasicInfo(songURL)).player_response
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
      console.log(songURL, songTitle);
      // console.log(
      //   (await ytdl.getBasicInfo(songURL)).player_response.videoDetails,
      // );
      const songId = ytdl.getVideoID(songURL);
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
        status: 'playing',
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);

      const stream = ytdl(songId, {
        filter: 'audioonly',
        quality: 'highest',
        // liveBuffer: 50000,
      });

      const resource = createAudioResource(stream);
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });

      connection.subscribe(player);
      player.play(resource);
      songQueue.set(interaction.guildId, {
        voiceChannel,
        textChannel: interaction.channel,
        connection,
        isLive: true,
      });

      await interaction.editReply({
        content: `Now playing the live stream: ${songTitle}`,
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
