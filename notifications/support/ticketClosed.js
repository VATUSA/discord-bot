module.exports = exports = {
  name       : 'ticketClosed',
  description: 'Notifies the user that their ticket has been closed.',
  async execute (client, data, medium) {
    const userId                                               = data.userId,
          guildId                                              = data.guildId,
          channelId                                            = data.channelId,
          user                                                 = data.submitter,
          subject                                              = data.subject,
          body                                                 = data.body,
          id                                                   = data.id,
          assginedTo                                           = data.assignee,
          moment                                               = require('moment'),
          {MessageActionRow, MessageButton} = require('discord.js'),
          {time}                                               = require('@discordjs/builders'),
          interactionDurationMilliseconds                      = 1000 * 60 * 60 * 24 * 7,
          util                                                 = require('../../util')

    const fields = [
      {name: 'Subject', value: subject, inline: true},
      {name: 'Creator', value: user.fname + ' ' + user.lname, inline: true},
      {
        name  : 'Assigned To',
        value : assginedTo ? assignedTo.fname + ' ' + assignedTo.lname : 'None',
        inline: true
      }]

    const embed = util.embed(`To reply to (and reopen) this ticket, reply to this Discord message or click View Ticket. 
    You can reply by Discord until ${time(moment().add(interactionDurationMilliseconds, 'milliseconds').toDate())}`)
      .setColor('#bab704')
      .setTitle('Ticket Closed')
      .addFields(fields)

    const components = [
      new MessageActionRow().addComponents(
        util.linkComponent('View Ticket', 'https://vatusa.net/help/ticket/' + id),
        new MessageButton()
          .setCustomId('ticket-reopen')
          .setLabel('Reopen')
          .setStyle('SECONDARY')
          .setEmoji('🔓')
      )]

    if (medium === 'dm') {
      const user = await util.fetchUser(client, userId)

      return user.send({
        embeds    : [embed],
        components: components
      }).then(msg => {
          user.dmChannel.awaitMessages({
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
              msg.edit({embeds: [msg.embeds[0].setDescription('To reply to (and reopen) this message, click View Ticket.')]})
            })

          const reopenButtonCollector = msg.createMessageComponentCollector({
            filter: i => i.customId === 'ticket-reopen',
            time  : interactionDurationMilliseconds,
            max   : 1
          })
          reopenButtonCollector.on('collect', i => {
            //Reopen the ticket
            util.http().put(`/support/tickets/${id}/reopen`).then(result => {
              if (result.status === 200) {
                i.update({
                  components: [util.singleButtonLink('View Ticket', 'https://vatusa.net/help/ticket/' + id)],
                  embeds    : [msg.embeds[0].setDescription('To reply to this message, click View Ticket.')]
                })
                msg.reply({
                  embeds: [util.embed('')
                    .setTitle('✅ Ticket Reopened')
                    .setColor('#04ba4a')]
                })
              } else {
                util.log('error', '(NOTIFICATION ticketClosed) Error Reopening Ticket', result.data)
                msg.reply({
                  embeds: [util.embed(result.data.msg)
                    .setTitle('❌ Error Reopening Ticket')
                    .setColor('#ff0000')]
                })
              }
            }).catch(err => {
              util.log('error', '(NOTIFICATION ticketClosed) Error Reopening Ticket', err)
              msg.reply({
                embeds: [util.embed(err.data.msg)
                  .setTitle('❌ Error Reopening Ticket')
                  .setColor('#ff0000')]
              })
            })
          }).on('end', i => {
            //Remove the reopen button
            i.update({
              components: [util.singleButtonLink('View Ticket', 'https://vatusa.net/help/ticket/' + id)]
            })
          })
        }
      )
    } else if (medium === 'channel') {
      const channel = await util.fetchChannelCache(client, guildId, channelId)

      return channel.send({
        embeds    : [embed],
        components: components
      })
    }
  }
}