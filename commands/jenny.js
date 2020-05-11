module.exports = {
  name       : 'jenny',
  description: 'Google Cloud API for the VATUSA Discord',
  execute (message, args) {
    if (message.author.bot) return

    const PROJECT_ID   = process.env.DF_PROJECTID,
          SESSION_ID   = message.author.id,
          query        = args.join(' '),
          languageCode = 'en'

    const {SessionsClient} = require('@google-cloud/dialogflow'),
          sessionClient    = new SessionsClient()

    async function detectIntent (projectId, sessionId, dialogueQuery, dialogueContexts, language) {
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId),
            request     = {
              session   : sessionPath,
              queryInput: {
                text: {
                  text        : dialogueQuery,
                  languageCode: language
                }
              }
            }

      if (dialogueContexts && dialogueContexts.length > 0) {
        request.queryParams = {contexts: dialogueContexts}
      }

      const responses = await sessionClient.detectIntent(request)
      return responses[0]
    }

    async function executeQueries (projectId, sessionId, dialogueQuery, language) {
      let context, intentResponse
      try {
        console.log(`Sending Query to Jenny: ${query}`)
        intentResponse = await detectIntent(projectId, sessionId, dialogueQuery, context, language)
        console.log('Jenny Responded!')
        console.log(`Jenny's Response: ${intentResponse.queryResult.fulfillmentText}`)

        await message.channel.send(`${message.author}, ${intentResponse.queryResult.fulfillmentText} -Jenny`)

        context = intentResponse.queryResult.outputContexts
      } catch (error) {
        console.log(error)
      }
    }

    console.log(PROJECT_ID, SESSION_ID)

    executeQueries(PROJECT_ID, SESSION_ID, query, languageCode)

  }
}