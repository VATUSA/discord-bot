const util = require('../util')
module.exports = {
  name       : 'guildDelete',
  description: 'A guild has been removed.',
  async execute (guild) {
    const util = require('../util')
    await require('../util').fetch(guild.client)
    util.log('event', `Left guild: ${guild.name} (${guild.id})`)
  }
}