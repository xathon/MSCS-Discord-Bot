const { SlashCommandBuilder } = require('@discordjs/builders')
const env = require('../config.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the server (can only be used by admins)')
    .addBooleanOption(option =>
      option
        .setName('lock')
        .setDescription('True to lock, false to unlock')
        .setRequired(true)
    )
    .setDefaultPermission(false),
  async execute (interaction) {
    //TODO discord will soon support restricting slash commands to roles/users. but for now, we make do with this.
    if (!env.admins.includes(interaction.user.id)) {
      return interaction.reply({
        content: "You're not allowed to do that!",
        ephemeral: true
      })
    }

    if (interaction.options.getBoolean('lock')) {
      console.log('Locking server.')
      await env.keyv.set('locked', 'true')
      env.client.user.setStatus('dnd')
      return interaction.reply({
        content: 'Locked the server!',
        ephemeral: true
      })
    } else {
      console.log('Unlocking server.')
      await env.keyv.set('locked', 'false')
      env.client.user.setStatus('idle')
      return interaction.reply({
        content: 'Unlocked the server!',
        ephemeral: true
      })
    }
  }
}
