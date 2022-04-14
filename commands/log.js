const { SlashCommandBuilder } = require('@discordjs/builders')
const env = require('../config.js')
let guilds = env.guilds

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription(
      'Output the last n lines of the log (default 10, 0: max length). Choose console output or logfile.'
    )
    .addStringOption(option =>
      option
        .setName('file')
        .setDescription(
          'Choose whether to print the console output or the logfile'
        )
        .setRequired(true)
        .addChoice('console output', 'console.out')
        .addChoice('logfile', 'logs/latest.log')
    )
    .addIntegerOption(option =>
      option
        .setName('rows')
        .setMinValue(0)
        .setDescription(
          'The number of rows to print (max 2000 characters, use /logfile for more)'
        )
    ),
  async execute (interaction) {
    await interaction.deferReply({ ephemeral: true })

    {
      let { user, commandName, guild } = interaction
      env.logger.info(env.commandUsed(user, commandName, guild))
    }

    let command, numberRows, file, out
    out = ''
    numberRows = interaction.options.getInteger('rows')
    file = interaction.options.getString('file')
    if (numberRows === 0) {
      command = 'tail -c 1942 '
      out = 'Abridged log, use `/logasfile` for whole log!\n'
    } else {
      command = 'tail -n '
      if (!numberRows) numberRows = 10
      command += numberRows
    }

    command += ' '
    command += env.mscs_worlds

    //ensure the worlds path has a trailing slash
    if (!command.endsWith('/')) command += '/'

    let found = false
    var name = ''
    var worldName = ''

    try {
      worldName = interaction.options.getString('world')
      for (let guild of guilds) {
        if (guild.worlds.contains(worldName)) {
          command += worldName + '/' + file
          env.logger.verbose(
            `Log command came from server ${guild.guildName} for world ${worldName}.`
          )
          name = worldName
          found = true
          break
        }
      }
    } catch (error) {
      env.logger.debug(
        `No world name was specified, so the server only has one world.`
      )
      for (let guild of guilds) {
        if (interaction.guild.id === guild.guildID) {
          command += guild.worlds[0] + '/' + file
          env.logger.verbose(
            `Log command came from server ${guild.guildName} for world ${guild.worlds[0]}.`
          )
          name = guild.worlds[0]
          found = true
          break
        }
      }
    }
    if (!found) {
      out =
        "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
      env.logger.warn(
        `${interaction.user.username} requested a log for a world from guild ${interaction.guild.name}, but no world was found for this guild!`
      )
      return interaction.editReply(out)
    }

    var child = require('child_process').exec(command)

    env.logger.verbose(`Getting log for server ${name}`)
    child.stdout.on('data', function (data) {
      out += data
    })

    child.on('exit', function () {
      if (out.length() > 1942) {
        //max length, because discord limits the reply to 2000 letters
        out = out.slice(-1942)
        env.logger.debug('Message had to be cropped!')
      }
      out = '```\n' + out
      out += '\n```'
      env.logger.info(`Sent log for server ${name}.`)
      return interaction.editReply(out)
    })
  }
}
