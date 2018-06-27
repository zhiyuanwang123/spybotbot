const botsetting = require("./botsetting.json");
const words = require("./wordspackage.json");
const Discord = require('discord.js');
const client = new Discord.Client();
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fs = require("fs");
const configgame = require("./gameconfig");
const request = require("request");
const rule = fs.readFileSync("./rule.txt").toString();
var info;


console.log(new Date().toLocaleTimeString());
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  try{
    let link = await client.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
  } catch(a){
    console.log(a.stack)
  }
  return;
});

client.on("guildMemberAdd",async function (user){
  let guild = user.guild;
  let role;
  role = await guild.roles.find(r => r.name === "None-Players");
  if (!role){
    role = await guild.createRole({
      name: "None-Players",
      color: "#000000",
      permissions: ['SEND_MESSAGES']
    });
  }
  await user.addRole(role);
  console.log("New Member Added!");
  return;
});

client.on('message', async (msg) => {
  let msgarray = msg.content.split(" ");
  let command = msgarray[0];
  let args = msgarray.slice(1)

  if (msg.author.bot) return;
  if (msg.channel.type === "dm"){
    msg.channel.send("Developing DM!");
    return;
  }
  if (msg.channel.type !== "dm"){
    if (msg.content.toLowerCase() === 'game') {
      await msg.channel.send('Send [Create Game] to Create a game');
      await msg.delete(1);
    }

    if (msg.content.toLowerCase() === "rule" || msg.content.toLowerCase() === "gamerule"|| msg.content.toLowerCase() === "game rule"){
      msg.reply("\n"+rule);
    }

    if (msg.content.toLowerCase() === "create game" || msg.content.toLowerCase() === "creategame"){
      if (configgame[msg.guild.id] == null || configgame[msg.guild.id].created != true){
        let order = 1;
        let datahead = `player${order}`;
        let table = {
          [datahead]: {
            player: msg.author.id,
            playername: msg.author.username,
            role: "owner"
          }
        }
        await fs.writeFile(`./${msg.guild.id}.json`,  JSON.stringify(table,null,4), function (err) {
          if(err){
              throw err;
          }
        });
        configgame[msg.guild.id] = {
            playernumber: 1,
            gamestarted: false,
            created: true
        }
        await fs.writeFile("./gameconfig.json",  JSON.stringify(configgame,null,4), function (err) {
          if(err){
              throw err;
          }
        });
        let embed = new Discord.RichEmbed()
          .setTitle("--Players in the game--")
          .setDescription(`Player Counts: ⇨1⇦` + "\n" +"Send [Join] to join the game\n--------------------------------")
          .addField(`Player1 (owner)`, msg.author.username)
          .setColor([0,120,255])
        msg.channel.send(embed);
      }else{
        msg.reply("There is already a game in this channel that is exist.\nSend [Join] to join the game!")
      }
      msg.delete(1);
    }
     

    if (msg.content.toLowerCase() === "show list" || msg.content.toLowerCase() === "showlist"){ 
      if (configgame[msg.guild.id] != null){
        if(configgame[msg.guild.id].created == true && fs.existsSync(`./${msg.guild.id}.json`)){
          let gamedata = await readjson(`./${msg.guild.id}.json`);
          let embed = new Discord.RichEmbed()
            .setTitle("--Players in the game--")
            .setDescription(`Player Counts: ⇨${configgame[msg.guild.id].playernumber}⇦` + "\n" +"Send [Join] to join the game\n--------------------------------")
            .setColor([0,120,255])

          for (i = 0; i < configgame[msg.guild.id].playernumber; i++) { 
            embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].role})`, gamedata[`player${i+1}`].playername);
          }

          msg.channel.send(embed);
        }else{
          msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
        }
      }else{
        msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
      }
      msg.delete(1);
    }
    
    if (msg.content.toLowerCase() === "join" || msg.content.toLowerCase() === "joingame" || msg.content.toLowerCase() === "join game"){
      if (configgame[msg.guild.id] != null){
        if(configgame[msg.guild.id].created == true && fs.existsSync(`./${msg.guild.id}.json`)){
          let gamedata = await readjson(`./${msg.guild.id}.json`);
          let exist = function(){
            for (i = 0; i < configgame[msg.guild.id].playernumber; i++) {
              if(gamedata[`player${i+1}`].player == msg.author.id){
                return true;
              }
            }
            return false;
          };

          if(exist() != true) {
            gamedata[`player${configgame[msg.guild.id].playernumber + 1}`] = {
              player: msg.author.id,
              playername: msg.author.username,
              role: "member"
            }
            await fs.writeFile(`./${msg.guild.id}.json`,  JSON.stringify(gamedata,null,4), function (err) {
              if(err){
                  throw err;
              }
            });
  
            configgame[msg.guild.id] = {
                playernumber: configgame[msg.guild.id].playernumber + 1,
                gamestarted: configgame[msg.guild.id].gamestarted,
                created: configgame[msg.guild.id].created
            }
            await fs.writeFile(`./gameconfig.json`,  JSON.stringify(configgame,null,4), function (err) {
              if(err){
                  throw err;
              }
            });
            let embed = new Discord.RichEmbed()
              .setTitle("--Players in the game--")
              .setDescription(`Player Counts: ⇨${configgame[msg.guild.id].playernumber}⇦` + "\n" +"Send [Join] to join the game\n--------------------------------")
              .setColor([0,120,255])

            for (i = 0; i < configgame[msg.guild.id].playernumber; i++) { 
              embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].role})`, gamedata[`player${i+1}`].playername);
            }

            msg.channel.send(embed)
          }else{
            msg.reply("You are already in the playerlist! \nSend [Show List] to show the playerlist!");
          }
        }else{
            msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
        }
      }else{
          msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
      }
      await msg.delete(1);
    }

    if (msg.content.toLowerCase() === "delete" || msg.content.toLowerCase() === "deletegame" || msg.content.toLowerCase() === "delete game"){
      if (msg.member.hasPermission("ADMINISTRATOR")){
        if(fs.existsSync(`./${msg.guild.id}.json`)){
          await theunmuteall(msg.channel, msg.guild.id, msg.guild.members);
          await unjinyanall(msg.channel, msg.guild.id, msg.guild.members);
          fs.unlink(`./${msg.guild.id}.json`, function (err) {
            if(err){
                throw err;
            }
          });
          configgame[msg.guild.id] = {}
          await fs.writeFile(`./gameconfig.json`,  JSON.stringify(configgame,null,4), function (err) {
            if(err){
              throw err;
            }
          });
          msg.reply("The game has deleted!")
        }else{
          msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
        }
      }else{
        msg.reply("You have no permission to do this!");
      }
    }

    if (msg.content.toLowerCase() === "restart" || msg.content.toLowerCase() === "start" || msg.content.toLowerCase() === "startgame" || msg.content.toLowerCase() === "start game"){
      if (configgame[msg.guild.id] != null){
        if(configgame[msg.guild.id].created == true && fs.existsSync(`./${msg.guild.id}.json`)){
          if (configgame[msg.guild.id].playernumber < 4){
            msg.channel.send("Need at least 4 players to start the game!");
            await msg.delete();
            return;
          }
          if (configgame[msg.guild.id].gamestarted == true && msg.content.toLocaleLowerCase() != "restart") return await msg.reply("There is already a game started!");
          let gamedata = await readjson(`./${msg.guild.id}.json`);
          if(msg.author.id == gamedata["player1"].player || msg.member.hasPermission("ADMINISTRATOR")){
           
            let guildid= msg.guild.id;
            await msg.delete(1);

            let fetched = await msg.channel.fetchMessages();
            await msg.channel.bulkDelete(fetched,true);
            await cleanchat(msg.channel);
            await msg.channel.send("Preparing the game! :video_game:");
            await startgame(guildid,msg.channel.id);

            let state = await getword();

            await console.log(state);
            
            await setallword(guildid, state[0], state[1]);

            await msg.channel.send(":traffic_light: Loading...");

            //await muteall(msg.channel,guildid,msg.guild.members);

            await sendwordout(msg.channel,guildid,msg.guild.members);


            await msg.channel.send("The word is in the DM(Private Chat) Server! :desktop:");


            //await unmuteall(msg.channel,guildid,msg.guild.members);
            await msg.channel.send("Game will start in 10 second!\n⁣⁣⁣⁣　\n⁣⁣⁣⁣　\n⁣⁣⁣⁣　");
            await jinyanall(msg.channel,guildid,msg.guild.members);
            await setTimeout(async function() {
              await playertalk(msg.channel,guildid,msg.guild.members,configgame[guildid].createtime);
            }, 10000);

            //await startvote(msg.channel,msg.guild.id);

            /*http.get({host:"http://api.img4me.com/?text=Orange&font=arial&fcolor=FFFFFF&size=30&bcolor=181818&type=png"},function(err,res){
              if (err){
                throw err;              
              }else{
              console.log(res);
              }
            });
            console.log(picurl);
            msg.channel.send({file:"picurl"})
            .then(msg => {
              msg.delete(5000)
            });*/
          }else{
            msg.reply("Wait for the owner to start the game!\nSend [Start Game] to start the game!");
          }
        }else{
          msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
        }
      }else{
        msg.reply("There is no game in this channel.\nSend [Create Game] to create a game!");
      }
    }

    if (msg.content.toLowerCase().search("cennie") >= 0) {
      await msg.author.send("Stop saying Cennie!");
    }
  
//---------------------------------------------------------------------------------------------

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

async function startgame(guildid,channelid){
  if (configgame[guildid] != null){
    if(configgame[guildid].created == true && fs.existsSync(`./${guildid}.json`)){

      let gamedata = await readjson(`./${guildid}.json`);
      let theguild = await client.guilds.get(guildid);
      configgame[guildid] = {
        playernumber: configgame[guildid].playernumber,
        gamestarted: true,
        created: configgame[guildid].created,
        createtime: new Date().toLocaleTimeString(),
        ontalk: 0,
        onsurvive: configgame[guildid].playernumber,
        round: 0,
      }
      await fs.writeFile("./gameconfig.json", JSON.stringify(configgame,null,4), await function (err) {
        if(err){
            throw err;
        }
      });
      let role;
      role = await theguild.roles.find(r => r.name === "None-Players");
      if (role){
        await role.edit({ permissions: []});
      }else{
        console.log("Set Role Up!");
      }

      let inplayer = await theguild.roles.find(r => r.name === "Players");
      if (!inplayer){
        inplayer = await theguild.createRole({
          name: "Players",
          color: "#8A2BE2",
          permissions: ['SEND_MESSAGES']
        });
      }

      for (i = 0; i < configgame[guildid].playernumber; i++) {
        gamedata[`player${i+1}`] = {
          player: gamedata[`player${i+1}`].player,
          playername: gamedata[`player${i+1}`].playername,
          role: gamedata[`player${i+1}`].role,
          word: "",
          isspy: "false",
          out: "false",
          votes: 0
        }
        let jsonsa = await JSON.stringify(gamedata,null,4);
        await writejson(`./${guildid}.json`,jsonsa);
        let theplayer = await theguild.members.get(gamedata[`player${i+1}`].player);
        await theplayer.removeRole(role);
        await theplayer.addRole(inplayer);
        await console.log("+1player");
      }
      return;
    }else{
      return "error";
    }
  }else{
    return "error";
  }
}



async function sendwordpic(word,dmplayer){
  request(`http://api.img4me.com/?text=${word}&font=arial&fcolor=FFFFFF&size=30&bcolor=181818&type=png`,async function(err,resp,body){
    if(!err && resp.statusCode == 200){
      let text = "Scroll Down!";
      for(i = 0; i<50; i++){
        text = text+"\n⁣⁣⁣⁣　";         
      }
      await dmplayer.send(text);
      await dmplayer.send("Please remember your word and keep it secret!");
      await dmplayer.send({file:body});
      await dmplayer.send("Back to the channel after checking the word!");
    }
  });
  return;
}


/*function genwordpack(){
  let a = fs.readFileSync("wordspackage.json");  
  let bbb = JSON.parse(a);
  for(i; i<200; i++){
    bbb[`word${i+199}`] = {
      a: " ",
      b: " "
    }
    fs.writeFile("wordspackage.json",  JSON.stringify(bbb,null,4), function (err) {
      if(err){
          throw err;
      }
    });
  }
}*/


async function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)+1);
}


async function writejson(path,json){
  fs.writeFileSync(path, json);
  return;
}






async function setallword(guildidz, normal, spy){
  if (configgame[guildidz] != null){
    if(configgame[guildidz].created == true && fs.existsSync(`./${guildidz}.json`)){
      let igamedata = await readjson(`./${guildidz}.json`);
      let spypos = await getRandomInt(configgame[guildidz].playernumber);
      console.log(`spy:${spypos}`);
      for(i = 0; i < configgame[guildidz].playernumber; i++){
        if (i+1 != spypos){
          igamedata[`player${i+1}`] = {
            player: igamedata[`player${i+1}`].player,
            playername: igamedata[`player${i+1}`].playername,
            role: igamedata[`player${i+1}`].role,
            word: normal,
            isspy: "false",
            out: igamedata[`player${i+1}`].out,
            votes: igamedata[`player${i+1}`].votes
          }
          let jsonsa = await JSON.stringify(igamedata,null,4);
          await writejson(`./${guildidz}.json`,jsonsa);
        }else if(i+1 == spypos){
          igamedata[`player${spypos}`] = {
            player: igamedata[`player${i+1}`].player,
            playername: igamedata[`player${i+1}`].playername,
            role: igamedata[`player${i+1}`].role,
            word: spy,
            isspy: "true",
            out: igamedata[`player${i+1}`].out,
            votes: igamedata[`player${i+1}`].votes
          }
          let jsonsa = await JSON.stringify(igamedata,null,4);
          await writejson(`./${guildidz}.json`,jsonsa);
        }
      }
      return;
    }else{
      return error;
    }
  }else{
    return error;
  }
}






async function getword(){
  if (fs.existsSync("wordspackage.json")){
    let worddata = await readjson("wordspackage.json");
    let suo = await getRandomInt(40);
    console.log(`Import word${suo}`)
    let yin = await getRandomInt(2);
    if (yin == 1){
      let normal = worddata[`word${suo}`].a;
      let spyword = worddata[`word${suo}`].b;
      console.log(normal,spyword);
      return[normal,spyword];
    }else if(yin == 2){
      let normal = worddata[`word${suo}`].b;
      let spyword = worddata[`word${suo}`].a;
      console.log(normal,spyword);
      return[normal,spyword];
    }
  }
  return;
}

async function readjson(path){
  let rawdata = await fs.readFileSync(path);  
  let gamedata = JSON.parse(rawdata);
  return gamedata;
}





async function cleanchat(channel){
  let text = "Clean";
  for(i = 0; i<300; i++){
    text = text+"\n⁣⁣⁣⁣　";         
  }
  await channel.send(text);
  return;
}


/*async function muteall(channel, guildidd, members){
  if (configgame[guildidd] != null){
    if(configgame[guildidd].created == true && fs.existsSync(`./${guildidd}.json`)){
      let gamedata = await readjson(`./${guildidd}.json`);
      for(i = 0; i<configgame[guildidd].playernumber; i++){
        let tomute = await members.get(gamedata[`player${i+1}`].player);
        if (tomute){
          await channel.overwritePermissions(tomute, {READ_MESSAGES: false});
        }
      }
    }
  }
}

async function unmuteall(channel, guildidd, members){
  if (configgame[guildidd] != null){
    if(configgame[guildidd].created == true && fs.existsSync(`./${guildidd}.json`)){
      let gamedata = await readjson(`./${guildidd}.json`);
      for(i = 0; i<configgame[guildidd].playernumber; i++){
        let tomute = await members.get(gamedata[`player${i+1}`].player);
        if (tomute){
          await channel.overwritePermissions(tomute, {READ_MESSAGES: null});
        }
      }
    }
  }
}*/

async function jinyanall(channel, guildidd, members){
  if (configgame[guildidd] != null){
    if(configgame[guildidd].created == true && fs.existsSync(`./${guildidd}.json`)){
      let gamedata = await readjson(`./${guildidd}.json`);
      for(i = 0; i<configgame[guildidd].playernumber; i++){
        if (gamedata[`player${i+1}`].out != "true"){
          let tomute = await members.get(gamedata[`player${i+1}`].player);
          if (tomute){
            await channel.overwritePermissions(tomute, {SEND_MESSAGES: false});
          }
        }
      }
    }
  }
  return;
}

async function theunmuteall(channel, guildidd, members){
  let theguild = await client.guilds.get(guildidd);
  let role = await theguild.roles.find(r => r.name === "None-Players");
  if (role){
    await role.edit({ permissions: ["SEND_MESSAGES"]});
  }else{
    console.log("Set Role Up!");
  }
  let inplay = await theguild.roles.find(r => r.name === "Players");
  if (configgame[guildidd] != null){
    if(configgame[guildidd].created == true && fs.existsSync(`./${guildidd}.json`)){
      let gamedata = await readjson(`./${guildidd}.json`);
      for(i = 0; i<configgame[guildidd].playernumber; i++){
        let tomute = await members.get(gamedata[`player${i+1}`].player);
        if (tomute){
          await channel.overwritePermissions(tomute, {SEND_MESSAGES: null});
          await tomute.removeRole(inplay);
          await tomute.addRole(role);
        }
      }
    }
  }
  return;
}


async function unjinyanall(channel, guildidd, members){
  if (configgame[guildidd] != null){
    if(configgame[guildidd].created == true && fs.existsSync(`./${guildidd}.json`)){
      let gamedata = await readjson(`./${guildidd}.json`);
      for(i = 0; i<configgame[guildidd].playernumber; i++){
        if (gamedata[`player${i+1}`].out != "true"){
          let tomute = await members.get(gamedata[`player${i+1}`].player);
          if (tomute){
            await channel.overwritePermissions(tomute, {SEND_MESSAGES: null});
          }
        }
      }
    }
  }
  return;
}

async function sendwordout(channel, guildidd, members){ 
  if (configgame[guildidd] != null){
    if(configgame[guildidd].created == true && fs.existsSync(`./${guildidd}.json`)){
      let gamedata = await readjson(`./${guildidd}.json`);
      for(i = 0; i<configgame[guildidd].playernumber; i++){
        let tomute = await members.get(gamedata[`player${i+1}`].player);
        if (tomute){
          await sendwordpic(gamedata[`player${i+1}`].word,tomute);
        }
      }
    }
  }
  return;
}


async function playertalk(channel, guildids, members, createtime){
  if (configgame[guildids]!= null){
    if(configgame[guildids].created == true && fs.existsSync(`./${guildids}.json`)){
      console.log(createtime);
      if(configgame[guildids].createtime == createtime){
        console.log(configgame[guildids].onsurvive);
        if(configgame[guildids].onsurvive > 3){
          if(configgame[guildids].ontalk != configgame[guildids].playernumber){
            await jinyanall(channel,guildids,members);
            await restart(channel, guildids, members,createtime);
          }else{
            await sendreview(channel, guildids,createtime);
            await unjinyanall(channel,guildids,members);
            await channel.send("Chatting time and voting will start in 60 seconds!");
            await setTimeout(async function() {
              await startvote(channel, guildids, members,createtime);
            }, 60000);
          }
        }else{
          console.log("Spy win!");
        }
      }
      
    }
  }
  return
}



async function sendreview(channel, guildida,createtime){
  if(configgame[guildida].createtime != createtime) return;
  let gamedata = await readjson(`./${guildida}.json`);
  let embed = await new Discord.RichEmbed()
  .setTitle("--Discription Review--")
  .setDescription(`Player Alive: ⇨${configgame[guildida].onsurvive}⇦` + "\n" +"--------------------------------")
  .setColor([255,0,0])
  for (i = 0; i < configgame[guildida].playernumber; i++) { 
    if (gamedata[`player${i+1}`].out != "true"){
        await embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].playername})`, gamedata[`player${i+1}`].discription);
    }

  }
  await channel.send(embed);
  return;
}




async function restart(channel, guildids, members, createtime){
  if(configgame[guildids].createtime == createtime){
    let gamedata = await readjson(`./${guildids}.json`);
    let ontalk = configgame[guildids].ontalk + 1;
    if (gamedata[`player${ontalk}`].out != "true" && configgame[guildids].createtime == createtime){
      let tomute = await members.get(gamedata[`player${ontalk}`].player);
      let talkname = gamedata[`player${ontalk}`].playername
      if (tomute){
        await channel.overwritePermissions(tomute, {SEND_MESSAGES: null});
      }
      await channel.send(`Player${ontalk} [${talkname}] is describing the word(30 sec)...`);
      await channel.awaitMessages(async function(msg){
        if(msg.author.id == gamedata[`player${ontalk}`].player && configgame[guildids].ontalk+1 == ontalk){
          let themsg = await msg.content.toLowerCase();
          if (themsg.search(gamedata[`player${ontalk}`].word.toLowerCase()) == -1){
            if(themsg === "showlist" || themsg === "list" || themsg === "show list" || 
            themsg === "creategame" || themsg === "create game" || themsg === "join" || 
            themsg === "joingame" || themsg === "join game" || themsg === "start" || themsg === "restart" ||
            themsg === "startgame" || themsg === "delete" || themsg === "delete game" || themsg === "deletegame" ||
            themsg === "start game" || themsg.search("!") === 0) return;
            configgame[guildids] = {
              playernumber: configgame[guildids].playernumber,
              gamestarted: configgame[guildids].gamestarted,
              created: configgame[guildids].created,
              createtime: configgame[guildids].createtime,
              ontalk: configgame[guildids].ontalk + 1 ,
              onsurvive: configgame[guildids].onsurvive,
              round: configgame[guildids].round
            }
            let jsonsa = await JSON.stringify(configgame,null,4);
            await writejson(`./gameconfig.json`,jsonsa);
            gamedata[`player${ontalk}`] = {
              player: gamedata[`player${ontalk}`].player,
              playername: gamedata[`player${ontalk}`].playername,
              role: gamedata[`player${ontalk}`].role,
              word: gamedata[`player${ontalk}`].word,
              isspy: gamedata[`player${ontalk}`].isspy,
              out: gamedata[`player${ontalk}`].out,
              votes: gamedata[`player${ontalk}`].votes,
              discription: msg.content
            }
            let jsonga = await JSON.stringify(gamedata,null,4);
            await writejson(`./${guildids}.json`,jsonga);
            await channel.overwritePermissions(tomute, {SEND_MESSAGES: false});
            await playertalk(channel, guildids, members,createtime);
            return;
          }else{
            let user = await members.get(msg.author.id);;
            await msg.delete();
            await user.send("Warning: Illegal Description!");
            return;
          }
        }else{
          return;
        }
      },{time: 30000});
      if(configgame[guildids].ontalk+1 == ontalk && configgame[guildids].createtime == createtime){
        await console.log("R.I.P skiped");
        await channel.send(`Player${ontalk} [${talkname}] did not talk!`);
        configgame[guildids] = {
          playernumber: configgame[guildids].playernumber,
          gamestarted: configgame[guildids].gamestarted,
          created: configgame[guildids].created,
          createtime:configgame[guildids].createtime,
          ontalk: configgame[guildids].ontalk + 1 ,
          onsurvive: configgame[guildids].onsurvive,
          round: configgame[guildids].round
        }
        let jsonsa = await JSON.stringify(configgame,null,4);
        await writejson(`./gameconfig.json`,jsonsa);
        gamedata[`player${ontalk}`] = {
          player: gamedata[`player${ontalk}`].player,
          playername: gamedata[`player${ontalk}`].playername,
          role: gamedata[`player${ontalk}`].role,
          word: gamedata[`player${ontalk}`].word,
          isspy: gamedata[`player${ontalk}`].isspy,
          out: gamedata[`player${ontalk}`].out,
          votes: gamedata[`player${ontalk}`].votes,
          discription: `× Player${ontalk} did not talk! ×`
        }
        let jsonga = await JSON.stringify(gamedata,null,4);
        await writejson(`./${guildids}.json`,jsonga);
        await channel.overwritePermissions(tomute, {SEND_MESSAGES: false});
        await playertalk(channel, guildids, members, createtime);
        return;
      }else{
        return
      }   
    }else{
      configgame[guildids] = {
        playernumber: configgame[guildids].playernumber,
        gamestarted: configgame[guildids].gamestarted,
        created: configgame[guildids].created,
        createtime: configgame[guildids].createtime,
        ontalk: configgame[guildids].ontalk + 1 ,
        onsurvive: configgame[guildids].onsurvive,
        round: configgame[guildids].round
      }
      let jsonsa = await JSON.stringify(configgame,null,4);
      await writejson(`./gameconfig.json`,jsonsa);
      await playertalk(channel, guildids, members, createtime);
    }
    return;
  }
}



async function killperson(channel, guildida, members,createtime){
  if(configgame[guildida].createtime != createtime) return;
  let gamedata = await readjson(`./${guildida}.json`);
  let ex = 0;
  let same = 0;
  let kill;
  for(i=0; i < configgame[guildida].playernumber; i++){
    if (gamedata[`player${i+1}`].out != "true") {
      let votes = gamedata[`player${i+1}`].votes;
      if (votes > ex){
        if(same > 0){
          ex = votes;
          kill = i+1;
          same = 0;
        }else{
          ex = votes;
          kill = i+1;
        }
      }else if(votes == ex){
        same++;
      }
    }
  }
  for (i = 0; i < configgame[guildida].playernumber; i++) {
    gamedata[`player${i+1}`] = {
      player: gamedata[`player${i+1}`].player,
      playername: gamedata[`player${i+1}`].playername,
      role: gamedata[`player${i+1}`].role,
      word: gamedata[`player${i+1}`].word,
      isspy: gamedata[`player${i+1}`].isspy,
      out: gamedata[`player${i+1}`].out,
      votes: 0
    }
    let jonsq = await JSON.stringify(gamedata,null,4);
    await writejson(`./${guildida}.json`,jonsq);
  }
  if(same > 0){
    await channel.send("There are same players got the highest votes");
    configgame[guildida] = {
      playernumber: configgame[guildida].playernumber,
      gamestarted: configgame[guildida].gamestarted,
      created: configgame[guildida].created,
      createtime: configgame[guildida].createtime,
      ontalk: 0,
      onsurvive: configgame[guildida].onsurvive,
      round: configgame[guildida].round + 1
    }
    let jsonsa = await JSON.stringify(configgame,null,4);
    await writejson(`./gameconfig.json`,jsonsa);
    await channel.send("No one outed, game continued!");
    await playertalk(channel, guildida, members,createtime);
    return;
  }else if(ex > 0 && kill){
    await channel.send(`Player${kill}[${gamedata[`player${kill}`].playername}] is killed!😭`);
    configgame[guildida] = {
      playernumber: configgame[guildida].playernumber,
      gamestarted: configgame[guildida].gamestarted,
      created: configgame[guildida].created,
      createtime:configgame[guildida].createtime,
      ontalk: 0,
      onsurvive: configgame[guildida].onsurvive - 1,
      round: configgame[guildida].round + 1
    }
    let jsonsa = await JSON.stringify(configgame,null,4);
    await writejson(`./gameconfig.json`,jsonsa);
    gamedata[`player${kill}`] = {
      player: gamedata[`player${kill}`].player,
      playername: gamedata[`player${kill}`].playername,
      role: gamedata[`player${kill}`].role,
      word: gamedata[`player${kill}`].word,
      isspy: gamedata[`player${kill}`].isspy,
      out: "true",
      votes: gamedata[`player${kill}`].votes,
      discription: gamedata[`player${kill}`].discription
    }
    let jsonsq = await JSON.stringify(gamedata,null,4);
    await writejson(`./${guildida}.json`,jsonsq);
    if(gamedata[`player${kill}`].isspy == "true"){
      await channel.send(`Game ended, player${kill} is a spy, :man_in_tuxedo: citizens win the game!`);
      await theunmuteall(channel, guildida, members);

      return;
    }else{
      if (configgame[guildida].onsurvive > 3){
        await channel.send("Game continued!");
        await playertalk(channel, guildida, members, createtime);
        return;
      }else{
        await channel.send("Game ended, :spy: spy wins the game!(spy survived!)");
        await theunmuteall(channel, guildida, members);
        return;
      }
    }
  }
  return;
}


async function startvote(channel,guildida, members,creattime){
  if(configgame[guildida].createtime != creattime) return;
  await channel.send("Starting to vote! Vote the player that you think is a spy(60 sec)!");
  let gamedata = await readjson(`./${guildida}.json`);
  let embed = await new Discord.RichEmbed()
  .setTitle("☠--Vote To Kill--☠")
  .setDescription(`Player Alive: ⇨${configgame[guildida].onsurvive}⇦` + "\n" +"Send [Vote + Play Number](Ex: Vote1 to vote player 1!) to vote!\n--------------------------------")
  .setColor([255,255,0])
  for (i = 0; i < configgame[guildida].playernumber; i++) { 
    if (gamedata[`player${i+1}`].out != "true"){
      await embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].playername})`, `Votes: ${gamedata[`player${i+1}`].votes}`);
    }else{
      await embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].playername})`, "💀 R.I.P 💀");
    }
  }
  await channel.send(embed);
  let totalvote = 0;
  let round = configgame[guildida].round;
  let createtime = configgame[guildida].createtime;
  await channel.awaitMessages(async function(msg){
    if (msg.author.id == client.user.id) return;
    let themsg = await msg.content.toLowerCase();
    if(themsg.search("vote") != -1 || themsg.search("voting") != -1){
      var numbers = await themsg.match(/\d+/g).map(Number);
      if (numbers.length === 1){
        console.log(numbers[0]);
        if (numbers[0] <= configgame[guildida].playernumber && numbers[0] > 0){
          if (gamedata[`player${numbers[0]}`] && gamedata[`player${numbers[0]}`].out != "true"){
            gamedata[`player${numbers[0]}`] = {
              player: gamedata[`player${numbers[0]}`].player,
              playername: gamedata[`player${numbers[0]}`].playername,
              role: gamedata[`player${numbers[0]}`].role,
              word: gamedata[`player${numbers[0]}`].word,
              isspy: gamedata[`player${numbers[0]}`].isspy,
              out: gamedata[`player${numbers[0]}`].out,
              votes: gamedata[`player${numbers[0]}`].votes + 1,
              discription: gamedata[`player${numbers[0]}`].discription
            }
            let jsonga = await JSON.stringify(gamedata,null,4);
            await writejson(`./${guildida}.json`,jsonga);
            let tomute = await msg.guild.members.get(msg.author.id);
            await channel.overwritePermissions(tomute, {SEND_MESSAGES: false});
            await msg.reply(`You voted player${numbers[0]}[${gamedata[`player${numbers[0]}`].playername}]`);
            totalvote ++ 
            // set embed
            let embed = await new Discord.RichEmbed()
            .setTitle("☠--Vote To Kill--☠")
            .setDescription(`Player Alive: ⇨${configgame[guildida].onsurvive}⇦` + "\n" +"Send [Vote + Play Number](Ex: Vote1 to vote player 1!) to vote!\n--------------------------------")
            .setColor([255,255,0])
            for (i = 0; i < configgame[guildida].playernumber; i++) { 
              if (gamedata[`player${i+1}`].out != "true"){
                await embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].playername})`, `Votes: ${gamedata[`player${i+1}`].votes}`);
              }else{
                await embed.addField(`Player${i+1} (${gamedata[`player${i+1}`].playername})`, "💀 R.I.P 💀");
              }
            }
            await channel.send(embed);
            //end set embed

            if(totalvote === configgame[guildida].onsurvive && round === configgame[guildida].round && createtime === configgame[guildida].createtime){
              await killperson(channel, guildida, members,creattime);
              return;
            }
          }else{
          await msg.reply(`Player${numbers[0]} already outed`);
          return;
          }
        }else{
          await msg.reply(`Player${numbers[0]} does not exist!`);
          return;
        }
      }else{
        await msg.reply("Please vote 1 player!");
        return;
      }
    }
  }, {time: 60000});
  if(totalvote < configgame[guildida].onsurvive && round === configgame[guildida].round && createtime === configgame[guildida].createtime){
    await killperson(channel, guildida, members,creattime);
    return;
  }
  return;
}



client.login(process.env.BOT_TOKEN);
