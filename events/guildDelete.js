module.exports = {
  name       : 'guildDelete',
  description: 'A guild has been removed.',
  async execute (guild) {
    await require('../util').fetch(guild.client)
  }
}