module.exports = exports = {
  name       : 'ticketNew',
  description: 'Notifies the support team of a new ticket.',
  async execute (client, data, medium) {
    const staffId                                              = data.staffId,
          guildId                                              = data.guildId,
          channelId                                            = data.channelId,
          user                                                 = data.submitter,
          subject                                              = data.subject,
          body                                                 = data.body,
          id                                                   = data.id,
          assignedTo                                           = data.assignee,
          assignList                                           = data.assignList,
          util                                                 = require('../../util'),
          {MessageSelectMenu, MessageActionRow, MessageButton} = require('discord.js'),
          {time}                                               = require('@discordjs/builders'),
          moment                                               = require('moment'),
          interactionDurationMilliseconds                      = 1000 * 60 * 60 * 24 * 7,
          axios                                                = require('axios'),
          jwt                                                  = require('jsonwebtoken')

    const fields = [
      {name: 'Subject', value: subject, inline: true},
      {name: 'Creator', value: user.fname + ' ' + user.lname, inline: true},
      {
        name  : 'Assigned To',
        value : assignedTo ? assignedTo.fname + ' ' + assignedTo.lname : 'None',
        inline: true
      }]
    fields.push({name: 'Message', value: body, inline: false})

    const embed = util.embed(`To reply to this ticket, reply to this Discord message or click View Ticket. 
    You can reply by Discord until ${time(moment().add(interactionDurationMilliseconds, 'milliseconds').toDate())}`)
      .setColor('#04ba4a')
      .setTitle('New Ticket')
      .addFields(fields)

    const options = []
    for (const staff of assignList) {
      options.push({
        label      : staff.name,
        description: staff.role,
        value      : `${staff.cid}`
      })
    }

    const components = [
      new MessageActionRow().addComponents(
        util.linkComponent('View Ticket', 'https://vatusa.net/help/ticket/' + id),
        new MessageButton()
          .setCustomId('ticket-close')
          .setLabel('Close')
          .setStyle('SUCCESS')
          .setEmoji('🔒')
      ),
      new MessageActionRow().addComponents(new MessageSelectMenu()
        .setCustomId(`ticket-assign`)
        .setPlaceholder('Assign to...')
        .addOptions(options)
      )]

    if (medium === 'dm') {
      const staff = await util.fetchUser(client, staffId)

      return staff.send({
        embeds    : [embed],
        components: components
      }).then(msg => {
          staff.dmChannel.awaitMessages({
            filter: m => m.reference?.messageId === msg.id,
            max   : 1,
            time  : interactionDurationMilliseconds,
            errors: ['time']
          }).then(collected => {
            // Send Reply
            const reply = collected.first(),
                  msg   = reply.content
            //
          })
            .catch(_ => {
              //Remove Discord Reply instructions
              msg.edit({embeds: [msg.embeds[0].setDescription('To reply to this message, click View Ticket.')]})
            })

          const closeButtonCollector = msg.createMessageComponentCollector({
                  filter: i => i.customId === 'ticket-close',
                  time  : interactionDurationMilliseconds
                }),
                assignMenuCollector  = msg.createMessageComponentCollector({
                  filter: i => i.customId === 'ticket-assign',
                  time  : interactionDurationMilliseconds
                })
          closeButtonCollector.on('collect', i => {
            //Close the ticket
            util.http().put(`/support/tickets/${id}/close`, {user_id: i.user.id}).then(result => {
              if (result.status === 200 && result.data?.data?.status === 'OK') {
                i.update({
                  components: [util.singleButtonLink('View Ticket', 'https://vatusa.net/help/ticket/' + id)],
                  embeds    : [msg.embeds[0].setDescription('To reply to this message, click View Ticket.')]
                })
                msg.reply({
                  embeds: [util.embed('')
                    .setTitle('✅ Ticket Closed')
                    .setColor('#04ba4a')]
                })
              } else {
                console.error(result.data)
                msg.reply({
                  embeds: [util.embed(result.data?.msg ?? 'Please try again later.')
                    .setTitle('❌ Error Closing Ticket')
                    .setColor('#ff0000')]
                })
              }
            }).catch(err => {
              console.error(err)
              msg.reply({
                embeds: [util.embed(err.data?.msg ?? 'Please try again later.')
                  .setTitle('❌ Error Closing Ticket')
                  .setColor('#ff0000')]
              })
            })
          }).on('end', i => {
            //Remove the close button
            i.edit({
              components: [util.singleButtonLink('View Ticket', 'https://vatusa.net/help/ticket/' + id)]
            })
          })
          assignMenuCollector.on('collect', i => {
            //Assign the ticket
            const cid = i.values[0]
          }).on('end', _ => {
            //Remove the assign menu
          })

        }
      )
    } else if (medium === 'channel'
    ) {
      const channel = await util.fetchChannelCache(client, guildId, channelId)

      return channel.send({
        embeds    : [embed],
        components: components
      })
    }
  }
}