module.exports = {
  name       : 'messageCreate',
  description: 'A message has been sent to the bot via DM.',
  execute (message) {
    if (message.channel.type !== 'DM' || message.author.bot) return false

    if (message.content === 'clear')
      message.channel.messages.fetch().then(_ => message.channel.messages.cache.filter(m => m.author.bot).forEach(m => m.delete()))
  }
}