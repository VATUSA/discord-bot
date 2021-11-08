exports = module.exports = {
  name       : 'util',
  description: 'Helper functions.',
  fetch (client) {
    return client.guilds.fetch().then(_ => client.guilds.cache.forEach(g => {g.members.fetch()}))
  },
  async fetchUser (client, id) {
    let user
    try {
      await client.users.fetch(id).then(u => {
        user = u
      })
    } catch (DiscordAPIError) {
      return null
    }

    return user
  },
  fetchChannelCache (client, guildId, channelId) {
    if (guildId && channelId && client.guilds.cache.get(guildId) !== undefined && client.guilds.cache.get(guildId).channels.cache.get(channelId) !== undefined)
      return client.guilds.cache.get(guildId).channels.cache.get(channelId)
    return null
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
  },
  readDirSyncRecursive (dir, jsOnly = false) {
    const fs = require('fs'),
          p  = require('path')
    let list = []

    fs.readdirSync(dir).forEach(file => {
      const path = p.join(dir, file)
      if (fs.lstatSync(path).isDirectory()) {
        list = list.concat(this.readDirSyncRecursive(path, jsOnly))
      } else {
        if (jsOnly && !path.endsWith('.js')) return
        list.push(path)
      }
    })

    return list
  }

}