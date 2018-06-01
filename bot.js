const botsetting = require("./botsetting.json");
const Discord = require('discord.js');
const client = new Discord.Client();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

client.on('message', msg => {
  let msgarray = msg.content.split(" ");
  let command = msgarray[0];
  let args = msgarray.slice(1)

  if (msg.author.bot) return;

  if (msg.content === 'ping') {
    msg.channel.sendMessage("Hi, Wanna play Who is Undercover?");
  }
  if (command === "!mute") {
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
    let tomute = msg.guild.members.get(msg.mentions.users.first().id) || msg.guild.members.get(args[0]);
    if (!tomute) return msg.reply("Please specify a user");
    msg.channel.overwritePermissions(tomute, {
      SEND_MESSAGES: false,
    })
    return msg.reply(`${tomute.user.username} is muted`);
  }

  if (command === "!unmute") {
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
    let tomute = msg.guild.members.get(msg.mentions.users.first().id) || msg.guild.members.get(args[0]);
    if (!tomute) return msg.reply("Please specify a user");
    msg.channel.overwritePermissions(tomute, {
      SEND_MESSAGES: null,
    })
    return msg.reply(`${tomute.user.username} is unmuted`);
  }

if (command === "!cover") {
  if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
  let tomute = msg.guild.members.get(msg.mentions.users.first().id) || msg.guild.members.get(args[0]);
  if (!tomute) return msg.reply("Please specify a user");
  msg.channel.overwritePermissions(tomute, {
    READ_MESSAGES: false,
  })
  return msg.reply(`${tomute.user.username} is covered`);
}

  if (command === "!uncover") {
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) return msg.reply("You don't have permissions");
    let tomute = msg.guild.members.get(msg.mentions.users.first().id) || msg.guild.members.get(args[0]);
    if (!tomute) return msg.reply("Please specify a user");
    msg.channel.overwritePermissions(tomute, {
      READ_MESSAGES: null,
    })
    return msg.reply(`${tomute.user.username} is uncovered`);
  }
  return
});
client.login(process.env.BOT_TOKEN);
