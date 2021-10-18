module.exports = {
  name: 'ready',
  once: true,
  execute (client) {
    client.guilds.fetch(process.env.GUILD_ID).then(_ =>client.guilds.cache.get(process.env.GUILD_ID).members.fetch())
    console.log(`Logged in as ${client.user.tag}!`)
  }
}