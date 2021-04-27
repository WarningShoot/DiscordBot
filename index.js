require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");

const json = require("./data.json");
const obj = json;

const client = new Discord.Client();

client.once("ready", () => {
	console.log("Ready!");
});

client.on("message", (msg) => {
	if (msg.content === "ping") msg.reply("Pong");
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
	const oldId = oldMember.channelID;
	const newId = newMember.channelID;
	const userId = oldMember.id;
	console.log("---------------------");

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
		fs.writeFile("data.json", newJSON, "utf8", (err) => {
			if (err) return console.log(err);
		});
	}

	console.log(obj);
});

client.login(process.env.DISCORD_TOKEN);
