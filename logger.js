const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');
const { combine, timestamp, printf, colorize, align } = winston.format;


var transport = new winston.transports.DailyRotateFile({
  frequency: '1y',
  filename: './logs/bot.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '10'
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});

var logger = winston.createLogger({
  level: process.env.logLevel || 'verbose',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    transport
  ]
});



module.exports = {
  'logger': logger,
  commandUsed: function (user, commandName, guild) {
    let log = `${user.username} used the command /${commandName} in guild "${guild.name}".`;

    /*
    //TODO still need to understand if there's a possibility to access all values that are passed/options that a command has
    if (interaction.values !== undefined && interaction.values !== null && interaction.values !== []) {
      log += " with the options: "
      for (let option in interaction.values) {
        log += option.name + ": " + option.value + ", "
      }
      log = log.slice(0,-2); //removes the last comma
    }
    */
    //log += ".";
    return log;
  }
};