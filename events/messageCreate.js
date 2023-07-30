const { Client, Message } = require('discord.js');
const { join } = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = join(__dirname, '../data/guildChannel.db');
const { init, Chat } = require('../apis/bardAPI');
const { dbGetAsync, dbRunAsync } = require('../utils/dbAsync');

const cookies = process.env.BARD_KEY;

module.exports = {
  name: 'messageCreate',

  /**
   * @param {Message} message
   */

  async execute(message) {
    // Check if the message is sent by a bot, if it is, do nothing
    if (message.author.bot) return;

    const { guild } = message;
    const categoryName = '✨PROVITA✨';
    const channelName = 'ask-provita';
    const thankingRegex = /\b(thank\s*you|thx|thanks?|thank\s+u)\b/i;
    const salutingRegex = /\b(hello|hi|hey)\b/i;

    try {
      // Connect to the SQLite database
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error connecting to the database:', err);
        else {
          // Create a table for user's sessions if it doesn't exist
          db.run(`
            CREATE TABLE IF NOT EXISTS user_session (
              user_id TEXT,
              conversationID TEXT,
              responseID TEXT ,
              choiceID TEXT,
              _reqID INTEGER,
              user_username TEXT
            )
          `);
        }
      });

      // Check if the message is sent in the provita channel
      const category = guild.channels.cache.find(
        (channel) =>
          channel.type === 'GUILD_CATEGORY' && channel.name === categoryName,
      );

      if (!category || message.channel.parentId !== category.id) {
        return;
      }

      // Get the session info from the database using async/await
      const query = `SELECT user_id, conversationID, responseID, choiceID, _reqID FROM user_session WHERE user_id = ?  LIMIT 1 `;
      let userData;
      try {
        userData = await dbGetAsync(db, query, [message.author.id]);
      } catch (error) {
        console.error('Error querying database:', error);
      }

      // !! Removed channel logic to guildCreate

      await message.channel.sendTyping();

      // Respond to the message in the created channel
      const originalQuestion = message.content;
      const question = originalQuestion;

      if (thankingRegex.test(originalQuestion)) {
        await message.react('❤️');
      }
      if (salutingRegex.test(originalQuestion)) {
        await message.react('👋🏻');
      }

      let response;

      if (!userData) {
        await init(cookies);
        const conversation = new Chat();
        response = await conversation.ask(question);
        userData = await conversation.export();

        // Store session data in the database
        try {
          const insertQuery = `INSERT OR REPLACE INTO user_session (user_id , conversationID , responseID , choiceID , _reqID , user_username) VALUES (?,?,?,?,?,?)`;
          await dbRunAsync(db, insertQuery, [
            message.author.id,
            userData.conversationID,
            userData.responseID,
            userData.choiceID,
            userData._reqID,
            message.author.username,
          ]);
        } catch (error) {
          console.error('Error inserting data into database:', error);
        }
      } else {
        await init(cookies);
        const conversation = new Chat({
          conversationID: userData.conversationID,
          responseID: userData.responseID,
          choiceID: userData.choiceID,
          _reqID: userData._reqID,
        });
        response = await conversation.ask(question);
        const updatedSession = await conversation.export();

        // Store session data in the database
        try {
          const updateQuery = `
          UPDATE user_session
          SET conversationID = ?,
              responseID = ?,
              choiceID = ?,
              _reqID = ?
          WHERE user_id = ?`;
          await dbRunAsync(db, updateQuery, [
            updatedSession.conversationID,
            updatedSession.responseID,
            updatedSession.choiceID,
            updatedSession._reqID,
            message.author.id,
          ]);
        } catch (error) {
          console.error('Error updating data in the database:', error);
        }
      }

      await message.reply({
        content: response,
        attachments: {
          ephemeral: true,
        },
      });

      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database connection:', err);
        }
      });
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  },
};
