require('dotenv').config()
const { Client, Intents } = require('discord.js')
const Keyv = require('keyv')
const keyv = new Keyv()
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
let running = false
var RESTClientConst = require('node-rest-client').Client;
var RESTClient = new RESTClientConst();
const logger = require('./logger')
const guilds = JSON.parse(process.env.GUILDS)

module.exports = {
  token: process.env.BOT_TOKEN,
  client_id: process.env.CLIENT_ID,
  keyv: keyv,
  client: client,
  running: running,
  RESTClient: RESTClient,
  guilds: guilds,
  admins: process.env.ADMINS,
  mscs: process.env.MSCS_BIN,
  mscs_worlds: process.env.MSCS_WORLDS,
  logger: logger.logger,
  commandUsed: logger.commandUsed,
  getWorld: function (guild, worldName) {
    return guild.worlds.find(world => world.name === worldName)
  }
}
