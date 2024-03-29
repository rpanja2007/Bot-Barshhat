//(c) R.Panja And Aman
const { escapeRegex } = require("../../handlers/functions");

module.exports = async (client, message) => {
  const {
    config,
    discord: {
      EmbedBuilder,
      Collection
    }
  } = client;
  
  try {
    client.stats.ensure("global", {
      commands: 0,
      messages: 0,
    })
    if (!message.guild) return;
    client.stats.ensure(message.guild.id, {
      commands: 0,
      messages: 0,
    })
    client.settings.ensure(message.guild.id, {
      prefix: config.prefix
    })
    client.chatbot.ensure(message.guild.id, {
      channels: []
    })
    
    if (message.author.bot) return;
    if (message.channel.partial) await message.channel.fetch();
    if (message.partial) await message.fetch();
    let prefix = client.settings.get(message.guild.id, "prefix");
    if (prefix === null) prefix = config.prefix;
    
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) {
      if (matchedPrefix.includes(client.user.id))
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(config.color)
              .setFooter({ text: config.footertext, iconURL: config.footericon })
              .setTitle(`why You Pinged Me. Please ${prefix} This my Prefix My it. `)
              .setDescription(`To see all Commands type: \`${prefix}help\``)
          ]
        });
      return;
    }
    //get the command from the collection
    let command = client.commands.get(cmd);
    //if the command does not exist, try to get it by his alias
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    //if the command is now valid
    if (command) {
      if (!client.cooldowns.has(command.name)) { //if its not in the cooldown, set it too there
        client.cooldowns.set(command.name, new Collection());
      }
      const now = Date.now(); //get the current time
      const timestamps = client.cooldowns.get(command.name); //get the timestamp of the last used commands
      const cooldownAmount = (command.cooldown || 1.5) * 1000; //get the cooldownamount of the command, if there is no cooldown there will be automatically 1 sec cooldown, so you cannot spam it^^
      if (timestamps.has(message.author.id)) { //if the user is on cooldown
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount; //get the amount of time he needs to wait until he can run the cmd again
        if (now < expirationTime) { //if he is still on cooldonw
          const timeLeft = (expirationTime - now) / 1000; //get the lefttime
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(config.wrongcolor)
                .setFooter({ text: config.footertext, iconURL: config.footericon })
                .setTitle(`❌ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
            ]
          }); //send an information message
        }
      }
      timestamps.set(message.author.id, now); //if he is not on cooldown, set it to the cooldown
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); //set a timeout function with the cooldown, so it gets deleted later on again
      try {
        //try to delete the message of the user who ran the cmd
        try { message.delete(); } catch { }
        //if Command has specific permission return error
        if (command.memberpermissions) {
          if (!command.memberpermissions.every(perm => message.member.permissions.toArray().includes(perm))) return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(config.wrongcolor)
                .setFooter({ text: config.footertext, iconURL: config.footericon })
                .setTitle("❌ Error | You are not allowed to run this command!")
                .setDescription(`You need these Permissions: \`${command.memberpermissions.join("`, ``")}\``)
            ]
          }).then(msg => setTimeout(() => msg.delete(), 5_000));
        }
        //if the Bot has not enough permissions return error
        if (!['Administrator'].every(perm => message.guild.members.me.permissions.toArray().includes(perm))) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(config.wrongcolor)
                .setFooter({ text: config.footertext, iconURL: config.footericon })
                .setTitle("❌ Error | I don't have enough Permissions!")
                .setDescription("Please give me ADMINISTRATOR, because i need it to delete Messages, Create Channel and execute all Admin Commands ")
            ]
          })
        }
        client.stats.inc(message.guild.id, "commands")
        client.stats.inc("global", "commands")
        //run the command with the parameters:  client, message, args, user, text, prefix,
        command.run(client, message, args, message.member, args.join(" "), prefix);
      } catch (e) {
        console.log(String(e.stack).red)
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(config.wrongcolor)
              .setFooter({ text: config.footertext, iconURL: config.footericon })
              .setTitle("❌ Something went wrong while, running the: `" + command.name + "` command")
              .setDescription(`\`\`\`${e.message}\`\`\``)
          ]
        }).then(msg => setTimeout(() => msg.delete(), 5_000));
      }
    }
    else //if the command is not found send an info msg
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.wrongcolor)
            .setFooter({ text: config.footertext, iconURL: config.footericon })
            .setTitle(`❌ Unkown command, try: **\`${prefix}help\`**`)
            .setDescription(`To play Music simply type \`${prefix}play <Title / Url>\``)
        ]
      }).then(msg => setTimeout(() => msg.delete(), 5_000));
  } catch (e) {
    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle(`❌ ERROR | An error occurred`)
          .setDescription(`\`\`\`${e.stack}\`\`\``)
      ]
    });
  }

}
