module.exports = {
  name: 'ready',
  once: true,
  execute (client) {
    require('../util').log('info', `Logged in to Discord as ${client.user.tag}!`)
  },
}