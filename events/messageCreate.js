module.exports = {
  name       : 'messageCreate',
  description: 'A message has been sent to the bot via DM.',
  execute (message) {
    const {bold, italic} = require('@discordjs/builders')

    //Ignore all messages that are not in DM, are from the bot, or are a reply.
    if (message.channel.type !== 'DM' || message.author.bot || message.reference) return false

    if (message.content === 'clear')
      message.channel.messages.fetch().then(_ => message.channel.messages.cache.filter(m => m.author.bot).forEach(m => m.delete()))
    else
      message.channel.send(`I am a simple robot. I do not know how to respond. I can only ${bold('clear')} messages. ${italic('You may have to tell me that a few times if the messages are especially old.')}`)
  }
}