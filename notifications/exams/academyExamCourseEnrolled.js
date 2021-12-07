module.exports = {
  name       : 'academyExamCourseEnrolled',
  description: 'Academy exam course enrolled.',
  execute    : async (client, data, medium) => {
    const studentName       = `${data.student.fname} ${data.student.lname}`,
          instructorName    = `${data.instructor.fname} ${data.instructor.lname}`,
          courseName        = data.course_name,
          rating            = data.rating.short,
          courseId          = data.course_id,
          studentId         = data.studentId,
          staffId           = data.staffId,
          guildId           = data.guildId,
          channelId         = data.channelId,
          {bold, hyperlink} = require('@discordjs/builders'),
          util              = require('../../util')

    //Fetch Users
    const student      = await util.fetchUser(client, studentId),
          staff        = await util.fetchUser(client, staffId),
          staffContent = `An instructor has enrolled a student in an Academy rating course.`,
          staffEmbed   = util.embed(staffContent)
            .setColor('#c00adc')
            .setTitle('Academy Course Enrolled')
            .addFields(
              {name: 'Student', value: studentName, inline: true},
              {name: 'Course', value: courseName + `(${rating})`, inline: true},
              {name: 'Instructor', value: instructorName})

    if (medium === 'dm') {
      let studentContent = `You have been enrolled in the ${bold(courseName)} (${rating}) at the VATUSA Academy by instructor ${instructorName}. This course will teach you the fundamentals of your new, prospective rating and will culminate in an end-of-course exam.
      \nYou must complete the course and exam within 30 days. If you do not meet this requirement, you will have to be re-enrolled by your instructor. 
      Additionally, you have three attempts to pass the final exam. If this is not met, you must ${hyperlink('open a support ticket', 'https://www.vatusa.net/help/ticket/new')}.`
      if (student !== undefined)
        student.send({
          embeds    : [util.embed(studentContent)
            .setColor('#c00adc')
            .setTitle('Academy Course Enrolled')],
          components: [util.singleButtonLink('Go to Academy', `https://academy.vatusa.net/course/view.php?id=${courseId}`)]
        })

      if (staff !== undefined) {
        staff.send({
          embeds: [staffEmbed]
        })
      }
    } else if (medium === 'channel') {
      const staffContent = `An instructor has enrolled a student in an Academy rating course.`,
            channel      = util.fetchChannelCache(client, guildId, channelId)
      if (channel) {
        channel.send({
          embeds: [staffEmbed]
        })
      }
    }
  }
}