require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { init, askAI } = require('../apis/bardAPI');
const { ApplicationCommand } = require('discord.js');

const cookies = process.env.BARD_KEY;

/**
 * @param {String} question - The question to be answered.
 * @returns {Promise} - A promise that will resolve with the answer.
 */

const askBard = async (question) => {
  await init(cookies);
  return await askAI(question);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI questions!')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('What do you want to ask the bot about?')
        .setRequired(true),
    ),

  /**
   *
   * @param {ApplicationCommand} interaction
   */
  async execute(interaction) {
    const originalQuestion = interaction.options.getString('question');
    let question = originalQuestion;
    let response = null;
    await interaction.deferReply({ ephemeral: false });

    try {
      // Keep asking Bard with the modified question until the response is 2000 characters or less.
      while (true) {
        response = await askBard(question);

        // Check if the response is 2000 characters or less.
        if (response.length <= 2000) {
          break; // Exit the loop if the response is within the limit.
        }

        // If the response is more than 2000 characters, modify the question and try again.
        const availableLength = 1800 - question.length;
        question = `${originalQuestion} and answer should be ${availableLength} characters or fewer in length`;
      }

      // Send the final response using interaction.followUp().
      await interaction.followUp({
        content: response,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error while processing command:', error);
      // If there's an error, reply with an error message.
      await interaction.followUp('There was an error processing your command');
    }
  },
};
