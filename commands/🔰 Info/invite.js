//(c) R.Panja And Aman
module.exports = {
  name: "invite",
  category: "🔰 Info",
  aliases: ["add"],
  cooldown: 5,
  usage: "invite",
  description: "Gives you an Invite link for this Bot",
  run: async (client, message, args, user, text, prefix) => {
    const {
      config,
      discord: {
        EmbedBuilder
      }
    } = client;
    
    try {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.color)
            .setTitle(":heart: Thanks for inviting me!")
            .setFooter({ text: config.footertext, iconURL: config.footericon })
            .setURL("https://bit.ly/3u26wKW")
            .setDescription("[Click here](https://bit.ly/3u26wKW)")
        ]
      });
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.wrongcolor)
            .setFooter({ text: config.footertext, iconURL: config.footericon })
            .setTitle(`❌ ERROR | An error occurred`)
            .setDescription(`\`\`\`${e.stack}\`\`\``)
        ]
      });
    }
  }
}
