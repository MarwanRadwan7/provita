const { SlashCommandBuilder } = require('@discordjs/builders');
const QR = require('../apis/googleQr');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('qr')
    .setDescription('Generate QR code for URL provided')
    .addStringOption((option) =>
      option.setName('url').setDescription(`URL to be encoded`),
    )
    .addStringOption((option) =>
      option.setName('height').setDescription(`height of the image`),
    )
    .addStringOption((option) =>
      option.setName('weight').setDescription(`weight of the image`),
    ),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    const height = interaction.options.getString('height');
    const width = interaction.options.getString('width');

    await interaction.reply(QR.generateQR(url, height, width));
  },
};
