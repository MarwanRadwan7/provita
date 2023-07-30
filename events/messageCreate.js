/* eslint-disable */

require('dotenv').config();
const { Client, Message, GuildEmoji } = require('discord.js');
const { join } = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = join(__dirname, '../data/guildChannel.db');
const { init, askAI, Chat } = require('../apis/bardAPI');

const cookies = process.env.BARD_KEY;

const bardInit = async () => {
  await init(cookies);
};

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
          // Create a table for user 's sessions if it isn't exist
          console.log('Connected to the SQLite database.');
          db.run(`
            CREATE TABLE IF NOT EXISTS user_session (
              user_id TEXT,
              conversationID TEXT,
              responseID TEXT ,
              choiceID TEXT,
              _reqID INTEGER
            )
          `);
        }
      });

      // Check if the message is sent in the created channel
      const category = guild.channels.cache.find(
        (channel) =>
          channel.type === 'GUILD_CATEGORY' && channel.name === categoryName,
      );

      if (!category || message.channel.parentId !== category.id) {
        return;
      }

      // Check if the guild already has a stored channel ID in the database
      const query = `SELECT channel_id FROM guild_channels WHERE guild_id = ?`;
      db.get(query, [guild.id], async (err, row) => {
        if (err) {
          console.error('Error querying database:', err);
          return;
        }

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
          const insertQuery = `INSERT OR REPLACE INTO guild_channels (guild_id, channel_id) VALUES (?, ?)`;
          db.run(insertQuery, [guild.id, channel.id], (err) => {
            if (err) {
              console.error('Error inserting data into database:', err);
            }
          });
        }

        console.log(
          `Channel ${channelName} is found in ${categoryName} category.`,
        );

        let userData;

        // Get the session info from the database
        const query = `SELECT user_id, conversationID ,responseID , choiceID , _reqID FROM user_session WHERE user_id = ?`;
        try {
          userData = await new Promise((resolve, reject) => {
            db.get(query, [message.author.id], (err, row) => {
              if (err) {
                console.error('Error querying database:', err);
                reject(err);
              } else {
                resolve(row);
              }
            });
          });
        } catch (error) {
          console.error('Error retrieving data from database:', error);
        }

        await message.channel.sendTyping();

        // Respond to the message in the created channel
        const originalQuestion = message.content;
        let question = originalQuestion;

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
          const availableLength = 1800 - question.length;
          question = `${originalQuestion} and answer should be ${availableLength} characters or fewer in length`;

          // Store session data in the database
          const insertQuery = `INSERT OR REPLACE INTO user_session (user_id, conversationID ,responseID , choiceID , _reqID ) VALUES (?, ?,?,?,?)`;
          db.run(
            insertQuery,
            [
              message.author.id,
              userData.conversationID,
              userData.responseID,
              userData.choiceID,
              userData._reqID,
            ],
            (err) => {
              if (err) {
                console.error('Error inserting data into database:', err);
              }
            },
          );
        } else {
          await init(cookies);
          const conversation = new Chat({
            conversationID: userData.conversationID,
            responseID: userData.responseID,
            choiceID: userData.choiceID,
            _reqID: userData._reqID,
          });
          response = await conversation.ask(question);
          const availableLength = 1800 - question.length;
          question = `${originalQuestion} and answer should be ${availableLength} characters or fewer in length`;
          updatedSession = await conversation.export();

          // Store session data in the database
          const updateQuery = `
          UPDATE user_session
          SET conversationID = ?,
              responseID = ?,
              choiceID = ?,
              _reqID = ?
          WHERE user_id = ?`;
          db.run(
            updateQuery,
            [
              updatedSession.conversationID,
              updatedSession.responseID,
              updatedSession.choiceID,
              updatedSession._reqID,
              message.author.id,
            ],
            (err) => {
              if (err) {
                console.error('Error inserting data into database:', err);
              }
            },
          );
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
      });
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  },
};
