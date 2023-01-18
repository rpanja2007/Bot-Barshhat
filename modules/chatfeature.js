// (c) R.Panja#9236 

const config = require("../botconfig/config");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { AttachmentBuilder } = require("discord.js");
//npm i colors
module.exports = client => {
  console.log(" :: LOADED CHATFEATURE.JS ".bgGreen)
        

  client.on("messageCreate", message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm"){
      
      fetch(`http://api.brainshop.ai/get?bid=${config.b_id}&key=${config.b_key}&uid=1&msg=${message.content}`).then(res => res.json())
        .then(data => {
        message.channel.send({ content: data.cnt }).catch(e=>console.log("ERROR | " + e.stack))
        client.stats.inc("global", "messages")
      })
      return;
    }
    if(client.chatbot.get(message.guild.id, "channels").includes(message.channel.id)){
      if(message.attachments.size > 0)
        return message.reply({ content: "Look at this too...", files: [new AttachmentBuilder("./I_CANNOT_READ_FILES.png")]})

      fetch(`http://api.brainshop.ai/get?bid=${config.b_id}&key=${config.b_key}&uid=1&msg=${encodeURIComponent(message)}`)
        .then(res => res.json()
        .then(data => {
        message.channel.send({ content: data.cnt }).catch(e=>console.log("ERROR | " + e.stack))
        client.stats.inc(message.guild.id, "messages")
        client.stats.inc("global", "messages")
      }))
    }
  })
  client.on("channelDelete", channel => {
    try{
      client.chatbot.remove(channel.guild.id, channel.id, "channels")
    }catch { }
  })
  client.on("guildDelete", guild => {
    try{
      let channels = guild.channels.cache.map(ch => ch.id)
      for(const chid of channels){
        if(client.chatbot.get(message.guild.id).includes(channel.id))
          client.chatbot.remove(message.guild.id, chid, "channels")
      }
    }catch{ }
  })
}
