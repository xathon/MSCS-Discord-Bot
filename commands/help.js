const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const env = require('../config.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays help for this bot.'),
  async execute (interaction) {
    const help = new MessageEmbed()
      .setColor('#7eb747')
      .setTitle('Available Commands')
      .addField(
        '/start',
        "Starts the server. This may take a minute, the bot will notify you once it's up and running! The bot will set its status to Online."
      )
      .addField(
        '/stop',
        'Stops the server. The bot will set its status to Idle.'
      )
      .addField(
        '/status',
        "Shows information on the server status, like if it's running, how many users are connected, etc."
      )
      .addField(
        '/log',
        'Outputs a short bit of the latest log, no more than 1942 characters. Choose the number of lines (default 10) and which file to output (latest.log or console.out).'
      )
      .addField(
        '/logasfile',
        'Outputs a whole logfile as an attachment. Choose whether to print the console output or the logfile.'
      )
      .addField('/help', 'Displays this help.')
    {
      let { user, commandName, guild } = interaction
      env.logger.verbose(env.commandUsed(user, commandName, guild))
    }
    await interaction.reply({ embeds: [help], ephemeral: true })
  }
}
