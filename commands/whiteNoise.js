const { CommandInteraction } = require('discord.js');
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('white')
    .setDescription('Play a song')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The song to play')
        .setRequired(true),
    ),

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

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.reply(`Now playing: ${songTitle}`);
  },
};
