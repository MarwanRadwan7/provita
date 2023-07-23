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

const yt = require('../apis/youtubeAPI').youtubeSearch;
const { checkSameVoiceChannel } = require('../utils/checkChannels');

function containsLive(sentence) {
  // Use the "i" flag in the regular expression to perform a case-insensitive search
  const regex = /\blive\b/i;
  return regex.test(sentence);
}

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

    await interaction.deferReply();
    const songs = await yt(songQuery);
    let songURL;
    let songTitle;
    let i = 0;

    if (containsLive(songQuery)) {
      // console.log('live :))');
      // while (songs.kind !== 'youtube#video' && i < 10) {
      //   songURL = songs[i].link;
      //   songTitle = songs[i].title;
      //   const liveDetails = (await ytdl.getBasicInfo(songURL)).player_response
      //     .videoDetails;
      //   const isLowLatencyLiveStream = liveDetails.isLowLatencyLiveStream;
      //   const isLiveContent = liveDetails.isLiveContent;
      //   i++;
      //   if (isLiveContent && isLowLatencyLiveStream) break;
      // for (let song of songs) {
      //   songURL = songs[i].link;
      //   songTitle = songs[i].title;
      //   const liveDetails = (await ytdl.getBasicInfo(songURL)).player_response
      //     .videoDetails;
      //   const isLowLatencyLiveStream = liveDetails.isLowLatencyLiveStream;
      //   const isLiveContent = liveDetails.isLiveContent;
      //   if (
      //     isLiveContent &&
      //     song.kind !== 'youtube#video' &&
      //     i < 10 &&
      //     isLiveContent &&
      //     isLowLatencyLiveStream
      //   )
      //     continue;
      //   else break;
      // }
      return await interaction.editReply(
        `Use **/live** command instead to play live audios from youtube`,
      );
    } else {
      for (let song of songs) {
        //songs.kind !== 'youtube#video' && i < 10

        const isLiveContent = (await ytdl.getBasicInfo(songURL)).player_response
          .videoDetails.isLive;
        console.log(isLiveContent);
        if (!isLiveContent && song.kind !== 'youtube#video') {
          songURL = song.link;
          songTitle = song.title;
          break;
        }
      }
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
      return interaction.editReply({
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
            begin: '0',
            liveBuffer: 50000,
          });
          const nextResource = createAudioResource(nextStream);

          player.play(nextResource);
          interaction.editReply({
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

    await interaction.editReply({
      content: `Now playing: ${songTitle}`,
      ephemeral: false,
      fetchReply: false,
    });
  },
};

module.exports.songQueue = songQueue;
