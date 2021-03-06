module.exports = {
  name       : 'giveroles',
  description: 'Assign Roles from Linked Account',
  execute (servMessage, id, res, g) {
    //Initialize Vars
    const {Client, MessageEmbed, Collection} = require('discord.js'),
          client                             = new Client(),
          axios                              = require('axios'),
          https                              = require('https'),
          guild                              = g ? g : servMessage.guild

    let req = axios
    //Check for dev API
    if (process.env.API_URL.indexOf('dev') > -1) {
      req = axios.create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
    }

    //Make the API Call to determine user information
    req.get(process.env.API_URL + 'user/' + (servMessage ? servMessage.author.id : id) + '?d')
      .then(result => {
        console.log(result)
          const {status, data} = result
          if (status !== 200) {
            sendError(servMessage, MessageEmbed, 'Unable to communicate with API.', res)
          } else {
            const user = data.data

            //Instantiate Variables
            const member  = guild.members.cache.get(servMessage ? servMessage.author.id : id),
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

            //Determine Roles
            for (let i = 0; i < user.roles.length; i++) {
              //Roles Table
              const role = user.roles[i]
              if (role.role.match(/US\d+/))
                roles.push('VATUSA Staff')
              if (role.role === 'USWT')
                roles.push('Web Team')
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
            }

            //Determine Region
            const determineRegion = async function () {
              if (user.facility === 'ZAE') roles.push('Academy')
              else if (user.facility === 'ZZN') roles.push('Non-Member')
              else if (user.facility !== 'ZHQ') {
                await axios.get(process.env.API_URL + 'facility/' + user.facility).then(facResult => {
                  const {status, data} = facResult
                  if (status !== 200 || !data.data.hasOwnProperty('facility')) {
                    sendError(servMessage, MessageEmbed, 'Unable to determine region from API.', res)
                  } else {
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
                  }
                }).catch(error => {
                  console.log(error)
                  sendError(servMessage, MessageEmbed, 'Unable to determine region from API.', res)
                })
              }
            }
            determineRegion().then(() => {

              //Determine Rating
              roles.push(ratings[user.rating_short])

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
                } else if (!member.hasPermission('ADMINISTRATOR')) {
                  newNick = `${user.fname} ${user.lname} | ${user.facility} ${user.rating_short}`
                }
              }

              //Assign Nickname
              if (newNick !== member.nickname) {
                nickChange = true
                member.setNickname(newNick, 'Roles Synchronization').catch(e => console.log(e))
              }
              //Assign Roles
              let roleStr = '',
                  excluded = ['Pilots', 'TMU', 'Trainers', 'Facilitators', 'Server Booster', 'VATNA/VATGOV', 'Muted', 'ATS-ZHQ', 'Social Media Team', 'Champion of Halloween']
              member.roles.cache.forEach(role => {
                if (!role.permissions.has('ADMINISTRATOR') && role.id !== guild.roles.everyone.id
                  && excluded.indexOf(role.name) < 0)
                  member.roles.remove(role).catch(e => console.log(e))
              })
              for (let i = 0; i < roles.length; i++) {
                const role = guild.roles.cache.find(role => role.name === roles[i])
                member.roles.add(role).catch(e => console.log(e))
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
              servMessage.channel.send(embed)
            })
          }
        }
      )
      .catch(error => {
        console.log(error)
        if (error.response.status === 404) {
          sendError(servMessage, MessageEmbed, 'Your Discord account is not linked on VATUSA or you are not in the VATUSA database. Link it here: https://vatusa.net/my/profile', res, false, "Not Linked")
        } else sendError(servMessage, MessageEmbed, error.data !== undefined ? error.data.toJSON() : 'Unable to communicate with API.', res)
      })
  }
}

function sendError (messageObj, me, msg, res, footer = true, header = false) {
  if (res)
    return res.json({
      status: 'error',
      msg   : msg
    })
  const embed = new me()
    // Set the title of the field
    .setTitle(header ? header : 'Error!')
    // Set the color of the embed
    .setColor(0xFF0000)
    // Set the main content of the embed
    .setDescription(msg)

  if (footer) embed.setFooter('Please try again later')
  // Send the embed to the same channel as the message
  messageObj.channel.send(embed)
}
