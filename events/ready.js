module.exports = {
  name: 'ready',
  once: true,
  execute (client) {
    const util = require('../util')
    util.fetch(client, () => {
      client.commands.get('giveRoles').execute(null, '192516628565458944', null, client.guilds.cache.get(process.env.GUILD_ID))
    })
    console.log(`Logged in as ${client.user.tag}!`)
    return
    util.fetch()
  }
}