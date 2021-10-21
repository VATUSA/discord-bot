const {MessageEmbed} = require('discord.js')
module.exports = {
  name       : 'legacyExamAssigned',
  description: 'Legacy exam assigned.',
  execute    : (client, data, medium) => {
    const examName                                        = data.exam_name,
          instructorName                                  = data.instructor_name,
          studentName                                     = data.student_name,
          endDate                                         = data.end_date,
          cbtRequired                                     = data.cbt_required,
          cbtFacility                                     = data.cbt_facility,
          cbtBlock                                        = data.cbt_block,
          studentId                                       = data.student_id,
          staffId                                         = data.staff_id,
          guildId                                         = data.guildId,
          channelId                                       = data.channelId,
          {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js'),
          {italic}                                        = require('@discordjs/builders')
    if (medium === 'dm') {
      let studentContent = `You have been assigned the Legacy exam ${italic(examName)} by instructor ${instructorName}. You have until ${endDate} UTC to complete the examination before it expires.`
      if (cbtRequired)
        studentContent += `\n\n Before attempting the exam, you must complete ${cbtFacility}'s ${cbtBlock} CBT course by visiting https://www.vatusa.net/cbt/${cbtFacility}`
      if (studentId && client.users.cache.get(studentId) !== undefined)
        client.users.cache.get(studentId).send({
          embeds    : [new MessageEmbed()
            .setColor(0x5cb85c)
            .setTitle('Legacy Exam Assigned')
            .setDescription(studentContent)
            .setFooter('VATSIM: VATUSA Division', 'https://www.vatusa.net/img/icon-fullcolor-discord-embed.png')
            .setTimestamp()],
          components: [new MessageActionRow().addComponents(
            new MessageButton().setStyle('LINK').setLabel('Go to Exam Center').setURL('https://vatusa.net/exam/0'))]
        })

      const staffContent = `An instructor has assigned a legacy exam to a student in your facility.`
      if (staffId && client.users.cache.get(staffId) !== undefined) {
        client.users.cache.get(staffId).send({
          embeds: [new MessageEmbed()
            .setColor(0x5cb85c)
            .setTitle('Legacy Exam Assigned')
            .setDescription(staffContent)
            .addFields(
              {name: 'Student', value: studentName},
              {name: 'Exam', value: examName},
              {name: 'Instructor', value: instructorName})
            .setFooter('VATSIM: VATUSA Division', 'https://www.vatusa.net/img/icon-fullcolor-discord-embed.png')
            .setTimestamp()]
        })
      }
    } else if (medium === 'channel') {
      const staffContent = `An instructor has assigned a legacy exam to a student.`
      if (guildId && channelId && client.guilds.cache.get(guildId) !== undefined && client.guilds.cache.get(guildId).channels.cache.get(channelId) !== undefined) {
        client.guilds.cache.get(guildId).channels.cache.get(channelId).send({
          embeds: [new MessageEmbed()
            .setColor(0x5cb85c)
            .setTitle('Legacy Exam Assigned')
            .setDescription(staffContent)
            .addFields(
              {name: 'Student', value: studentName},
              {name: 'Exam', value: examName},
              {name: 'Instructor', value: instructorName})
            .setFooter('VATSIM: VATUSA Division', 'https://www.vatusa.net/img/icon-fullcolor-discord-embed.png')
            .setTimestamp()]
        })
      }
    }
  }
}