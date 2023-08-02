// Import the Mongoose model for the guild channels
const { GuildChannel } = require('../models/GuildChannel');

module.exports = {
  name: 'guildCreate',

  async execute(guild) {
    console.log(`Joined new guild: ${guild.name}`);

    const categoryName = '✨PROVITA✨';
    const channelName = 'ask-provita';

    try {
      // Find or create the category named "provita"
      const category =
        guild.channels.cache.find(
          (channel) =>
            channel.type === 'GUILD_CATEGORY' && channel.name === categoryName,
        ) ||
        (await guild.channels.create(categoryName, { type: 'GUILD_CATEGORY' }));

      // Check if the guild already has a stored channel in the database
      const guildChannel = await GuildChannel.findOne({ guildId: guild.id });

      let channel;

      if (guildChannel && guildChannel.channelId) {
        // If the guild has a stored channel ID, use it to fetch the channel
        channel = guild.channels.cache.get(guildChannel.channelId);
      }

      if (!channel) {
        // If the channel is not found or not stored, create a new one
        channel = await guild.channels.create(channelName, {
          type: 'GUILD_TEXT',
          parent: category,
        });

        // Store the created channel in the database
        await GuildChannel.findOneAndUpdate(
          { guildId: guild.id },
          { channelId: channel.id, guildName: guild.name },
          { upsert: true, new: true },
        );
      }

      // Make a welcome message and pin it to provita message channel
      const welcomeMessage = `Hello, 👋🏻 I am Provita, a Discord bot that can help you study and focus with your friends, powered by AI. You can chat with me in the **ask-provita** channel or use my slash commands in all text channels. For help, use the \`/help\` command and see what I can do 😊. If the **ask-provita** channel is deleted, then invite me to the server again. Have a nice day ❤️.`;
      const sendWelcomeMessage = await channel.send(welcomeMessage);
      await sendWelcomeMessage.pin();
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  },
};
