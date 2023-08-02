require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { DisTube } = require('distube');

const { connectToMongo } = require('./utils/mongoConnection');

const token = process.env.DISCORD_TOKEN;

// Connect to Database
connectToMongo();

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
    Intents.FLAGS.GUILD_VOICE_STATES, // Required for information about changes in VCs
  ],
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnFinish: true,
  youtubeDL: false,
  ytdlOptions: {
    quality: 'highestaudio',
  },
  searchSongs: 10,
});
client.distube = distube;

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

// Event files
const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once)
    client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(token);
