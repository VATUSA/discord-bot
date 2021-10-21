exports = module.exports = function (client) {
  const helmet             = require('helmet'),
        express            = require('express'),
        app                = express(),
        expressPort        = process.env.SERVER_PORT,
        mainURL            = process.env.MAIN_URL,
        cors               = require('cors'),
        jwt                = require('express-jwt'),
        corsOptions        = {
          origin              : mainURL,
          optionsSuccessStatus: 200,
          credentials         : true
        },
        membershipRequired = function (req, res, next) {
          //Fetch Guilds and Members
          if (req.params.hasOwnProperty('id') && client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(req.params.id) !== undefined)
            next()
          else
            return res.json({
              status: 'error',
              msg   : 'You are not a member of the VATUSA Official Discord. Join it using the link below the Assign Roles button.'
            })
        }

  app.use(helmet())
    .use(express.json())
    .options('*', cors(corsOptions))
    .use(cors(corsOptions))
    .use(jwt({
      secret    : process.env.BOT_SECRET,
      algorithms: ['HS512'],
      audience  : process.env.MAIN_URL,
      issuer    : process.env.JWT_ISSUER
    }))

  app.post('/assignRoles/:id', membershipRequired, (req, res) => {
    client.commands.get('giveRoles').execute(null, req.params.id, res, client.guilds.cache.get(process.env.GUILD_ID))
  })

  /** *** Notifications *** **/
  app.post('/notifications/:medium/:type', (req, res) => {
    if (['channel', 'dm'].indexOf(req.params.medium) < 0)
      return res.sendStatus(400)
    if (client.notifications.get(req.params.type) !== undefined) {
      console.log(req)
      client.notifications.get(req.params.type).execute(client, req.body.json, req.params.medium)
      return res.sendStatus(200)
    }
    return res.sendStatus(404)
  })

  app.get('/guilds/:id?', (req, res) => {
    let guilds = []
    client.guilds.cache.filter(g => {
      if (req.params.hasOwnProperty('id') && req.params.id !== undefined) {
        const member = g.members.cache.get(req.params.id)
        return member !== undefined && member.permissions.has('ADMINISTRATOR')
      }
      return true
    }).forEach(g => {
      guilds.push({id: g.id, name: g.name})
    })
    return res.json(guilds)
  })
  app.get('/guild/:id/channels', (req, res) => {
    let channels = []
    if (client.guilds.cache.get(req.params.id) === undefined) return res.sendStatus(404)
    client.guilds.cache.get(req.params.id).channels.cache.filter(c => c.type === 'GUILD_TEXT').forEach(c => {
      channels.push({
        id        : c.id,
        name      : c.name,
        parentId  : c.parentId,
        parentName: c.parentId ? c.guild.channels.cache.get(c.parentId).name : null,
        position  : c.rawPosition
      })
    })

    return res.json(channels.sort((a, b) => a.position - b.position))
  })

  app.get('/*', (req, res) => {
    res.send('Hello there. This is the VATUSA Discord Bot Server. If you are here, tell Blake the codeword: sharkbait.')
  })

  app.listen(expressPort, () => {
    console.log(`Express listening on port ${expressPort}`)
  })
}