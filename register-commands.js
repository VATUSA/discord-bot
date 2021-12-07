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
const guildCommands     = [],
      globalCommands = [],
      guildCommandFiles = fs.readdirSync('./commands/guild').filter(file => file.endsWith('.js')),
      globalCommandFiles = fs.readdirSync('./commands/global').filter(file => file.endsWith('.js'))
for (const file of guildCommandFiles) {
  guildCommands.push(require(`./commands/guild/${file}`).data.toJSON())
}
for (const file of globalCommandFiles) {
  globalCommands.push(require(`./commands/global/${file}`).data.toJSON())
}

const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN)
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: guildCommands}).then(_ => console.log('Sucessfully registered VATUSA guild commands.'))
  .catch(console.error)
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: globalCommands}).then(_ => console.log('Sucessfully registered global commands.'))
  .catch(console.error)