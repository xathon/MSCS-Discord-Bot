const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const env = require('../config.js')

const token = env.token
const clientId = env.client_id

const rest = new REST({ version: '9' }).setToken(token)
for (let guild of env.guilds) {
  rest
    .get(Routes.applicationGuildCommands(clientId, guild.guildID))
    .then(data => {
      const promises = []
      for (const command of data) {
        const deleteUrl = `${Routes.applicationGuildCommands(
          clientId,
          guild.guildID
        )}/${command.id}`
        promises.push(rest.delete(deleteUrl))
      }
      return Promise.all(promises)
    })
}
