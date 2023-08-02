require('dotenv').config();
const { init, Chat } = require('../apis/bardAPI');
const { UserSession } = require('../models/userSession');

const cookies = process.env.BARD_KEY;

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    // Check if the message is sent by a bot, if it is, do nothing
    if (message.author.bot) return;

    const { guild } = message;
    const categoryName = '✨PROVITA✨';
    const channelName = 'ask-provita';
    const thankingRegex =
      /thank(s| you| ya| u| u so much| u very much| you very much| you so much|\syou\s)/i;
    const salutingRegex = /\b(hello|hi|hey)\b/i;

    try {
      // Check if the message is sent in the provita channel
      const category = guild.channels.cache.find(
        (channel) =>
          channel.type === 'GUILD_CATEGORY' && channel.name === categoryName,
      );

      if (!category || message.channel.parentId !== category.id) {
        return;
      }

      // Get the session info from MongoDB using Mongoose
      let userData;
      try {
        userData = await UserSession.findOne({
          user_id: message.author.id,
        }).exec();
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

        // Create a new user session in MongoDB
        const newUserSession = new UserSession({
          user_id: message.author.id,
          conversationID: userData.conversationID,
          responseID: userData.responseID,
          choiceID: userData.choiceID,
          _reqID: userData._reqID,
          user_username: message.author.username,
        });

        await newUserSession.save();
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

        // Update the existing user session in MongoDB
        userData.conversationID = updatedSession.conversationID;
        userData.responseID = updatedSession.responseID;
        userData.choiceID = updatedSession.choiceID;
        userData._reqID = updatedSession._reqID;

        await userData.save();
      }

      await message.reply({
        content: response,
        attachments: {
          ephemeral: true,
        },
      });
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  },
};
