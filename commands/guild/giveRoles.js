const {SlashCommandBuilder} = require('@discordjs/builders')
const util = require('../../util')

module.exports = {
  name       : 'giveRoles',
  description: 'Assign Roles from Linked Account',
  data       : new SlashCommandBuilder()
    .setName('giveroles')
    .setDescription('Assign roles for channel access. Your Discord account must be linked on the VATUSA website.'),
  async execute (interaction, id, res, g) {
    //Initialize Vars
    const {MessageEmbed} = require('discord.js'),
          guild          = g ? g : interaction.guild,
          util           = require('../../util'),
          http           = util.http()

    //Make the API Call to determine user information
    await http.get('user/' + (interaction ? interaction.member.id : id) + '?d')
      .then(async result => {
          //console.log(result)
          const {status, data} = result
          if (status !== 200) {
            util.sendError(interaction, 'Unable to communicate with API.', res)
          } else {
            const user = data.data

            //Instantiate Variables
            const member  = interaction ? interaction.member : guild.members.cache.get(id),
                  ratings = {
                    AFK: 'Inactive',
                    SUS: 'Suspended',
                    OBS: 'Observer',
                    S1 : 'Student 1',
                    S2 : 'Student 2',
                    S3 : 'Student 3',
                    C1 : 'Controller 1',
                    C3 : 'Controller 3',
                    I1 : 'Instructor 1',
                    I3 : 'Instructor 3',
                    SUP: 'Supervisor',
                    ADM: 'Administrator',
                  }
            let roles      = [],
                facStaff   = false,
                newNick    = member.nickname,
                nickChange = false

            if (member.permissions.has('ADMINISTRATOR') || user.rating_short === 'ADM') {
              const ownerName = interaction?.guild.members.cache.get(interaction.guild.ownerId).nickname
              return util.sendError(interaction, `Since you have an administrator role, you must contact the Server Owner ${ownerName ? '(' + ownerName + ')' : ''} to receive your roles.`, res, false, 'Administrator Roles')
            }
            //Determine Roles
            for (let i = 0; i < user.roles.length; i++) {
              //Roles Table
              const role = user.roles[i]
              if (role.role.match(/US\d+/)) {
                const ownerName = interaction?.guild.members.cache.get(interaction.guild.ownerId).nickname
                return util.sendError(interaction, `Since you have an administrator role, you must contact the Server Owner ${ownerName ? '(' + ownerName + ')' : ''} to receive your roles.`, res, false, 'Administrator Roles')
              }
              if (role.role === 'USWT') {
                const ownerName = interaction?.guild.members.cache.get(interaction.guild.ownerId).nickname
                return util.sendError(interaction, `Since you have an administrator role, you must contact the Server Owner ${ownerName ? '(' + ownerName + ')' : ''} to receive your roles.`, res, false, 'Administrator Roles')
              }
              if (role.role === 'ACE')
                roles.push('ACE Team')
              if (role.role === 'ATM') {
                facStaff = 'ATM'
                roles.push('ATM/DATM')
              }
              if (role.role === 'DATM') {
                facStaff = 'DATM'
                roles.push('ATM/DATM')
              }
              if (role.role === 'TA') {
                facStaff = 'TA'
                roles.push('TA')
              }
              if (role.role === 'EC') {
                facStaff = 'EC'
                roles.push('EC')
              }
              if (role.role === 'FE') {
                facStaff = 'FE'
                roles.push('FE')
              }
              if (role.role === 'WM') {
                facStaff = 'WM'
                roles.push('WM')
              }
              if (role.role === 'MTR') {
                roles.push('Mentor')
              }
            }

            //Determine Region
            const determineRegion = async function () {
              if (user.facility === 'ZAE') roles.push('Academy')
              else if (user.facility === 'ZZN') roles.push('Non-Member')
              else if (user.facility !== 'ZHQ') {
                await http.get('facility/' + user.facility).then(facResult => {
                  const {status, data} = facResult
                  if (status !== 200 || !data.data.hasOwnProperty('facility')) {
                    return util.sendError(interaction, 'Unable to determine region from API.', res)
                  }
                  switch (parseInt(data.data.facility.info.region)) {
                    case 4:
                      roles.push('Western Region')
                      break
                    case 5:
                      roles.push('South Central Region')
                      break
                    case 6:
                      roles.push('Midwestern Region')
                      break
                    case 7:
                      roles.push('Northeastern Region')
                      break
                    case 8:
                      roles.push('Southeastern Region')
                      break
                  }
                }).catch(error => {
                  util.sendError(interaction, 'Unable to determine region from API.', res)
                  util.log('error', '(COMMAND giveRoles) Unable to determine region from API.', error)
                })
              }
            }
            determineRegion().then(async () => {
              //Determine Rating
              let rating = ratings[user.rating_short]
              if (user.facility === 'ZZN' && (user.rating_short === 'I1' || user.rating_short === 'I3')) {
                rating += ' (Visitor)'
              }
              roles.push(rating)

              //Determine Nickname
              for (let i = 0; i < roles.length; i++) {
                if (roles[i] === 'Academy') {
                  newNick = `${user.fname} ${user.lname} | ZAE`
                  i = roles.length
                } else if (roles[i] === 'Non-Member') {
                  newNick = `${user.fname} ${user.lname} | ${user.rating_short}`
                  i = roles.length
                } else if (facStaff !== false) {
                  newNick = `${user.fname} ${user.lname} | ${user.facility} ${facStaff}`
                  i = roles.length
                } else {
                  newNick = `${user.fname} ${user.lname} | ${user.facility} ${user.rating_short}`
                }
              }

              //Assign Nickname
              if (newNick !== member.nickname) {
                nickChange = true
                if (newNick.length <= 32)
                  member.setNickname(newNick, 'Roles Synchronization').catch(e => console.error(e))
              }
              //Assign Roles
              let roleStr  = '',
                  excluded = ['Pilots', 'Trainers', 'Server Booster', 'VATGOV', 'Muted', 'ATS-ZHQ', 'Social Media Team', 'Champion of Halloween']
              member.roles.cache.forEach(role => {
                if (role.id !== guild.roles.everyone.id
                  && excluded.indexOf(role.name) < 0
                  && roles.indexOf(role.name) < 0)
                  member.roles.remove(role).catch(e => console.error(e))
              })
              for (let i = 0; i < roles.length; i++) {
                const role = guild.roles.cache.find(role => role.name === roles[i])
                if (!member.roles.cache.has(role.id))
                  member.roles.add(role).catch(e => console.error(e))
                roleStr += `${role} `
              }
              if (res)
                return res.json({
                  status: 'OK',
                  msg   : `Your roles have been assigned, ${newNick}!<br><em>${roles.join(', ')}</em>`
                })

              const embed = new MessageEmbed()
                // Set the title of the field
                .setTitle('Your roles have been assigned.')
                // Set the color of the embed
                .setColor(0x5cb85c)
                // Set the main content of the embed
                .setDescription(roleStr)
              embed.setFooter(nickChange ? `Your new nickname is: ${newNick}` : newNick)

              // Send the embed to the same channel as the message
              return interaction ? interaction.reply({embeds: [embed]}) : true
            })
          }
        }
      )
      .catch(error => {
        if (error.response.status === 404) {
          return util.sendError(interaction, 'Your Discord account is not linked on VATUSA or you are not in the VATUSA database. Link it here: https://vatusa.net/my/profile', res, false, 'Not Linked')
        }
        util.sendError(interaction, error.data !== undefined ? error.data.toJSON() : 'Unable to communicate with API.', res)
        util.log('error', '(COMMAND giveRoles) Unable to communicate with API.', error)
      })
  }
}

