exports = module.exports = {
  name       : 'util',
  description: 'Helper functions.',
  fetch (client, callback) {
    return client.guilds.fetch().then(_ => client.guilds.cache.forEach(g => {g.members.fetch().then(callback)}))
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
  linkComponent (label, url) {
    const {MessageButton} = require('discord.js')
    return new MessageButton().setStyle('LINK').setLabel(label).setURL(url)
  },
  singleButtonLink (title, href) {
    const {MessageActionRow} = require('discord.js')
    return new MessageActionRow().addComponents(this.linkComponent(title, href))
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
  },
  sendError (interaction, msg, res, footer = true, header = false, ephemeral = true, generic = false) {
    const {MessageEmbed} = require('discord.js')
    let embed
    if (res)
      return res.json({
        status: 'error',
        msg   : msg
      })
    if (generic)
      embed = this.embed(msg).setTitle(header ? header : 'Error').setColor('#ff0000')
    else
      embed = new MessageEmbed()
    // Set the title of the field
    embed.setTitle(header ? header : 'Error!')
      // Set the color of the embed
      .setColor('#ff0000')
      // Set the main content of the embed
      .setDescription(msg)

    if (footer && !generic) embed.setFooter('Please try again later')
    // Send the embed to the same channel as the message
    return interaction.reply({embeds: [embed], ephemeral: ephemeral})
  },
  http () {
    const axios  = require('axios'),
          moment = require('moment'),
          iss    = moment(),
          jwt    = require('jsonwebtoken'),
          https  = require('https'),
          token  = jwt.sign({
            iat: iss.unix(),
            iss: process.env.MAIN_URL,
            aud: process.env.API_URL,
            nbf: iss.unix(),
            exp: iss.add(1, 'minute').unix()
          }, process.env.BOT_SECRET, {algorithm: 'HS512'})

    //Check for dev API
    if (process.env.API_URL.indexOf('dev') > -1) {
      return axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
        baseURL   : process.env.API_URL,
        headers   : {
          'Authorization': 'Bearer ' + token
        }
      })
    } else {
      return axios.create({
        baseURL: process.env.API_URL,
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
    }
  }
}