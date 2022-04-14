const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const env = require('../config.js')

const token = env.token
const clientId = env.client_id

const rest = new REST({ version: '9' }).setToken(token)
for (let guild of env.guilds) {
  console.log(guild.guildName + ': ')
  rest
    .get(Routes.applicationGuildCommands(clientId, guild.guildID))
    .then(data => {
      for (const command of data) {
        console.log(command)
      }
    })
}
