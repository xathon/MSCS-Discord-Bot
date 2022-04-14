const fs = require('fs')
const { Collection } = require('discord.js')
const env = require('./config.js')

//TODO das ganze in Buttons umbauen

env.logger.info('Bot starting up.')

if (env.keyv.get('locked') !== undefined) {
  env.keyv.set('locked', 'false')
}

env.client.commands = new Collection()

const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  env.client.commands.set(command.data.name, command)
}

env.client.once('ready', () => {
  try {
    env.client.user.setPresence({
      activities: [{ name: '/help', type: 'LISTENING' }],
      status: 'idle'
    })
    console.log('Ready!')
    env.logger.info('Bot startup complete.')
  } catch (error) {
    env.logger.error(error)
  }
})

env.client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  const command = env.client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    env.logger.error(error)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    })
  }
})

env.client.login(env.token)
setInterval(async function () {
  var child = require('child_process').exec(env.mscs + ' status')
  var out = ''

  env.logger.debug('Starting regular status update.')

  child.stdout.on('data', function (data) {
    out += data
  })

  child.on('exit', function () {
    //this will show online if any server is running
    if (out.includes('running version')) {
      if (!env.running) {
        env.running = true
        env.client.user.setStatus('online')
        env.logger.info('Set Discord status to online.')
      } else {
        env.logger.debug('Server is still running. Carry on.')
      }
    } else {
      if (env.running) {
        env.running = false
        env.client.user.setStatus('idle')
        env.logger.info('Set Discord status to idle.')
      } else env.logger.debug('Server is still not running. Carry on.')
    }
    env.logger.debug('Regular status update complete.')
  })
}, 1 * 60 * 1000)

process.on('SIGTERM', () => {
  env.logger.info('Recieved SIGTERM, exiting.')
  process.exit(0)
})
process.on('SIGINT', () => {
  env.logger.info('Recieved SIGINT, exiting.')
  process.exit(0)
})
