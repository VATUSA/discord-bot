const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
<<<<<<< HEAD
    data: new SlashCommandBuilder()
        .setname('faq')
        .setDescription('Gives members of VATUSA a link to our FAQ page!'),
=======
data: new SlashCommandBuilder()
    .setName('faq')
    .setDescription('Gives members of VATUSA a link to our FAQ page!'),
>>>>>>> 6a288c752937d96115995fcc00424ec95d5b3bbc
    async execute(interaction) {
        await interaction.reply({content: "Have you checked the VATUSA FAQ for the answer to your question? https://www.vatusa.net/help/kb"});
    },
};