const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Here is a list of all Provita commands.'),

  async execute(interaction) {
    let str = '';
    const commandFiles = fs
      .readdirSync('./commands')
      .filter((file) => file.endsWith('.js'));

    const embed = new MessageEmbed()
      .setTitle(`Provita Commands`)
      .setDescription('List all Provita commands.');

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      // str += `Name: ${command.data.name}, Description: ${command.data.description} \n`;
      const highlightedName = `\`${command.data.name}\``;
      embed.addField(highlightedName, command.data.description);
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: false,
      fetchReply: false,
    });
  },
};
