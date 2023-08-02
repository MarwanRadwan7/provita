const { Client } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,

  /**
   *
   * @param {Client} client
   * @param {client.commands} commands
   */

  execute: (client, commands) => {
    client.user.setActivity(`/help | Provita`);
    client.user.setStatus('online');
    console.log('Provita is online. 🔑');
  },
};
