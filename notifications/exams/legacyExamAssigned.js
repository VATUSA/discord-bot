module.exports = {
  name       : 'legacyExamAssigned',
  description: 'Legacy exam assigned.',
  execute    : async (client, data, medium) => {
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
          {italic, time}                                  = require('@discordjs/builders'),
          util                                            = require('../../util')

    //Fetch Users
    const student = await util.fetchUser(client, studentId),
          staff = await util.fetchUser(client, staffId)

    if (medium === 'dm') {
      let studentContent = `You have been assigned the Legacy exam ${italic(examName)} by instructor ${instructorName}. You have until ${time(new Date(endDate), 'f')} to complete the examination before it expires.`
      if (cbtRequired)
        studentContent += `\n\n Before attempting the exam, you must complete ${cbtFacility}'s ${cbtBlock} CBT course by visiting https://www.vatusa.net/cbt/${cbtFacility}`
      if (student)
        return student.send({
          embeds    : [util.embed(studentContent)
            .setColor('#0996b1')
            .setTitle('Legacy Exam Assigned')],
          components: [util.singleButtonLink('Go to Exam Center', 'https://vatusa.net/exam/0')]
        })

      const staffContent = `An instructor has assigned a legacy exam to a student in your facility.`
      if (staff) {
        return staff.send({
          embeds: [util.embed(staffContent)
            .setColor('#0996b1')
            .setTitle('Legacy Exam Assigned')
            .addFields(
              {name: 'Student', value: studentName},
              {name: 'Exam', value: examName},
              {name: 'Instructor', value: instructorName})
          ]
        })
      }
    } else if (medium === 'channel') {
      const staffContent = `An instructor has assigned a legacy exam to a student.`,
            channel = util.fetchChannelCache(client, guildId, channelId)
      if (channel) {
        return channel.send({
          embeds: [util.embed(staffContent)
            .setColor('#0996b1')
            .setTitle('Legacy Exam Assigned')
            .addFields(
              {name: 'Student', value: studentName},
              {name: 'Exam', value: examName},
              {name: 'Instructor', value: instructorName})
          ]
        })
      }
    }
  }
}