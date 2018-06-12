const botsetting = require("./botsetting.json");
const words = require("./wordspackage.json");
const Discord = require('discord.js');
const client = new Discord.Client();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fs = require("fs");
client.currentgame = require("./currentgame.json");

console.log(new Date().toLocaleTimeString());
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  try{
    let link = await client.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
  } catch(a){
    console.log(a.stack)
  }
});

client.on('message',async (msg) => {
  let msgarray = msg.content.split(" ");
  let command = msgarray[0];
  let args = msgarray.slice(1)

  if (msg.author.bot) return;
  if (msg.channel.type === "dm"){
    msg.channel.send("Developing DM!");
    return;
  }
  if (msg.channel.type !== "dm"){
    if (msg.content === 'game') {
      msg.channel.send('Send [Create Room] to Create a game');
    }

    if (msg.content.toLowerCase() === "create game" || msg.content.toLowerCase() === "creategame"){
      client.currentgame[msg.guild.id] = {
        player: msg.author.id,
        playername: msg.author.username,
        place: "2",
      }
      fs.writeFile("./currentgame.json", JSON.stringify(client.currentgame,null,4)), err => {
        if(err) throw err;
      }
      let embed = new Discord.RichEmbed()
        .setTitle("--Players in the game--")
        .setDescription("Send [Join] to join the game\n--------------------------------")
        .addField("Player 1", msg.author.username)
        .setColor([0,120,255])
      msg.channel.send(embed)
    }

    if (msg.content.toLowerCase() === "show room" || msg.content.toLowerCase() === "showroom"){
      let playerinfos = client.currentgame[msg.guild.id].player;
      msg.channel.send(playerinfos);
    }
    if (msg.content.toLowerCase().search("cennie") >= 0) {
      msg.author.send("Stop saying Cennie!");
    }
  
    if (command === "!mute") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
      let mentionuser =msg.mentions.users.first();
      if (!mentionuser) return msg.reply("Please specify a user");
      let tomute = msg.guild.members.get(mentionuser.id) || msg.guild.members.get(args[0]);
      if (!tomute) return msg.reply("Please specify a user");
      msg.channel.overwritePermissions(tomute, {
        SEND_MESSAGES: false,
      })
      return msg.reply(`${tomute.user.username} is muted`);
    }
  
    if (command === "!unmute") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
      let mentionuser =msg.mentions.users.first();
      if (!mentionuser) return msg.reply("Please specify a user");
      let tomute = msg.guild.members.get(mentionuser.id) || msg.guild.members.get(args[0]);
      if (!tomute) return msg.reply("Please specify a user");
      msg.channel.overwritePermissions(tomute, {
        SEND_MESSAGES: null,
      })
      return msg.reply(`${tomute.user.username} is unmuted`);
    }
  
  if (command === "!cover") {
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
    let mentionuser =msg.mentions.users.first();
    if (!mentionuser) return msg.reply("Please specify a user");
    let tomute = msg.guild.members.get(mentionuser.id) || msg.guild.members.get(args[0]);
    if (!tomute) return msg.reply("Please specify a user");
    msg.channel.overwritePermissions(tomute, {
      READ_MESSAGES: false,
    })
    return msg.reply(`${tomute.user.username} is covered`);
  }
  
    if (command === "!uncover") {
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
      let mentionuser =msg.mentions.users.first();
      if (!mentionuser) return msg.reply("Please specify a user (Works On PC)");
      let tomute = msg.guild.members.get(mentionuser.id) || msg.guild.members.get(args[0]);
      if (!tomute) return msg.reply("Please specify a user (Works On PC)");
      msg.channel.overwritePermissions(tomute, {
        READ_MESSAGES: null,
      })
      return msg.reply(`${tomute.user.username} is uncovered`);
    }
    return;
  } 
 
});
client.login(process.env.BOT_TOKEN);
