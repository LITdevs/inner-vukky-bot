require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect(process.env.MONGODB_HOST);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

let User;
const userSchema = new mongoose.Schema({
	id: String, // Discord ID
	innerVukky: Object, // Inner Vukky Object
	admin: Boolean // Whether the user is BURNING KEYBOARD USER
});

db.once('open', () => {
	console.log("Database up");
	User = mongoose.model('User', userSchema);
})

function getUsers() {
	return User;
}

function subscribeReady(callback) {
	db.once('open', callback);
}

/**
 * Returns the inner Vukky for the given user ID.
 *
 * @param id Discord ID
 * @returns {Promise<string>} inner Vukky object
 */
async function getInnerVukky(id) {
	return new Promise((resolve) => {
		User.findOne({ id: id }, async (err, user) => {
			if (err) {
				console.error(err);
				return resolve();
			}
			// If the user has one already, return it
			if (user && user.innerVukky) return resolve(user.innerVukky);

			// If user exists but doesn't have an inner Vukky, nuke the user and generate a new one
			if (user) await User.deleteOne({ id: id });

			// User doesn't have an inner Vukky yet
			let usr = new User({
				id: id,
				innerVukky: await generateInnerVukky(id),
				admin: false
			});
			usr.save((err) => {
				if (err) {
					console.error(err);
					return resolve();
				}
				return resolve(usr.innerVukky);
			})
		});
	})
}

/**
 * Generates an inner Vukky URL for the given user ID.
 *
 * @param id
 * @returns {Promise<string>}
 */
async function generateInnerVukky(id) {
	return new Promise((resolve) => {
		axios.get("https://vukkybox.com/resources/vukkies.json").then((response) => {
			let vukkies = response.data.rarity;
			let allVukkies = [];

			let rarities = Object.keys(vukkies); // 1-7, pukky
			rarities.splice(rarities.indexOf("pukky"), 1); // Remove pukkies
			rarities.forEach((rarity) => {
				Object.keys(vukkies[rarity]).forEach((vukkyId) => {
					allVukkies.push(vukkies[rarity][vukkyId]);
				})
			})

			let vukky = allVukkies[Math.floor(Math.random() * allVukkies.length)];
			return resolve(vukky);
		})
	})
}

module.exports = {
	getUsers,
	subscribeReady,
	getInnerVukky
}