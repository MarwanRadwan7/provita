const {
  SlashCommandBuilder,
  SlashCommandMentionableOption,
} = require('@discordjs/builders');
const {
  ApplicationCommand,
  Interaction,
  Client,
  Permissions,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Mention the user you want to ban')
        .setRequired(true),
    ),

  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const member = interaction.options.getUser('user');

    // console.log(member);

    if (!member) {
      return interaction.reply(
        'You need to mention the member that you want to ban! ',
      );
    }

    if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
      return interaction.reply("You can't ban this user.");
    }

    if (!interaction.guild.me.permissions.has('BAN_MEMBERS')) {
      return interaction.reply('I do not have permission to ban members.');
    }

    // const userinfo = client.users.cache.getMember(member);
    // const guild = client.guilds.cache.get('your_guild_id_here');
    // const userinfo = client.users.cache.getMember(member.id);

    return interaction.guild.members
      .ban(member)
      .then(() => {
        interaction.reply({
          content: `${member.username} was banned.`,
          ephemeral: true,
        });
      })
      .catch((error) => {
        interaction.reply({
          content: `Sorry, an error occurred. \n ${error}`,
          ephemeral: true,
        });
      });
  },
};
