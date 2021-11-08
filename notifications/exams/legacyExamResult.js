exports = module.exports = {
  name       : 'legacyExamResult',
  description: 'Legacy exam result.',
  execute    : async (client, data, medium) => {
    const passed               = data.passed,
          score                = data.score,
          examName            = data.exam_name,
          resultId            = data.result_id,
          instructorName      = data.instructor_name,
          correct              = data.correct,
          possible             = data.possible,
          studentName         = data.student_name,
          reassign             = data.reassign,
          reassignDate        = data.reassign_date,
          studentId            = data.studentId,
          instructorId         = data.instructorId,
          guildId              = data.guildId,
          channelId            = data.channelId,
          {italic, bold, time} = require('@discordjs/builders'),
          util                 = require('../../util'),
          title                = passed ? 'Exam Passed' : 'Exam Failed',
          color                = passed ? '#04ba4a' : '#ff0000'

    //Fetch Users
    const student      = await util.fetchUser(client, studentId),
          instructor   = await util.fetchUser(client, instructorId),
          staffContent = `${bold(studentName)} has ${(passed) ? 'passed' : 'failed'} a legacy exam.`
    let staffEmbed = util.embed(staffContent)
      .setTitle(`Legacy ${title}`)
      .setColor(color)
      .addFields({name: 'Exam', value: examName, inline: true},
        {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true})
    if (passed)
      staffEmbed.addField('Instructor', instructorName)
    else if (reassignDate)
      staffEmbed.addFields({name: 'Instructor', value: instructorName, inline: true},
        {name: 'Reassign Date', value: time(new Date(reassignDate), 'f'), inline: true})

    if (medium === 'dm') {
      /** Student Content */
      let studentContent
      if (passed) {
        studentContent = `Congratulations! You have passed the exam, ${italic(examName)}, with a score of ${score}% (${correct}/${possible}).`
      } else {
        studentContent = `Unfortunately, you have failed the exam, ${italic(examName)}, with a score of ${score}% (${correct}/${possible}).\n\n`
        if (reassign) {
          studentContent += `You will be able to take the exam again on ${time(new Date(reassignDate), 'f')}.`
        } else {
          studentContent = `Your exam must be reassigned by your training staff.`
        }
      }
      if (student) {
        return student.send({
          embeds    : [util.embed(studentContent)
            .setColor(color)
            .setTitle(title)
          ],
          components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${resultId}`)]
        })
      }

      /** Staff Content */
      if (instructor) {
        return instructor.send({
          embeds    : [staffEmbed],
          components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${resultId}`)]
        })
      }
    } else if (medium === 'channel') {
      const channel = util.fetchChannelCache(client, guildId, channelId)
      if (channel) {
        return channel.send({
          embeds    : [staffEmbed],
          components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${resultId}`)]
        })
      }
    }
  }
}