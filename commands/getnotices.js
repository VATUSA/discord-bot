module.exports = {
  name       : 'getnotices',
  description: 'Get Notices',
  execute (servMessage, args) {
    //Initialize Vars
    const {Client, RichEmbed, Collection} = require('discord.js'),
          client                          = new Client(),
          axios                           = require('axios'),
          https                           = require('https'),
          TurndownService                 = require('turndown')

    //Convert params to array
    let callList = ['']
    if (args.length) {
      callList = []
      for (const arg of args) {
        callList.push(arg)
      }
    }

    //Loop through each facility param (or blank, meaning all)
    let req = axios
    for (const call of callList) {
      //Check for dev API
      if (process.env.apiUrl.indexOf('dev') > -1) {
        req = axios.create({
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        })
      }

      //Make the API Call
      req.get(process.env.apiUrl + 'tmu/notices/' + call)
        .then(result => {
          const {status, data} = result
          if (status !== 200) {
            sendError(servMessage, RichEmbed, data.msg)
          } else {
            //Check if Notices exist
            if (Object.keys(data).length == 1 && data.hasOwnProperty('testing')) {
              //No Active Notices
              const embed = new RichEmbed()
              embed.setTitle('No Notices')
                // Set the color of the embed
                .setColor(0xAA6708)
                // Set the main content of the embed
                .setDescription('No active notices.')

                .setFooter('Traffic must be light, eh?')
              // Send the embed to the same channel as the message
              servMessage.channel.send(embed)
              return
            }

            //Add each Notice to an Embed
            for (const notice in data) {
              if (data.hasOwnProperty(notice)) {
                if (data[notice]) {
                  console.log(data[notice])
                  const {tmu_facility_id, priority, message, expire_date, tmu_facility} = data[notice]
                  let color = undefined
                  switch (priority) {
                    case 1:
                      color = 0xAA6708
                      break
                    case 2:
                      color = 0x5cb85c
                      break
                    case 3:
                      color = 0xFF0000
                  }

                  const turndown = new TurndownService() //convert HTML to Markdown

                  const embed = new RichEmbed()
                  // Set the title of the field
                  console.log(tmu_facility)
                  embed.setTitle(tmu_facility.name)
                    // Set the color of the embed
                    .setColor(color)
                    // Set the main content of the embed
                    .setDescription(turndown.turndown(message))

                    .setFooter('Expires ' + ((expire_date != null) ? expire_date : 'Never'))
                  // Send the embed to the same channel as the message
                  servMessage.channel.send(embed)
                }
              }
            }

          }
        })
        .catch(error => {
          console.log(error)
          sendError(servMessage, RichEmbed, error.data !== undefined ? error.data.toJSON() : error)
        })
    }
  },
}

function sendError (messageObj, re, msg) {
  const embed = new re()
    // Set the title of the field
    .setTitle('Error!')
    // Set the color of the embed
    .setColor(0xFF0000)
    // Set the main content of the embed
    .setDescription(msg)

    .setFooter('Please try again later')
  // Send the embed to the same channel as the message
  messageObj.channel.send(embed)
}