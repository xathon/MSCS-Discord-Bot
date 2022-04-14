const { SlashCommandBuilder } = require('@discordjs/builders')
const env = require('../config.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute (interaction) {
    env.logger.debug(env.commandUsed(interaction))
    await interaction.reply('Pong! :ping_pong:')
  }
}
