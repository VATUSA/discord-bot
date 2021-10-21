exports = module.exports = {
  name: 'helpers',
  description: 'Helper functions.',
  fetch (client) {
    client.guilds.fetch().then(_ => client.guilds.cache.forEach(g => {g.members.fetch()}))
  }
}