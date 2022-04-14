const { SlashCommandBuilder } = require('@discordjs/builders')
const env = require('../config.js')
const { MessageAttachment } = require('discord.js')
let guilds = env.guilds

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logasfile')
    .setDescription('Send the log as a file. Choose console output or logfile.')
    .addStringOption(option =>
      option
        .setName('file')
        .setDescription(
          'Choose whether to print the console output or the logfile'
        )
        .setRequired(true)
        .addChoice('console output', 'console.out')
        .addChoice('logfile', 'logs/latest.log')
    ),
  async execute (interaction) {
    await interaction.deferReply({ ephemeral: true })

    {
      let { user, commandName, guild } = interaction
      env.logger.info(env.commandUsed(user, commandName, guild))
    }

    let prefix, file, out
    file = interaction.options.getString('file')
    env.logger.verbose(`${file} was requested.`)

    prefix = env.mscs_worlds
    let found = false
    var worldName, interactionWorldName, worldObj, remote, secret

    try {
      interactionWorldName = interaction.options.getString('world')
      for (let guild of guilds) {
        if ((worldObj = env.getWorld(guild, interactionWorldName))) {
          prefix += interactionWorldName + '/'
          env.logger.verbose(
            `Log command came from server ${guild.guildName} for world ${interactionWorldName}.`
          )
          worldName = interactionWorldName
          found = true
          remote = worldObj.remote
          secret = worldObj.secret
          break
        }
      }
    } catch (error) {
      env.logger.debug(
        `No world name was specified, so the server only has one world.`
      )
      for (let guild of guilds) {
        if (interaction.guild.id === guild.guildID) {
          prefix += guild.worlds[0].name + '/'
          env.logger.verbose(
            `Log command came from server ${guild.guildName} for world ${guild.worlds[0].name}.`
          )
          worldName = guild.worlds[0].name
          found = true
          break
        }
      }
    }
    if (!found) {
      out =
        "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
      env.logger.warn(
        `${interaction.user.username} requested a logfile for a world from guild ${interaction.guild.name}, but no world was found for this guild!`
      )
      return interaction.editReply(out)
    }
    console.log('remote: ' + remote)

    if (remote) {
      if (remote.slice(-1) === '/') remote = remote.slice(0, -1)
      let args = {
        headers: { Authorization: secret }
      }
      env.RESTClient.get( //FOR SOME REASON THIS REQUEST NEVER MAKES IT TO THE SERVER
        `${remote}/logasfile/${worldName}/${encodeURIComponent(file)}`,
        args,
        (data, response) => {
          if (response.statusCode === 200) {
            env.logger.info(`Sent log for remote server ${worldName}.`)
            out = new MessageAttachment(data)
          } else {
            out = `ERROR: Could not get log for server ${worldName}!`
            env.logger.error(
              `Could not get log for remote server ${worldName}! Status code: ${
                response.statusCode
              }, message: ${data.toString()}`
            )
          }
        }
      )
    } else {
      if (file === 'console.out') {
        env.logger.debug(
          `Copying ${file} to /tmp directory and adding .log suffix.`
        )
        const child = require('child_process').exec(
          'cp ' + prefix + file + ' /tmp/console.out.log'
        )
        await new Promise(resolve => {
          child.on('close', resolve)
        })
        prefix = '/tmp/'
        file = file + '.log'
      }
      env.logger.info(
        `Sending logfile ${prefix + file} for server ${worldName}.`
      )
      out = new MessageAttachment(prefix + file)
    }

    return interaction.editReply({ files: [out] })
  }
}
