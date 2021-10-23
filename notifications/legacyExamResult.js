const util = require('../util')
const {time} = require('@discordjs/builders')
exports = module.exports = {
  name       : 'legacyExamResult',
  description: 'Legacy exam result.',
  execute    : async (client, data, medium) => {
    const passed               = data.passed,
          score                = data.score,
          exam_name            = data.exam_name,
          result_id            = data.result_id,
          instructor_name      = data.instructor_name,
          correct              = data.correct,
          possible             = data.possible,
          student_name         = data.student_name,
          reassign             = data.reassign,
          reassign_date        = data.reassign_date,
          studentId            = data.studentId,
          instructorId         = data.instructorId,
          taId                 = data.taId,
          guildId              = data.guildId,
          channelId            = data.channelId,
          {italic, bold, time} = require('@discordjs/builders'),
          util                 = require('../util'),
          title                = passed ? 'Exam Passed' : 'Exam Failed',
          color                = passed ? '#04ba4a' : '#ff0000'

    //Fetch Users
    if (studentId) {
      await client.users.fetch(studentId)
    }
    if (instructorId) {
      await client.users.fetch(instructorId)
    }
    if (taId) {
      await client.users.fetch(taId)
    }

    if (medium === 'dm') {
      /** Student Content */
      let studentContent
      if (passed) {
        studentContent = `Congratulations! You have passed the exam, ${italic(exam_name)}, with a score of ${score}% (${correct}/${possible}).`
      } else {
        studentContent = `Unfortunately, you have failed the exam, ${italic(exam_name)}, with a score of ${score}% (${correct}/${possible}).\n\n`
        if (reassign) {
          studentContent += `You will be able to take the exam again on ${time(new Date(reassign_date + ' UTC'), 'f')}.`
        } else {
          studentContent = `Your exam must be reassigned by your training staff.`
        }
      }
      if (studentId && client.users.cache.get(studentId) !== undefined) {
        return client.users.cache.get(studentId).send({
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

        let embed = util.embed(staffContent)
          .setTitle(`Legacy ${title}`)
          .setColor(color)
          .addFields({name: 'Exam', value: exam_name, inline: true},
            {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true})
        if (passed)
          embed.addField('Instructor', instructor_name)
        else if (reassign_date)
          embed.addFields({name: 'Instructor', value: instructor_name, inline: true},
            {name: 'Reassign Date', value: time(new Date(reassign_date + ' UTC'), 'f'), inline: true})

        return client.users.cache.get(instructorId).send({
          embeds    : [embed],
          components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
        })
      }
      if (taId && client.users.cache.get(taId) !== undefined) {
        let embed = util.embed(staffContent)
          .setTitle(`Legacy ${title}`)
          .setColor(color)
          .addFields({name: 'Exam', value: exam_name, inline: true},
            {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true})
        if (passed)
          embed.addField('Instructor', instructor_name)
        else if (reassign_date)
          embed.addFields({name: 'Instructor', value: instructor_name, inline: true},
            {name: 'Reassign Date', value: time(new Date(reassign_date + ' UTC'), 'f'), inline: true})
        return client.users.cache.get(taId).send(
          {
            embeds    : [embed],
            components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
          })
      }
    } else if (medium === 'channel') {
      const staffContent = `${bold(student_name)} has ${(passed) ? 'passed' : 'failed'} a legacy exam.`
      if (guildId && channelId && client.guilds.cache.get(guildId) !== undefined && client.guilds.cache.get(guildId).channels.cache.get(channelId) !== undefined) {
        let embed = util.embed(staffContent)
          .setTitle(`Legacy ${title}`)
          .setColor(color)
          .addFields({name: 'Exam', value: exam_name, inline: true},
            {name: 'Score', value: `${score}% (${correct}/${possible})`, inline: true})
        if (passed)
          embed.addField('Instructor', instructor_name)
        else if (reassign_date)
          embed.addFields({name: 'Instructor', value: instructor_name, inline: true},
            {name: 'Reassign Date', value: time(new Date(reassign_date + ' UTC'), 'f'), inline: true})
        return client.guilds.cache.get(guildId).channels.cache.get(channelId).send({
          embeds    : [embed],
          components: [util.singleButtonLink('View Exam', `https://www.vatusa.net/exam/result/${result_id}`)]
        })
      }
    }
  }
}