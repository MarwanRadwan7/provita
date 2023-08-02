const { SlashCommandBuilder } = require('@discordjs/builders');

const { embedMessage } = require('../utils/embedHandler');
const { checkVoiceChannel } = require('../utils/checkVoiceChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the current song queue'),

  async execute(interaction) {
    const { distube } = interaction.client;

    const userVoiceChannel = interaction.member.voice.channel;

    if (!userVoiceChannel) {
      return interaction.reply(
        'You need to be in a voice channel to use this command.',
      );
    }

    if (!checkVoiceChannel(interaction)) {
      return interaction.reply('You cannot perform this action.');
    }

    // Check if the bot is connected to a voice channel
    if (!distube.getQueue(interaction)) {
      return interaction.reply("There's no active queue.");
    }

    await interaction.deferReply({ ephemeral: false });

    // Retrieve the current queue
    const queue = distube.getQueue(interaction);

    // Display the current queue
    const queueEmbed = embedMessage('🎶 | Current Song Queue:', 'ffa500');
    queueEmbed.description = '';
    queue.songs.forEach((song, index) => {
      queueEmbed.description += `${index + 1}. [${song.name}](${song.url}) - ${
        song.formattedDuration
      }\n`;
    });

    await interaction.followUp({ embeds: [queueEmbed] });
  },
};
