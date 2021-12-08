module.exports = {
  name       : 'interactionCreate',
  description: 'Slash command used.',
  async execute (interaction) {
    if (!interaction.isCommand() && !interaction.isButton()) return //Skip if interaction is not a registered command

    const client  = interaction.client,
          command = client.commands.get(interaction.commandName),
          util    = require('../util')
    if (!command) return //Command does not exist
    try {
      await command.execute(interaction)
    } catch (err) {
      util.log('error', `Error executing command ${command.name}`)
      util.log('error', err)
      await interaction.reply({content: 'Unable to execute command. Blake broke something. ;('})
    }
  }
}