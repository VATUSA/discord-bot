const {SlashCommandBuilder} = require('@discordjs/builders')
const {MessageEmbed} = require('discord.js')

module.exports = {
    name: 'giveroles',
    description: 'Assign Roles from Linked Account',
    data: new SlashCommandBuilder()
        .setName('giveroles')
        .setDescription('Assign roles for channel access. Your Discord account must be linked on the VATUSA website.'),
    execute(interaction, id, res, g) {
        //Initialize Vars
        const {MessageEmbed} = require('discord.js'),
            axios = require('axios'),
            https = require('https'),
            guild = g ? g : interaction.guild

        let req = axios
        //Check for dev API
        if (process.env.API_URL.indexOf('dev') > -1) {
            req = axios.create({
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            })
        }

        //Make the API Call to determine user information
        req.get(process.env.API_URL + 'user/' + (interaction ? interaction.member.id : id) + '?d')
            .then(result => {
                    //console.log(result)
                    const {status, data} = result
                    if (status !== 200) {
                        sendError(interaction, MessageEmbed, 'Unable to communicate with API.', res)
                    } else {
                        const user = data.data

                        //Instantiate Variables
                        const member = interaction ? interaction.member : guild.members.cache.get(id),
                            ratings = {
                                AFK: 'Inactive',
                                SUS: 'Suspended',
                                OBS: 'Observer',
                                S1: 'Student 1',
                                S2: 'Student 2',
                                S3: 'Student 3',
                                C1: 'Controller 1',
                                C3: 'Controller 3',
                                I1: 'Instructor 1',
                                I3: 'Instructor 3',
                                SUP: 'Supervisor',
                                ADM: 'Administrator',
                            }
                        let roles = ['Verified'],
                            facStaff = [],
                            newNick = member.nickname,
                            nickChange = false

                        if (member.permissions.has('ADMINISTRATOR')) {
                            const ownerName = guild.members.cache.get(guild.ownerId).nickname
                            return sendError(interaction, MessageEmbed, `Since you have an administrator role, you must contact the Server Owner (${ownerName}) to receive your roles.`, res, false, 'Administrator Roles')
                        }

                        if (user.flag_homecontroller) roles.push('VATUSA Member')
                        else if (user.visiting_facilities.length > 0) roles.push('VATUSA Visitor')

                        //Determine Roles
                        for (let i = 0; i < user.roles.length; i++) {
                            //Roles Table
                            const role = user.roles[i]
                            if (role.role.match(/US\d+/)) {
                                const ownerName = guild.members.cache.get(guild.ownerId).nickname
                                return sendError(interaction, MessageEmbed, `Since you have an administrator role, you must contact the Server Owner (${ownerName}) to receive your roles.`, res, false, 'Administrator Roles')
                            }
                            if (role.role === 'ACE') {
                                roles.push('ACE Team');
                            }
                            if (role.role === 'ATM') {
                                facStaff.push('ATM');
                                roles.push('ATM/DATM');
                            }
                            if (role.role === 'DATM') {
                                facStaff.push('DATM');
                                roles.push('ATM/DATM');
                            }
                            if (role.role === 'TA') {
                                facStaff.push('TA');
                                roles.push('TA');
                            }
                            if (role.role === 'EC') {
                                facStaff.push('EC');
                                roles.push('EC');
                            }
                            if (role.role === 'FE') {
                                facStaff.push('FE');
                                roles.push('FE');
                            }
                            if (role.role === 'WM') {
                                facStaff.push('WM');
                                roles.push('WM');
                            }
                            if (role.role === 'MTR') {
                                roles.push('Mentor');
                            }
                            if (role.role === 'SMT') {
                                roles.push('Social Media Team');
                            }
                            if (role.role === 'USWT') {
                                roles.push('VATUSA Developer');
                            }
                            if (role.role === 'DICE') {
                                roles.push('DICE Team');
                            }
                            if (role.role === 'DMT') {
                                roles.push('Discord Moderation Team');
                            }
                            if (role.role === 'DCC') {
                                roles.push('DCC Staff');
                            }
                        }


                        //Determine Rating
                        roles.push(ratings[user.rating_short]);

                        // Better Determine Nickname
                        displayName = `${user.fname} ${user.lname}`;
                        if (displayName.length > 20) {
                            // Remove split first name
                            displayName = `${user.fname.split(' ')[0]} ${user.lname}`;
                        }
                        if (displayName.length > 20) {
                            // Remove split first name and use Last Initial
                            displayName = `${user.fname.split(' ')[0]}  ${user.lname.charAt(0)}`;
                        }

                        if (member.roles.cache.find(r => r.name === 'VATGOV')) {
                            newNick = `${displayName} | VATGOV`
                        } else if (user.rating < 1) {
                            roles = [];
                            newNick = `${displayName}`;
                        } else if (user.facility === 'ZAE') {
                            newNick = `${displayName} | ZAE`;
                        } else if (user.facility === 'ZZN') {
                            newNick = `${displayName} | ${user.rating_short}`;
                        } else if (facStaff.length > 0) {
                            let staffTitle;
                            if (facStaff.includes('ATM')) {
                                staffTitle = `${user.facility} ATM`;
                            } else if (facStaff.includes('DATM')) {
                                staffTitle = `${user.facility} DATM`;
                            } else {
                                titles = [];
                                if (facStaff.includes('TA')) {
                                    titles.push('TA');
                                }
                                if (facStaff.includes('EC')) {
                                    titles.push('EC');
                                }
                                if (facStaff.includes('FE')) {
                                    titles.push('FE');
                                }
                                if (facStaff.includes('WM')) {
                                    titles.push('WM');
                                }
                                staffTitle = `${user.facility} ${titles.join('/')}`;
                            }
                            newNick = `${displayName} | ${staffTitle}`;
                        } else {
                            newNick = `${displayName} | ${user.facility} ${user.rating_short}`;
                        }

                        let rolesChanged = false,
                            nameChanged = false;

                        //Assign Nickname
                        if (newNick !== member.nickname) {
                            nickChange = true;
                            member.setNickname(newNick, 'Roles Synchronization').catch(e => console.error(e));
                            nameChanged = true;
                        }
                        //Assign Roles
                        let roleStr = '',
                            excluded = ['Pilots', 'Server Booster', 'VATGOV', 'Muted']
                        member.roles.cache.forEach(role => {
                            if (role.id !== guild.roles.everyone.id
                                && excluded.indexOf(role.name) < 0
                                && roles.indexOf(role.name) < 0) {
                                member.roles.remove(role).catch(e => console.error(e));
                                rolesChanged = true;
                            }
                        })
                        for (let i = 0; i < roles.length; i++) {
                            const role = guild.roles.cache.find(role => role.name === roles[i])
                            if (!member.roles.cache.find(r => r.name === role.name)) {
                                rolesChanged = true;
                            }
                            member.roles.add(role).catch(e => console.error(e))
                            roleStr += `${role} `
                        }

                        // Send to #robot-log
                        if (rolesChanged || nameChanged) {
                            const log_embed = new MessageEmbed()
                                .setTitle(newNick)
                                .setColor(0x5cb85c)
                                .setDescription(`${member} ${roleStr}`);
                            const log_channel = guild.client.channels.cache.get('1096959022655094854');
                            log_channel.send({embeds: [log_embed]});
                        }

                        if (res)
                            return res.json({
                                status: 'OK',
                                msg: `Your roles have been assigned, ${newNick}!<br><em>${roles.join(', ')}</em>`
                            })

                        const embed = new MessageEmbed()
                            // Set the title of the field
                            .setTitle('Your roles have been assigned.')
                            // Set the color of the embed
                            .setColor(0x5cb85c)
                            // Set the main content of the embed
                            .setDescription(roleStr)
                        embed.setFooter(nickChange ? `Your new nickname is: ${newNick}` : newNick);

                        // Send the embed to the same channel as the message
                        interaction.reply({embeds: [embed], ephemeral: true});
                    }
                }
            )
            .catch(error => {
                console.error(error)
                if (error.response.status === 404) {
                    sendError(interaction, MessageEmbed, 'Your Discord account is not linked on VATUSA or you are not in the VATUSA database. Link it here: https://vatusa.net/my/profile', res, false, 'Not Linked')
                } else sendError(interaction, MessageEmbed, error.data !== undefined ? error.data.toJSON() : 'Unable to communicate with API.', res)
            })
    }
}

function sendError(interaction, me, msg, res, footer = true, header = false) {
    if (res)
        return res.json({
            status: 'error',
            msg: msg
        })
    const embed = new me()
        // Set the title of the field
        .setTitle(header ? header : 'Error!')
        // Set the color of the embed
        .setColor(0xFF0000)
        // Set the main content of the embed
        .setDescription(msg)

    if (footer) embed.setFooter('Please try again later')
    // Send the embed to the same channel as the message
    interaction.reply({embeds: [embed], ephemeral: true})
}
