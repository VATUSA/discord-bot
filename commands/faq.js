const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
data: new SlashCommandBuilder()
    .setname('faq')
    .setDescription('Gives members of VATUSA a link to our FAQ page!'),
    async execute(interaction) {
        await interaction.reply({content: "Have you checked the VATUSA FAQ for the answer to your question? https://www.vatusa.net/help/kb"});
    },
};