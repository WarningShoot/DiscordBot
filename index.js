require("dotenv").config();
const Discord = require("discord.js");
const DataStore = require("nedb");
const db = new DataStore({ filename: "./database.db", autoload: true });

const client = new Discord.Client();

client.once("ready", () => {
	console.log("Ready!");
});

client.on("message", (msg) => {
	if (
		msg.content === ".time" &&
		(msg.channel.id === process.env.CHANNEL_KOMENDY ||
			msg.channel.id === process.env.CHANNEL_TEST)
	)
		countTime(msg);
	if (msg.content === ".checkid") console.log(msg.channel.id);
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
	const oldId = oldMember.channelID;
	const newId = newMember.channelID;
	const userId = oldMember.id;

	if (oldId === null) {
		//join
		db.find({ userId }, (err, docs) => {
			if (err) throw err;
			if (docs.length === 0) {
				const temp = {
					userId,
					joined: new Date(),
					time: 0,
					online: true,
				};

				db.insert(temp, (err) => {
					if (err) throw err;
				});
			} else {
				db.update(
					{ userId },
					{ $set: { joined: new Date(), online: true } },
					{},
					(err) => {
						if (err) throw err;
					}
				);
			}
		});
	} else if (newId === null) {
		//leave
		db.find({ userId }, (err, docs) => {
			if (err) throw err;
			if (docs.length === 0) return;

			let time = docs[0].time;
			time += new Date() - new Date(docs[0].joined);
			db.update({ userId }, { $set: { time, online: false } }, {}, (err) => {
				if (err) throw err;
			});
		});
	}
});

const countTime = (msg) => {
	const userId = msg.author.id;
	db.find({ userId }, (err, docs) => {
		if (err) throw err;
		if (docs.length === 0) return;
		let { time, online, joined } = docs[0];

		if (online) {
			time += new Date() - new Date(joined);
		}

		const seconds = Math.floor(time / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		const answer = `Spędziłeś na serwerze ${days} dni, ${hours} godzin, ${minutes} minut, ${seconds} sekund`;
		msg.reply(answer);
	});
};

client.login(process.env.DISCORD_TOKEN);
