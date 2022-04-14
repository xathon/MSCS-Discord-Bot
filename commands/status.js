const { SlashCommandBuilder } = require('@discordjs/builders');
const { stdout } = require('process');
const env = require("../config.js");
let guilds = env.guilds;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Outputs the status of the server.'),
	async execute(interaction) {
		await interaction.deferReply();
		{
			let { user, commandName, guild } = interaction;
			env.logger.info(env.commandUsed(user, commandName, guild));
		}


		var command = "";
		var name = "";
		let found = false;
		var worldName = "";

		try {
			worldName = interaction.options.getString('world');
			for (let guild of guilds) {
				if (guild.worlds.contains(worldName)) {
					command = `${env.mscs} status ${worldName}`
					env.logger.verbose(`Status command came from server ${guild.guildName} for world ${worldName}.`);
					name = worldName;
					found = true;
					break;
				}
			}
		} catch (error) {
			env.logger.debug(`No world name was specified, so the server only has one world.`);
			for (let guild of guilds) {
				if (interaction.guild.id === guild.guildID) {
					command = `${env.mscs} status ${guild.worlds[0]}`
					env.logger.verbose(`Status command came from server ${guild.guildName} for world ${guild.worlds[0]}.`);
					name = guild.worlds[0];
					found = true;
					break;
				}
			}
		}

		if (!found) {
			out = "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
			env.logger.warn(`${interaction.user.username} requested the status of a world from guild ${interaction.guild.name}, but no world was found for this guild!`); //TODO error messages for the multiverse
			return interaction.editReply(out);
		}


		require('child_process').exec(command, (err, stdout, stderr) => {
			env.logger.info(`Sending status of the world ${name}.`)
			return interaction.editReply(stdout);
		})
	},
};