module.exports = {
  name       : 'giverole',
  description: 'Assign Role',
  execute (message, args) {
    //Initialize Vars
    const {Client, MessageEmbed, Collection} = require('discord.js'),
          client                             = new Client(),
          axios                              = require('axios'),
          https                              = require('https'),
          TurndownService                    = require('turndown')

    //Convert params to array
    let params = ['']
    if (args.length) {
      params = []
      for (const arg of args) {
        params.push(arg)
      }
    } else {
      const embed = new MessageEmbed()
        .setTitle('Assign Roles')
        .setColor(0x0099FF)
        .setDescription('React to this message using the following emojis to receive the role!')
        .addFields({name: '✈️', value: 'Network Pilot', inline: true})
      // Send the embed to the same channel as the message
      const filter = (reaction) => {
        return reaction.emoji.name === '✈️'
      }

      message.channel.send(embed).then(message => {
        const collector = message.createReactionCollector(filter)

        collector.on('collect', (reaction, user) => {
          const role = message.guild.roles.cache.find(r => r.name === 'Pilots')
          message.guild.member(user).roles.add(role)
          console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
        })

        collector.on('end', collected => {
          console.log(`Collected ${collected.size} items`)
        })
      }).catch(console.error)
    }
  }
}