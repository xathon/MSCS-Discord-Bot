const { SlashCommandBuilder } = require('@discordjs/builders')
const env = require('../config.js')
let guilds = env.guilds

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Starts or restarts the server'),
  async execute (interaction) {
    {
      let { user, commandName, guild } = interaction
      env.logger.info(env.commandUsed(user, commandName, guild))
    }

    if (env.keyv.get('locked') === true) {
      env.logger.warn("Not starting server because it's locked.")
      await interaction.reply({
        content: 'The server cannot be used right now.',
        ephemeral: true
      })
    } else {
      //TODO check if server is running to determine if we should write start or restart.
      await interaction.reply(
        "(Re)starting the server. This may take a few minutes, but I'll let you know once it's started successfully. :heart:"
      )

      var command = ''
      var name = ''
      let found = false
      var worldName = ''

      try {
        worldName = interaction.options.getString('world')
        for (let guild of guilds) {
          if (guild.worlds.contains(worldName)) {
            command = `${env.mscs} restart ${worldName};sleep 1;watch -g -t '${env.mscs} status ${worldName} | grep -m1 "${worldName}: running ver"'`
            env.logger.verbose(
              `Start command came from server ${guild.guildName} for world ${worldName}.`
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
            command = `${env.mscs} restart ${guild.worlds[0]};sleep 1;watch -g -t '${env.mscs} status ${guild.worlds[0]} | grep -m1 "${guild.worlds[0]}: running ver"'`
            env.logger.verbose(
              `Start command came from server ${guild.guildName} for world ${guild.worlds[0]}.`
            )
            name = guild.worlds[0]
            found = true
            break
          }
        }
      }

      for (var world of env.worlds) {
        if (interaction.guild.id === world.guildID) {
          //TODO here we can implement logic to check for the world name that can be passed as an argument in the slash command
          //additionally, it might make sense to be able to start a world from different servers.
          //this would be a restructure, since right now we have a 1:1 relation between worlds and servers.
          //we would be converting guildID into an array and basically getting rid of guildName, it serves only informal purposes anyway
          //but as I don't need that right now, I won't implement that (yet). but here's the place it would go
          command = `${env.mscs} restart ${world.worldName};sleep 1;watch -g -t '${env.mscs} status ${world.worldName} | grep -m1 "${world.worldName}: running ver"'`
          env.logger.verbose(
            `Start command came from server ${world.guildName}`
          )
          name = world.worldName
          found = true
          break
        }
      }
      if (!found) {
        out =
          "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!" //TODO can we differentiate here?
        env.logger.warn(
          `${interaction.user.username} requested to start a world from guild ${interaction.guild.name}, but no world was found for this guild!`
        )
        return interaction.editReply(out)
      }

      var child = require('child_process').exec(command, { timeout: 30000 })
      env.logger.info(`Starting the world ${name}.`)
      var out = ''
      child.stdout.on('data', function (data) {
        out += data
      })
      child.on('exit', async function () {
        env.logger.info(`Startup of world ${name} finished.`)
        await interaction.followUp({
          content:
            'Server has completed startup! You can connect now. :partying_face:',
          ephemeral: true
        })
        await interaction.editReply('Started the Minecraft server!')
        env.client.user.setStatus('online')
        env.logger.info('Set Discord status to online.')
      })
    }
  }
}
