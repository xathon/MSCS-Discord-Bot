const fs = require('fs');
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const env  = require("../config.js");
const { getEnabledCategories } = require('trace_events');


let commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const commandFile = require(`../commands/${file}`);
    console.log("Found " + file);
	commands.push(commandFile.data.toJSON());
}

let commands_mod;

for (let guild of env.guilds) {
	if(guild.worlds.length === 1) { //only one world, so no need for options
		commands_mod = commands; //don't modify the original array
	} else { //more than one world, so add options object
		let worldSelector = {};
		worldSelector.autocomplete = undefined;
		worldSelector.choices = [];
		for(let world of guild.worlds) {
			worldSelector.choices.push({ name: world, value: world });
		}
		worldSelector.description = 'Choose the world to run this command on';
		worldSelector.name = 'world';
		worldSelector.required = true;
		worldSelector.type = 3;

		commands_mod = structuredClone(commands); // deep copy commands so we can edit it without modifying the original

		for (let command of commands_mod) {
			if(command.name !== 'help' &&
			   command.name !== 'lock' &&
			   command.name !== 'ping') {
				command.options?.unshift(worldSelector);
			}
		}
		
	}
	if(process.argv.slice(2)[0] !== "dry") {

		const rest = new REST({ version: '9' }).setToken(env.token);
	
		rest.put(Routes.applicationGuildCommands(env.client_id,guild.guildID), { body: commands_mod })
			.then(() => console.log(`Successfully registered guild commands for ${guild.guildName}.`))
			.catch(console.error);
	
	} else {
		console.log(commands_mod);
	}
}