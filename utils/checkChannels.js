const {
  VoiceConnectionStatus,
  joinVoiceChannel,
  entersState,
} = require('@discordjs/voice');

async function errorHandler(error, interaction) {
  if (error.name === 'DiscordjsError') {
    console.error('Discord.js error:', error.message);
    await interaction.reply('An error occurred while playing media.');
  } else if (error.name === 'NotFoundError') {
    console.error('Media not found:', error.message);
    await interaction.reply('Invalid media URL.');
  } else if (error.name === 'JoinVoiceChannelError') {
    console.error('Failed to join the voice channel:', error.message);
    await interaction.reply(
      'Failed to join the voice channel. Make sure I have the required permissions.',
    );
  } else if (error.name === 'VoiceConnectionError') {
    console.error('Voice connection error:', error.message);
    await interaction.reply('Voice connection error occurred.');
  } else if (error.name === 'NotPlayingError') {
    console.error('Bot is not playing any media:', error.message);
    await interaction.reply('I am not currently playing anything.');
  } else if (error.name === 'UserNotInVoiceChannel') {
    console.error('User not in a voice channel:', error.message);
    await interaction.reply('You need to be in a voice channel to play media.');
  } else if (error.name === 'BotAlreadyPlaying') {
    console.error(
      'Bot is already playing media in a voice channel:',
      error.message,
    );
    await interaction.reply(
      'I am already playing media in another voice channel.',
    );
  } else {
    console.error('Unknown error:', error);
    await interaction.reply('An unknown error occurred.');
  }

  // Clean up the voice connection on any error
  const { voiceConnection } = interaction.guild;
  if (
    voiceConnection &&
    voiceConnection.state.status !== VoiceConnectionStatus.Destroyed
  ) {
    voiceConnection.destroy();
  }
}

module.exports = { errorHandler };
