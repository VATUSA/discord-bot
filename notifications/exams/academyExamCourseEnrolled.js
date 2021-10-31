module.exports = {
  name       : 'academyExamCourseEnrolled',
  description: 'Academy exam course enrolled.',
  execute    : async (client, data, medium) => {
    const studentName       = `${data.student.fname} ${data.student.lname}`,
          instructorName    = `${data.instructor.fname} ${data.instructor.lname}`,
          courseName        = data.course_name,
          rating            = data.rating.short,
          courseId          = data.course_id,
          studentId         = data.student_id,
          staffId           = data.staffId,
          guildId           = data.guildId,
          channelId         = data.channelId,
          {bold, hyperlink} = require('@discordjs/builders'),
          util              = require('../../util')

    //Fetch Users
    if (studentId) {
      await client.users.fetch(studentId)
    }
    if (staffId) {
      await client.users.fetch(staffId)
    }

    if (medium === 'dm') {
      let studentContent = `You have been enrolled in the ${bold(courseName)} (${rating}) at the VATUSA Academy by instructor ${instructorName}. 
      This course will teach you the fundamentals of your new, prospective rating and will culminate in an end-of-course exam.
      \n\nYou must complete the course and exam within 30 days. If you do not meet this requirement, you will have to be re-enrolled by your instructor. 
      Additionally, you have three attempts to pass the final exam. If this is not met, you must ${hyperlink('open a support ticket', 'https://www.vatusa.net/help/ticket/new')}.`
      if (studentId && client.users.cache.get(studentId) !== undefined)
        return client.users.cache.get(studentId).send({
          embeds    : [util.embed(studentContent)
            .setColor('#c00adc')
            .setTitle('Academy Course Enrolled')],
          components: [util.singleButtonLink('Go to Academy', `https://academy.vatusa.net/course/view.php?id=${courseId}`)]
        })

      const staffContent = `An instructor has enrolled a student in an Academy rating course.`
      if (staffId && client.users.cache.get(staffId) !== undefined) {
        return client.users.cache.get(staffId).send({
          embeds: [util.embed(staffContent)
            .setColor('#c00adc')
            .setTitle('Academy Course Enrolled')
            .addFields(
              {name: 'Student', value: studentName},
              {name: 'Course', value: courseName + `(${rating})`},
              {name: 'Instructor', value: instructorName})
          ]
        })
      }
    } else if (medium === 'channel') {
      const staffContent = `An instructor has enrolled a student in an Academy rating course.`
      if (guildId && channelId && client.guilds.cache.get(guildId) !== undefined && client.guilds.cache.get(guildId).channels.cache.get(channelId) !== undefined) {
        return client.guilds.cache.get(guildId).channels.cache.get(channelId).send({
          embeds: [util.embed(staffContent)
            .setColor('#c00adc')
            .setTitle('Academy Course Enrolled')
            .addFields(
              {name: 'Student', value: studentName},
              {name: 'Course', value: courseName + `(${rating})`},
              {name: 'Instructor', value: instructorName})
          ]
        })
      }
    }
  }
}