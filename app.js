/**
 * VATUSA Discord Bot
 * @author Blake Nahin <b.nahin@vatusa.net>
 */

//Initiate Environment Variables
require('dotenv').config()

//Initiate Discord API and Express
const {Client, Collection, Intents} = require('discord.js'),
      client                        = new Client({
        intents : [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS],
        partials: ['CHANNEL']
      }),
      helpers                       = require('./util.js')

//Load Commands
client.commands = new Collection()
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

//Load Notifications
client.notifications = new Collection()
const notificationFiles = fs.readdirSync('./notifications').filter(file => file.endsWith('.js'))
for (const file of notificationFiles) {
  const notification = require(`./notifications/${file}`)
  client.notifications.set(notification.name, notification)
}

//Register Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  if (event.once)
    client.once(event.name, (...args) => event.execute(...args))
  else
    client.on(event.name, (...args) => event.execute(...args))
}

//Log in to Discord
client.login(process.env.BOT_TOKEN).then(_ => {
  //Fetch Guilds and Members
  helpers.fetch(client)
  setInterval(_ => helpers.fetch(client), 60 * 10 * 1000) //Fetch every 10 minutes
})

//Start Server
require('./server')(client)
