const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { NodeHtmlMarkdown } = require('node-html-markdown');
const db = require('../db.js');

const nhm = new NodeHtmlMarkdown();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('innervukky')
		.setDescription('Discover your inner Vukky! (2020 Vukkybot reboot)')
		.addUserOption(option => option.setName('user').setDescription('The user to get the inner Vukky of').setRequired(false)),
	async execute(interaction) {
		const target = interaction.options.getUser('user') || interaction.user;
		const innerVukky = await db.getInnerVukky(target.id);
		if (!innerVukky) return await interaction.reply('Something went wrong, too bad C:');
		const vukkyEmbed = new EmbedBuilder()
			.setColor(0x00A8F3)
			.setTitle(`Inner Vukky of ${target.username}`)
			.setDescription("Here's your inner Vukky!")
			.setImage(innerVukky.url)
			.addFields([{ name: "Name", value: nhm.translate(innerVukky.name)}])
			.addFields([{ name: "Description", value: `${innerVukky.description ? nhm.translate(innerVukky.description) : "None :("}`}])
			.addFields([{ name: "Creator", value: `${innerVukky.creator ? innerVukky.creator : "Unknown"}`}])
			.setFooter({ text: 'Discover your inner Vukky with /innervukky', iconURL: 'https://vukkybox.com/resources/vukkyshaman.webp' });
		await interaction.reply({ embeds: [vukkyEmbed], allowedMentions: {parse: []} });
		if (innerVukky.audio) await interaction.followUp(`Looks like there is a bit of audio related to this one! ${innerVukky.audio}`);
	},
};