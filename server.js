exports = module.exports = function (client) {
  const helmet             = require('helmet'),
        express            = require('express'),
        app                = express(),
        expressPort        = process.env.SERVER_PORT,
        mainURL            = process.env.MAIN_URL,
        cors               = require('cors'),
        corsOptions        = {
          origin              : mainURL,
          optionsSuccessStatus: 200,
          credentials         : true
        },
        membershipRequired = function (req, res, next) {
          client.guilds.fetch(process.env.GUILD_ID).then(_ => client.guilds.cache.get(process.env.GUILD_ID).members.fetch().then(_ => {
            if (req.params.hasOwnProperty('id') && client.guilds.cache.get(process.env.GUILD_ID).members.cache.get(req.params.id))
              next()
            else
              return res.json({
                status: 'error',
                msg   : 'You are not a member of the VATUSA Official Discord. Join it using the link below the Assign Roles button.'
              })
          }))
        }

  app.use(helmet())
    .use(express.json())
    .options('*', cors(corsOptions))
    .use(cors(corsOptions))

  app.post('/assignRoles/:id', membershipRequired, (req, res) => {
    client.commands.get('giveRoles').execute(null, req.params.id, res, client.guilds.cache.get(process.env.GUILD_ID))
  })

  /** *** Notifications *** **/
  app.post('/notifications/legacyExamAssigned', (req, res) => {
    client.notifications.get('legacyExamAssigned').execute(client, req.body)
    res.sendStatus(200)
  })

  app.get('/*', (req, res) => {
    res.send('Hello there. This is the VATUSA Discord Bot Server. If you are here, tell Blake the codeword: sharkbait.')
  })

  app.listen(expressPort, () => {
    console.log(`Express listening on port ${expressPort}`)
  })
}