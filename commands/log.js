const { SlashCommandBuilder } = require('@discordjs/builders');
const env = require("../config.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('log')
		.setDescription('Output the last n lines of the log (default 10). Choose console output or logfile.')
        .addStringOption(option => option.setName('file').setDescription("Choose whether to print the console output or the logfile").setRequired(true).addChoice("console output","console.out").addChoice("logfile","logs/latest.log"))
        .addIntegerOption(option => option.setName('rows').setMinValue(0).setDescription("The number of rows to print (max 2000 characters, use /logfile for more)")),
	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

		{
			let{ user,commandName,guild } = interaction;
			env.logger.info(env.commandUsed(user,commandName,guild));
		}
        
        let command, numberRows, file, out;
        out = "";
        numberRows = interaction.options.getInteger('rows');
        file = interaction.options.getString('file');

        command = "tail -n "
        numberRows ??= 10;
        command += numberRows;


        command += " ";
        command += env.mscs_worlds;

        //ensure the worlds path has a trailing slash
        if(!command.endsWith('/')) command += "/";

        let found = false;
        var name = "";
        for(let world of env.worlds) {
            if(interaction.guild.id === world.guildID) {
                //TODO here we can implement logic to check for the world name that can be passed as an argument in the slash command
                //additionally, it might make sense to be able to start a world from different servers.
                //this would be a restructure, since right now we have a 1:1 relation between worlds and servers.
                //we would be converting guildID into an array and basically getting rid of guildName, it serves only informal purposes anyway
                //but as I don't need that right now, I won't implement that (yet). but here's the place it would go
                command += world.worldName + "/" + file;
                env.logger.verbose(`Log command came from server ${world.guildName}`);
                name = world.worldName;
                found = true;
                break;
            }
        }
        if(!found) { 
            out = "ERROR: Either this Discord guild doesn't have a server attached to it, or there is no world with the name you specified!"
			env.logger.warn(`${interaction.user.username} requested a log for a world from guild ${interaction.guild.name}, but no world was found for this guild!`);
            return interaction.editReply(out);
        }

        var child = require("child_process").exec(command);

        env.logger.verbose(`Getting log for server ${name}`);
		child.stdout.on("data", function(data) {
			out += data;
		});
        
        child.on("exit",function () {
            if(out.length() > 1942) { //max length, because discord limits the reply to 2000 letters
                out = out.slice(-1942);
                env.logger.debug("Message had to be cropped!");
            }
            out = "```\n" + out;
            out += "\n```";
            env.logger.info(`Sent log for server ${name}.`)
            return interaction.editReply(out);
        });
        
	},
};