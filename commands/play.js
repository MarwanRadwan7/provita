const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const { YouTube } = require('youtube-sr');

function createVolumeControl(volume) {
  return {
    type: 'VolumeTransformer',
    volume: volume,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Name of the song')
        .setRequired(true),
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');

    // Search for the song on YouTube
    const searchResults = await YouTube.search(query, { limit: 1 });

    if (!searchResults.length) {
      await interaction.reply('Song not found.');
      return;
    }

    const video = searchResults[0];
    console.log(video);

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply(
        'You need to be in a voice channel to use this command.',
      );
      return;
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const audioURL = video.url.replace('watch?v=', 'embed/');
    const audioPlayer = createAudioPlayer();
    const audioResource = createAudioResource(audioURL);
    const volumeControl = createVolumeControl(0.5);

    audioResource.volumeControl = volumeControl;

    audioPlayer.play(audioResource);

    connection.subscribe(audioPlayer);
    await interaction.reply(`Now playing: ${video.title}`);

    audioPlayer.on('stateChange', (state) => {
      if (state.status === AudioPlayerStatus.Idle) {
        connection.destroy();
      }
    });
  },
};
