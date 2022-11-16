require('dotenv').config();
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js')
	, fs = require('fs')
	, path = require('path')
	, db = require('./db.js')
	, client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Require commands from commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, bot => {
	console.info(`Ready! Logged in as ${bot.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'i fukin died running that', ephemeral: true });
	}
});

db.subscribeReady(() => {
	let Users = db.getUsers();
	Users.countDocuments({}).then((count) => {
		console.info(`${count} users in database`);
	})
})

client.login(process.env.BOT_TOKEN);