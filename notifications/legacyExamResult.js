exports = module.exports = {
  name       : 'legacyExamResult',
  description: 'Legacy exam result.',
  execute    : (client, data, medium) => {
    const passed          = data.passed,
          score           = data.score,
          exam_name       = data.exam_name,
          result_id       = data.result_id,
          instructor_name = data.instructor_name,
          correct         = data.correct,
          possible        = data.possible,
          student_name    = data.student_name,
          reassign        = data.reassign,
          reassign_date   = data.reassign_date,
          studentId       = data.studentId,
          instructorId    = data.instructorId,
          taId            = data.taId,
          guildId         = data.guildId,
          channelId       = data.channelId,
          {italic, bold}  = require('@discordjs/builders'),
          util            = require('../util'),
          title           = passed ? 'Exam Passed' : 'Exam Failed',
          color           = passed ? '#04ba4a' : '#ff0000'
    if (medium === 'dm') {
      /** Student Content */
      if (passed) {
        const studentContent = `Congratulations! You have passed the exam, ${italic(exam_name)}, with a score of ${score}% (${correct}/${possible}).`
      } else {
        let studentContent = `Unfortunately, you have failed the exam, ${italic(exam_name)}, with a score of ${score}% (${correct}/${possible}).\n\n`
        if (reassign) {
          studentContent += `You will be able to take the exam again on ${reassign_date}.`
        } else {
          studentContent = `Your exam must be reassigned by your training staff.`
        }
        if (studentId && client.users.cache.get(studentId) !== undefined) {
          client.users.cache.get(studentId).send({
            embeds    : [util.embed(studentContent)
              .setColor(color)
              .setTitle(title)
            ],
            components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
          })
        }

        /** Staff Content */
        const staffContent = `${bold(student_name)} has ${(passed) ? 'passed' : 'failed'} a legacy exam.`
        if (instructorId && client.users.cache.get(instructorId) !== undefined) {
          client.users.cache.get(instructorId).send({
            embeds    : [util.embed(staffContent)
              .setTitle(`Legacy ${title}`)
              .setColor(color)
              .addFields({name: 'Exam', value: exam_name, inline: true},
                {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true},
                {name: 'Instructor', value: instructor_name})
            ],
            components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
          })
        }
        if (taId && client.users.cache.get(taId) !== undefined) {
          client.users.cache.get(taId).send(
            {
              embeds    : [
                util.embed(staffContent)
                  .setTitle(`Legacy ${title}`)
                  .setColor(color)
                  .addFields({name: 'Exam', value: exam_name, inline: true},
                    {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true},
                    {name: 'Instructor', value: instructor_name})
              ],
              components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
            })
        }
      }
    } else if (medium === 'channel') {
      const staffContent = `${bold(student_name)} has ${(passed) ? 'passed' : 'failed'} a legacy exam.`
      if (guildId && channelId && client.guilds.cache.get(guildId) !== undefined && client.guilds.cache.get(guildId).channels.cache.get(channelId) !== undefined) {
        client.guilds.cache.get(guildId).channels.cache.get(channelId).send({
          embeds: [util.embed(staffContent)
            .setTitle(`Legacy ${title}`)
            .setColor(color)
            .addFields({name: 'Exam', value: exam_name, inline: true},
              {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true},
              {name: 'Instructor', value: instructor_name})
          ],
          components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
        })
      }
    }
  }
}