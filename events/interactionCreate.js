const { CommandInteraction } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */

  execute: async (interaction, client) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error processing your command',
        ephemeral: true,
      });
    }
  },
};
