module.exports = {
  name       : 'guildCreate',
  description: 'A new guild has been joined.',
  async execute (guild) {
    await require('../util').fetch(guild.client)
  }
}