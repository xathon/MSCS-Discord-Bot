require("dotenv").config();
const { Client, Intents } = require('discord.js');
const Keyv = require('keyv');
const keyv = new Keyv();
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { exec } = require('child_process');
let running = false;
const logger = require('./logger');
const worlds = JSON.parse(process.env.MINECRAFT_WORLDS)

module.exports =  {
    token: process.env.BOT_TOKEN,
    client_id: process.env.CLIENT_ID,
    keyv: keyv,
    client: client,
    running: running,
    worlds: worlds,
    admins: process.env.ADMINS,
    mscs: process.env.MSCS_BIN,
    mscs_worlds: process.env.MSCS_WORLDS,
    logger: logger.logger,
    commandUsed: logger.commandUsed

}