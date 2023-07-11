require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const token = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS, // Required for guild-related events
    Intents.FLAGS.GUILD_MEMBERS, // Required to access member data
    Intents.FLAGS.GUILD_MESSAGES, // Required for guild message-related events
    Intents.FLAGS.DIRECT_MESSAGES, // Required for direct message-related events
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS, // Required for reaction-related events
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, // Required to access emoji and sticker data
    Intents.FLAGS.GUILD_INTEGRATIONS, // Required for integration-related events
    Intents.FLAGS.GUILD_WEBHOOKS, // Required for webhook-related events
    Intents.FLAGS.GUILD_PRESENCES, // Required for presence-related events
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// Add commands to the client
client.commands = new Collection();

// Get the list of commands
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

// Load files into client commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// do this once when bot logs in
client.once('ready', () => {
  console.log('Bot has been logged in');
});

// Dynamic command handler - listens for interaction create event
client.on('interactionCreate', async (interaction) => {
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
});

client.login(token);
