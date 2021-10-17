/**
 * Register slash commands with the Discord server
 * @author Blake Nahin <b.nahin@vatusa.net>
 */
const {SlashCommandBuilder} = require('@discordjs/builders'),
      {REST}                = require('@discordjs/rest'),
      {Routes}              = require('discord-api-types/v9'),
      fs                    = require('fs'),
      dotenv                = require('dotenv')

//Load env vars
dotenv.config()

//Parse commands
const commands     = [],
      commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  commands.push(require(`./commands/${file}`).data.toJSON())
}

const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN)
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands}).then(_ => console.log('Sucessfully registered commands.'))
  .catch(console.error)