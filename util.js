exports = module.exports = {
  name       : 'util',
  description: 'Helper functions.',
  fetch (client) {
    return client.guilds.fetch().then(_ => client.guilds.cache.forEach(g => {g.members.fetch()}))
  },
  embed (desc) {
    const {MessageEmbed} = require('discord.js')
    return new MessageEmbed()
      .setDescription(desc)
      .setFooter('VATSIM: VATUSA Division', 'https://www.vatusa.net/img/icon-fullcolor-discord-embed.png')
      .setTimestamp()
  },
  singleButtonLink (title, href) {
    const {MessageActionRow, MessageButton} = require('discord.js')
    return new MessageActionRow().addComponents(new MessageButton().setStyle('LINK').setLabel(title).setURL(href))
  }
}