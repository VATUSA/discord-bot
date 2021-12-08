module.exports = {
  name       : 'guildCreate',
  description: 'A new guild has been joined.',
  async execute (guild) {
    const util = require('../util')
    await require('../util').fetch(guild.client)
    util.log('event', `Joined guild: ${guild.name} (${guild.id})`)
  }
}