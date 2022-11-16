const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('is the bot alive lol'),
	async execute(interaction) {
		await interaction.reply('i am alive now shut up');
	},
};