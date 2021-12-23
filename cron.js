exports = module.exports = {
  init (client) {
    const cron = require('node-cron'),
          util = require('./util')

    cron.schedule('0 */6 * * *', this.syncPilotsOnly(client))
    cron.schedule('0 */12 * * *', this.syncAllRoles(client))
    cron.schedule('0 0 * * *', this.rotateLogs())

    util.log('task', 'Cron initialized')
  },

  async syncAllRoles (client) {
    const util          = require('./util'),
          {performance} = require('perf_hooks'),
          http          = util.http()
    const start = performance.now()
    util.log('task', '(syncAllRoles) Task started')
    await util.fetch(client, process.env.GUILD_ID, async () => {
      const guild     = client.guilds.cache.get(process.env.GUILD_ID),
            pilotRole = guild.roles.cache.find(role => role.name === 'Pilots')
      await http.get('user/getAllDiscord').then(async r => {
        util.log('task', `(syncAllRoles) Syncing ${r.data.length} users`)
        let count = 0
        for (const id of r.data) {
          if (!id) continue
          const member = guild.members.cache.get(id)
          if (member !== undefined) {
            if (member.roles.cache.size === 2 && member.roles.cache.has(pilotRole.id))
              continue
            await client.commands.get('giveRoles').execute(null, id, null, client.guilds.cache.get(process.env.GUILD_ID))
            count++
          }
        }
        util.log('task', `(syncAllRoles) Synced ${count} users`)
      }).catch(e => {
        util.log('task', `(syncAllRoles) Error while fetching users`)
        util.log('error', `(TASK syncAllRoles) Error while fetching users`)
        util.log('error', e)
      })

      const end = performance.now()
      util.log('task', '(syncAllRoles) Task finished in ' + (end - start).toFixed(2) / 1000 + 's')
    })
  },
  async syncPilotsOnly (client) {
    const util          = require('./util'),
          http          = util.http(),
          {performance} = require('perf_hooks')

    const start = performance.now()
    util.log('task', '(syncPilotsOnly) Task started')

    await util.fetch(client, process.env.GUILD_ID, async () => {
      const givePilotsRoleChannel = client.guilds.cache.get(process.env.GUILD_ID).channels.cache.find(c => c.name === 'give-pilots-role')
      let reactionMessage
      await givePilotsRoleChannel.messages.fetch().then(m => reactionMessage = m.find(m => m.author.id === m.guild.ownerId))
      reactionMessage.reactions.cache.forEach(r => {
        r.users.fetch().then(u => {
          u.forEach(user => {
            const member    = reactionMessage.guild.members.cache.get(user.id),
                  pilotRole = reactionMessage.guild.roles.cache.find(role => role.name === 'Pilots')
            if(member === undefined) return
            if (member.roles.cache.size === 2 && member.roles.cache.has(pilotRole.id)) return
            http.get('user/' + user.id + '?d').then(result => {
              const {status, data} = result
              if (status !== 200 && status !== 404) {
                util.log('task', `(syncPilotsOnly) Error while fetching user ${user.id}`)
                util.log('error', `(TASK syncPilotsOnly) Error while fetching user ${user.id}`)
                util.log('error', data)
              } else {
                member.roles.cache.forEach(role => {
                  if (role.id !== pilotRole.id && role.id !== member.guild.roles.everyone.id) {
                    member.roles.remove(role)
                  }
                })
                member.roles.add(pilotRole)
                member.setNickname(data.data.fname + ' ' + data.data.lname)
              }
            }).catch(err => {
              if (err.response.status === 404) return

              util.log('task', `(syncPilotsOnly) Error while fetching user`)
              util.log('error', `(TASK syncPilotsOnly) Error while fetching user`)
              util.log('error', err)
            })
          })
        })
      })
      const end = performance.now()
      util.log('task', '(syncPilotsOnly) Task finished in ' + (end - start).toFixed(2) / 1000 + 's')
    })
  },

  async rotateLogs () {
    const util          = require('./util'),
          fr            = require('find-remove'),
          {performance} = require('perf_hooks'),
          start         = performance.now()

    util.log('task', '(rotateLogs) Task started')
    fr('./logs', {age: {seconds: 60 * 60 * 24 * 7}, extensions: ['.log']})
    setTimeout(() => util.log('task', '(rotateLogs) Task finished in ' + (performance.now() - start).toFixed(2) / 1000 + 's', 1000))
  },

}