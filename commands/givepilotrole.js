module.exports = {
  name       : 'givepilotrole',
  description: 'Assign Pilot Role',
  execute (message, args) {
    //Initialize Vars
    const { MessageEmbed } = require('discord.js')

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
        message.react('✈️').catch(e => console.log(e))
        const collector = message.createReactionCollector(filter)

        collector.on('collect', (reaction, user) => {
          if(user.bot) return;
          const role = message.guild.roles.cache.find(r => r.name === 'Pilots')
          message.guild.member(user).roles.add(role).catch(e => console.log(e))
          console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
        })

        collector.on('dispose', (reaction, user) => {
          const role = message.guild.roles.cache.find(r => r.name === 'Pilots')
          message.guild.member(user).roles.remove(role).catch(e => console.log(e))
          console.log(`Removed ${reaction.emoji.name} from ${user.tag}`)
        })

        collector.on('end', collected => {
          console.log(`Collected ${collected.size} items`)
        })
      }).catch(console.error)
    }
  }
}