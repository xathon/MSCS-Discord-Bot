const { SlashCommandBuilder } = require('@discordjs/builders');
const { stdout } = require('process');
const env = require("../config.js");
let worlds = env.worlds;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Outputs the status of the server.'),
	async execute(interaction) {
        await interaction.deferReply();
		{
			let{ user,commandName,guild } = interaction;
			env.logger.info(env.commandUsed(user,commandName,guild));
		}
		

        var command = "";
		var name = "";
		let found = false;
		for (let world of worlds) {
			if(interaction.guild.id === world.guildID) {
				//TODO here we can implement logic to check for the world name that can be passed as an argument in the slash command
				//additionally, it might make sense to be able to start a world from different servers.
				//this would be a restructure, since right now we have a 1:1 relation between worlds and servers.
				//we would be converting guildID into an array and basically getting rid of guildName, it serves only informal purposes anyway
				//but as I don't need that right now, I won't implement that (yet). but here's the place it would go
				command = `${env.mscs} status ${world.worldName}`
				env.logger.verbose(`Status command came from server ${world.guildName}.`);
				name = world.worldName;
				found = true;
				break;
			}
		}
		
		if(!found) {
			out = "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
			env.logger.warn(`${interaction.user.username} requested the status of a world from guild ${interaction.guild.name}, but no world was found for this guild!`);
			return interaction.editReply(out);
		}
		
		env.logger.info(`Getting status of the world ${name}.`);

		require('child_process').exec(command, (err,stdout,stderr) => {
			env.logger.info(`Sending status of the world ${name}.`)
        	return interaction.editReply(stdout);
		})
	},
};