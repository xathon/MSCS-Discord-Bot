const { SlashCommandBuilder } = require('@discordjs/builders');
const env = require("../config.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the server'),
	async execute(interaction) {

		{
			let { user, commandName, guild } = interaction;
			env.logger.info(env.commandUsed(user, commandName, guild));
		}

		//the user doesn't actually need to wait to recieve this message until shutdown is complete
		await interaction.reply("Stopping the server. :wave:");
		var command = "";
		var name = "";
		let found = false;
		var worldName = "";

		try {
			worldName = interaction.options.getString('world');
			for (let guild of guilds) {
				if (guild.worlds.contains(worldName)) {
					command = `${env.mscs} stop ${worldName}`;
					env.logger.verbose(`Stop command came from server ${guild.guildName} for world ${worldName}.`);
					name = worldName;
					found = true;
					break;
				}
			}
		} catch (error) {
			env.logger.debug(`No world name was specified, so the server only has one world.`);
			for (let guild of guilds) {
				if (interaction.guild.id === guild.guildID) {
					command = `${env.mscs} stop ${guild.worlds[0]}`;
					env.logger.verbose(`Stop command came from server ${guild.guildName} for world ${guild.worlds[0]}.`);
					name = guild.worlds[0];
					found = true;
					break;
				}
			}
		}


		for (const world of env.worlds) {
			if (interaction.guild.id === world.guildID) {
				//TODO here we can implement logic to check for the world name that can be passed as an argument in the slash command
				//additionally, it might make sense to be able to start a world from different servers.
				//this would be a restructure, since right now we have a 1:1 relation between worlds and servers.
				//we would be converting guildID into an array and basically getting rid of guildName, it serves only informal purposes anyway
				//but as I don't need that right now, I won't implement that (yet). but here's the place it would go
				command = `${env.mscs} stop ${world.worldName}`
				env.logger.verbose(`Stop command came from server ${world.guildName}.`);
				name = world.worldName;
				found = true;
				break;
			}
		}
		if (!found) {
			out = "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
			env.logger.warn(`${interaction.user.username} requested to stop a world from guild ${interaction.guild.name}, but no world was found for this guild!`);
			return interaction.editReply(out);
		}

		var child = require("child_process").exec(command);
		env.logger.info(`Stopping the world ${name}.`);
		child.on("exit", async function () {
			env.logger.info(`Shutdown of world ${name} finished.`);
			env.client.user.setStatus('idle');
			env.logger.info("Set Discord status to idle.");
		});



	},
};