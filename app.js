/**
 * VATUSA Discord Bot
 * @author Blake Nahin <b.nahin@vatusa.net>
 */

//Initiate Environment Variables
require('dotenv').config()
const expressPort = process.env.SERVER_PORT,
      mainURL     = process.env.MAIN_URL

//Initiate Discord API and Express
const {Client, Collection, Intents} = require('discord.js'),
      client                        = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
      }),
      express                       = require('express'),
      app                           = express(),
      cors                          = require('cors'),
      corsOptions                   = {
        origin              : mainURL,
        optionsSuccessStatus: 200,
        credentials         : true
      },
      helmet                        = require('helmet')

//Load Commands
client.commands = new Collection()
const fs = require('fs')
const {errors} = require("jshint/src/messages");
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

client.once('ready', () => {
  //Bot has logged in
  console.log(`Logged in as ${client.user.tag}!`)
})

//Message Listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return //Skip if interaction is not a registered command

    const command = client.commands.get(interaction.commandName)
    if (!command) return //Command does not exist
    try {
      await command.execute(interaction)
    } catch (err) {
      console.error(err)
      await interaction.reply({content: 'Unable to execute command. Blake broke something. ;('})
    }
  }
)

//Log in to Discord
client.login(process.env.BOT_TOKEN)

/** Server - Assign Roles **/
app.use(helmet())
  .options('*', cors(corsOptions))
app.post('/assignRoles/:id', cors(corsOptions), (req, res) => {
  const id = req.params.id;
  client.guilds.cache.get(process.env.DISCORD_ID).members.fetch(id).then(member => {
      client.commands.get('giveroles').execute(null, id, res, client.guilds.cache.get(process.env.DISCORD_ID))
  })
})
app.get('/*', (req, res) => {
  res.send('Hello there. This is the VATUSA Discord Bot Server. If you are here, tell Blake the codeword: sharkbait.')
})
app.listen(expressPort, () => {
  console.log(`Express listening on port ${expressPort}`)
})
