const fs = require('fs');
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const env  = require("./config.js");
const { getEnabledCategories } = require('trace_events');


const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    console.log("Found " + file);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(env.token);

rest.put(Routes.applicationCommands(env.client_id), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

    