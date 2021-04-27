require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");
const { join } = require("path");

const obj = require("./data.json");

const client = new Discord.Client();

client.once("ready", () => {
	console.log("Ready!");
});

client.on("message", (msg) => {
	if (msg.content === ".time" && msg.channel.id === "642713531992506369")
		countTime(msg);
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
	const oldId = oldMember.channelID;
	const newId = newMember.channelID;
	const userId = oldMember.id;

	if (oldId === null) {
		//join
		if (!obj.hasOwnProperty(userId)) {
			obj[userId] = [];
		}
		obj[userId].unshift({ joined: new Date(), leave: "" });
	} else if (newId === null) {
		//leave
		obj[userId][0].leave = new Date();
		const newJSON = JSON.stringify(obj);
		fs.writeFile("./data.json", newJSON, "utf8", (err) => {
			if (err) return console.log(err);
		});
	}
});

const countTime = (msg) => {
	const userId = msg.author.id;
	let time = 0;
	if (!obj.hasOwnProperty(userId)) return;

	for (let i = 0; i < obj[userId].length; i++) {
		const joined = obj[userId][i].joined;
		const leave = obj[userId][i].leave;

		if (!leave) {
			time += new Date() - new Date(joined);
		} else {
			time += new Date(leave) - new Date(joined);
		}
	}
	const seconds = Math.floor(time / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	const answer = `Spędziłeś na serwerze ${days} dni, ${hours} godzin, ${minutes} minut, ${seconds} sekund`;
	msg.reply(answer);
};

client.login(process.env.DISCORD_TOKEN);
