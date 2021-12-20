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
      util                          = require('./util.js')

//Load Commands
client.commands = new Collection()
const fs = require('fs')
const commandFiles = util.readDirSyncRecursive('./commands', true)
for (const file of commandFiles) {
  const command = require(`./${file}`)
  client.commands.set(command.name, command)
}

//Load Notifications
client.notifications = new Collection()
const notificationFiles = util.readDirSyncRecursive('./notifications', true)
for (const file of notificationFiles) {
  const notification = require(`./${file}`)
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
client.login(process.env.BOT_TOKEN).then(() => {
  //Start Server
  require('./server')(client)

  //Start Cron Jobs
  if (process.env.CRON_ENABLED === 'true')
    require('./cron').init(client)
}).catch(err => {
  util.log('error', 'Failed to log in to Discord', err)
})

