const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('brown')
    .setDescription('Play a song'),

  async execute(interaction) {
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

    const audioPlayer = createAudioPlayer();
    const audioResource = createAudioResource(
      '/home/marwan/Desktop/Super Deep Brown Noise.mp3',
    );

    audioPlayer.play(audioResource);

    connection.subscribe(audioPlayer);

    await interaction.reply('Now playing.');

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
  },
};
