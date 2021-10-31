module.exports = {
  name       : 'academyExamResult',
  description: 'Academy rating exam submitted.',
  execute    : async (client, data, medium) => {
    const examName                  = data.testName,
          studentName               = data.studentName,
          attemptNum                = data.attemptNum,
          grade                     = data.grade,
          passed                    = data.passed,
          attemptId                 = data.attemptId,
          studentId                 = data.studentId,
          instructorId              = data.instructorId,
          instructorName            = data.instructorName,
          passingGrade              = data.passingGrade,
          guildId                   = data.guildId,
          channelId                 = data.channelId,
          {italic, bold, hyperlink} = require('@discordjs/builders'),
          util                      = require('../../util')

    //Fetch Users
    if (studentId) {
      await client.users.fetch(studentId)
    }
    if (instructorId) {
      await client.users.fetch(instructorId)
    }

    const color        = passed ? '#00ff00' : '#ff0000',
          title        = passed ? 'Academy Exam Passed' : 'Academy Exam Failed',
          staffContent = `${bold(studentName)} has ${passed ? 'passed' : 'failed'} their academy exam.`
    if (medium === 'dm') {
      let studentContent = passed ? `Congratulations! You have passed your ${italic(examName)} exam.` : `Unfortunately, you have failed your ${italic(examName)} exam.`

      if (!passed) {
        if (attemptNum < 3) studentContent += `\n\nYou must retake the exam. The passing grade is ${passingGrade}%.
         You have ${3 - attemptNum} attempt${3 - attemptNum === 2 ? 's' : ''} remaining before training staff intervention is required.`
        else studentContent += `\n\nYou have used all three attempts. To retake the exam, you must open a support ticket on 
        ${hyperlink('Discord', 'https://discord.com/channels/699659614928502815/744285186254045285')} 
        or the ${hyperlink('VATUSA Website', 'https://www.vatusa.devel/help/ticket/new')}.`
      } else studentContent += `\n\nYou will not receive a promotion to the new rating until you have passed an OTS 
      (Over-the-shoulder practical exam) conducted by your ARTCC's training staff.`
      if (studentId && client.users.cache.get(studentId) !== undefined)
        return client.users.cache.get(studentId).send({
          embeds    : [util.embed(studentContent)
            .setColor(color)
            .setTitle(title)
            .setFields({title: 'Score', value: `${grade}%`, inline: true},
              {title: 'Attempt', value: attemptNum, inline: true})],
          components: [util.singleButtonLink('View Attempt', `https://academy.vatusa.net/mod/quiz/review.php?attempt=${attemptId}`)]
        })
      if (instructorId && client.users.cache.get(instructorId) !== undefined) {
        return client.users.cache.get(instructorId).send({
          embeds    : [util.embed(staffContent)
            .setColor(color)
            .setTitle(title)
            .addFields(
              {name: 'Exam', value: examName, inline: true},
              {name: 'Score', value: `${grade}%`, inline: true},
              {name: 'Attempt', value: attemptNum, inline: true},
              {name: 'Instructor', value: instructorName})
          ],
          components: [util.singleButtonLink('View Attempt', `https://academy.vatusa.net/mod/quiz/review.php?attempt=${attemptId}`)]
        })
      }
    } else if (medium === 'channel') {
      if (guildId && channelId && client.guild.cache.get(guildId) !== undefined
        && client.guild.cache.get(guildId).channels.cache.get(channelId) !== undefined) {
        return client.guild.cache.get(guildId).channels.cache.get(channelId).send({
          embeds    : [util.embed(staffContent)
            .setColor(color)
            .setTitle(title)
            .addFields(
              {name: 'Exam', value: examName, inline: true},
              {name: 'Score', value: `${grade}%`, inline: true},
              {name: 'Attempt', value: attemptNum, inline: true},
              {name: 'Instructor', value: instructorName})
          ],
          components: [util.singleButtonLink('View Attempt', `https://academy.vatusa.net/mod/quiz/review.php?attempt=${attemptId}`)]
        })
      }
    }
  }
}