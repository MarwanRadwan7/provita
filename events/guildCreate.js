const { Guild, Client } = require('discord.js');
const { join } = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = join(__dirname, '../data/guildChannel.db');

const { dbGetAsync, dbRunAsync } = require('../utils/dbAsync');

module.exports = {
  name: 'guildCreate',
  once: true,

  /**
   * @param {Guild} guild
   */

  async execute(guild) {
    console.log(`Joined new guild: ${guild.name}`);

    const categoryName = '✨PROVITA✨';
    const channelName = 'ask-provita';

    // Connect to the SQLite database or create one if it doesn't exist
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
      } else {
        console.log('Connected to the SQLite database.');
        // Create the table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS guild_channels (
        guild_id TEXT,
        channel_id TEXT,
        server_name TEXT)`);
      }
    });
    try {
      // Find or create the category named "provita"
      const category =
        guild.channels.cache.find(
          (channel) =>
            channel.type === 'GUILD_CATEGORY' && channel.name === categoryName,
        ) ||
        (await guild.channels.create(categoryName, { type: 'GUILD_CATEGORY' }));

      // Check if the guild already has a stored channel ID in the database
      const query = `SELECT channel_id FROM guild_channels WHERE guild_id = ? LIMIT 1 `;
      const row = await dbGetAsync(db, query, [guild.id]);

      let channel;

      if (row && row.channel_id) {
        // If the guild has a stored channel ID, use it to fetch the channel
        channel = guild.channels.cache.get(row.channel_id);
      }

      if (!channel) {
        // If the channel is not found or not stored, create a new one
        channel = await guild.channels.create(channelName, {
          type: 'GUILD_TEXT',
          parent: category,
        });

        // Store the created channel ID in the database
        const insertQuery = `INSERT OR REPLACE INTO guild_channels (guild_id, channel_id, server_name) VALUES (?, ?, ?)`;
        await dbRunAsync(db, insertQuery, [guild.id, channel.id, guild.name]);
      }

      console.log(
        `Channel ${channelName} created in ${categoryName} category.`,
      );

      // Set up a message event handler to respond to messages in the channel
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  },
};
