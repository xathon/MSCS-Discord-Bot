const { SlashCommandBuilder } = require('@discordjs/builders');
const env = require("../config.js");
const { MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('logasfile')
		.setDescription('Send the log as a file. Choose console output or logfile.')
		.addStringOption(option => option.setName('file').setDescription("Choose whether to print the console output or the logfile").setRequired(true).addChoice("console output", "console.out").addChoice("logfile", "logs/latest.log")),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		{
			let { user, commandName, guild } = interaction;
			env.logger.info(env.commandUsed(user, commandName, guild));
		}

		let prefix, file, out;
		file = interaction.options.getString('file');
		env.logger.verbose(`${file} was requested.`)

		prefix = env.mscs_worlds;
		let found = false;
		var name = "";
		var worldName = "";

		try {
			worldName = interaction.options.getString('world');
			for (let guild of guilds) {
				if (guild.worlds.contains(worldName)) {
					prefix += worldName + "/";
					env.logger.verbose(`Logfile command came from server ${guild.guildName} for world ${worldName}.`);
					name = worldName;
					found = true;
					break;
				}
			}
		} catch (error) {
			env.logger.debug(`No world name was specified, so the server only has one world.`);
			for (let guild of guilds) {
				if (interaction.guild.id === guild.guildID) {
					prefix += guild.worlds[0] + "/";
					env.logger.verbose(`Logfile command came from server ${guild.guildName} for world ${guild.worlds[0]}.`);
					name = guild.worlds[0];
					found = true;
					break;
				}
			}
		}
		if (!found) {
			out = "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
			env.logger.warn(`${interaction.user.username} requested a logfile for a world from guild ${interaction.guild.name}, but no world was found for this guild!`);
			return interaction.editReply(out);
		}

		if (file === 'console.out') {
			env.logger.debug(`Copying ${file} to /tmp directory and adding .log suffix.`);
			const child = require("child_process").exec("cp " + prefix + file + " /tmp/console.out.log");
			await new Promise((resolve) => {
				child.on('close', resolve)
			})
			prefix = "/tmp/";
			file = file + ".log";

		}

		out = new MessageAttachment(prefix + file);

		env.logger.info(`Sending logfile ${prefix + file} for server ${name}.`)

		return interaction.editReply({ files: [out] });


	},
};