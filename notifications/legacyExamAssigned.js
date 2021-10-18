module.exports = {
  name       : 'legacyExamAssigned',
  description: 'Legacy exam assigned.',
  execute    : async (client, data) => {
    const examName                                                              = data.exam_name,
          instructorName                                                        = data.instructor_name,
          studentName                                                           = data.student_name,
          endDate                                                               = data.end_date,
          cbtRequired                                                           = data.cbt_required,
          facility                                                              = data.facility,
          cbtFacility                                                           = data.cbt_facility,
          cbtBlock                                                              = data.cbt_block,
          studentId                                                             = data.student_id,
          staffIds                                                              = data.staff_ids,
          {MessageEmbed, MessageActionRow, MessageButton}                       = require('discord.js'),
          {bold, italic, strikethrough, underscore, spoiler, quote, blockQuote} = require('@discordjs/builders')

    let studentContent = `You have been assigned the Legacy exam ${italic(examName)} by instructor ${instructorName}. You have until ${endDate} UTC to complete the examination before it expires.`
    if (cbtRequired)
      studentContent += `\n\n Before attempting the exam, you must complete ${cbtFacility}'s ${cbtBlock} CBT course by visiting https://www.vatusa.net/cbt/${cbtFacility}`
    if (studentId && client.users.cache.get(studentId))
      await client.users.cache.get(studentId).send({
        embeds    : [new MessageEmbed()
          .setColor(0x5cb85c)
          .setTitle('Legacy Exam Assigned')
          .setDescription(studentContent)
          .setFooter('VATSIM: VATUSA Division')
          .setTimestamp()],
        components: [new MessageActionRow().addComponents(
          new MessageButton().setStyle('LINK').setLabel('Go to Exam Center').setURL('https://vatusa.net/exam/0'))]
      })

    //TODO: Instructor messages (using fields)
  }
}