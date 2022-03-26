const { SlashCommandBuilder } = require('@discordjs/builders');
const env = require("../config.js");
const { MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('logasfile')
		.setDescription('Send the log as a file. Choose console output or logfile.')
        .addStringOption(option => option.setName('file').setDescription("Choose whether to print the console output or the logfile").setRequired(true).addChoice("console output","console.out").addChoice("logfile","logs/latest.log")),
	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        {
			let{ user,commandName,guild } = interaction;
			env.logger.info(env.commandUsed(user,commandName,guild));
		}

        let prefix, file, out;
        file = interaction.options.getString('file');
        env.logger.verbose(`${file} was requested.`)

        prefix = env.mscs_worlds;
        let found = false;
        var name = "";

        for(let world of env.worlds) {
            if(interaction.guild.id === world.guildID) {
                //TODO here we can implement logic to check for the world name that can be passed as an argument in the slash command
                //additionally, it might make sense to be able to start a world from different servers.
                //this would be a restructure, since right now we have a 1:1 relation between worlds and servers.
                //we would be converting guildID into an array and basically getting rid of guildName, it serves only informal purposes anyway
                //but as I don't need that right now, I won't implement that (yet). but here's the place it would go
                prefix += world.worldName + "/";
                env.logger.verbose(`Logfile command came from server ${world.guildName}`);
                name = world.worldName;
                found = true;
                break;
            }
        }
        if(!found) {
            out = "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
			env.logger.warn(`${interaction.user.username} requested a logfile for a world from guild ${interaction.guild.name}, but no world was found for this guild!`);
            return interaction.editReply(out);
        }

        if(file === 'console.out') { 
            env.logger.debug(`Copying ${file} to /tmp directory and adding .log suffix.`);
            const child = require("child_process").exec("cp " + prefix + file + " /tmp/console.out.log");
            await new Promise( (resolve) => {
                child.on('close', resolve)
            })
            prefix = "/tmp/";
            file = file + ".log";

        }

        out = new MessageAttachment(prefix + file);

        env.logger.info(`Sending logfile ${prefix+file} for server ${name}.`)

        return interaction.editReply({files: [out]});

        
	},
};