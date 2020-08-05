/**
 * VATUSA Discord Bot
 * @author Blake Nahin <vatusa6@vatusa.net>
 */

//Initiate Discord API and Express
const {Client, Collection} = require('discord.js'),
      client               = new Client(),
      express              = require('express'),
      app                  = express(),
      cors                 = require('cors'),
      corsOptions          = {
        origin              : 'http://www.vatusa.devel',
        optionsSuccessStatus: 200,
        credentials         : true
      },
      helmet               = require('helmet')

//Initiate Environment Variables
require('dotenv').config()
const prefix      = process.env.PREFIX,
      expressPort = process.env.SERVER_PORT,
      mainURL     = process.env.MAIN_URL

//Load Commands
client.commands = new Collection()
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require('./commands/' + file)
  client.commands.set(command.name, command)
}

client.on('ready', () => {
  //Bot has logged in
  console.log(`Logged in as ${client.user.tag}!`)
})

//Message Listener
client.on('message', message => {
  if (!message.author.bot && message.mentions.users.first() && message.mentions.users.first().bot && (message.content.toLowerCase().startsWith('hi')
    || message.content.toLowerCase().startsWith('hello') || message.content.toLowerCase().startsWith('howdy')
    || message.content.toLowerCase().startsWith('hey')))
    message.channel.send(`Heyyy ${message.author}`)

  if (!message.content.startsWith(prefix)) return //Process messages that start with prefix

  const args = message.content.slice(prefix.length).split(/ +/) //Explode rest of message into array
  const command = args.shift().toLowerCase() //Get first entry of array

  if (!client.commands.has(command)) return //No command exists

  try {
    client.commands.get(command).execute(message, args)
  } catch (err) {
    console.log(err)
    message.reply('Unable to execute command. Blake broke something. ;(')
  }

})

//Log in to Discord
client.login(process.env.BOT_TOKEN)

/** Server - Assign Roles **/
app.use(helmet())
  .options('*', cors(corsOptions))
app.post('/assignRoles/:id', cors(corsOptions), (req, res) => {
  const id = req.params.id
  if (!client.guilds.cache.get(process.env.DISCORD_ID).members.cache.get(id))
    return res.json({
      status: 'error',
      msg   : 'You are not a member of the VATUSA Official Discord. Join it using the link below the Assign Roles button.'
    })
  client.commands.get('giveroles').execute(null, id, res, client.guilds.cache.get(process.env.DISCORD_ID))
})
app.get('/*', (req, res) => {
  res.send('Hello there. This is the VATUSA Discord Bot Server. If you are here, tell Blake the codeword: sharkbait.')
})
app.listen(expressPort, () => {
  console.log(`Express listening on port ${expressPort}`)
})