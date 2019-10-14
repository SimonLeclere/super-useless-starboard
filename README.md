# simple-starboard
Simple starboard bot for discord.


```js
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(client.user.tag + ' is ready!')
});

client.on('raw', packet => {
 
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    const channel = client.channels.get(packet.d.channel_id);
    if (channel.messages.has(packet.d.message_id)) return;
   
    channel.fetchMessage(packet.d.message_id).then(message => {
       
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        const reaction = message.reactions.get(emoji);
        if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
        }
    });
});
 
client.on('messageReactionAdd', async (reaction, user) => {
 const message = reaction.message;
    if (reaction.emoji.name !== '⭐') return;
    if (message.author.id === user.id) return;
    if (message.author.bot) return;
    const starChannel = client.channels.get(starboardChannelID)
    if (!starChannel) return;
    const fetchedMessages = await starChannel.fetchMessages({ limit: 100 });
   
    const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
    if (stars) {
      const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const foundStar = stars.embeds[0];
      const image = message.attachments.size > 0 ? await (reaction, message.attachments.array()[0].url) : '';
      const embed = new Discord.RichEmbed()
        .setColor(foundStar.color)
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setDescription(foundStar.description)
        .setTimestamp()
        .setFooter(`⭐ ${parseInt(star[1])+1} | ${message.id}`)
        .setImage(image);
      const starMsg = await starChannel.fetchMessage(stars.id);
      await starMsg.edit({ embed });
    }
    if (!stars) {
      const image = message.attachments.size > 0 ? await (reaction, message.attachments.array()[0].url) : '';
      if (image === '' && message.cleanContent.length < 1) return;
      const embed = new Discord.RichEmbed()
        .setColor(message.member.displayHexColor)
        .setDescription(`**[Jump To Message](${message.url})**\n\n${message.cleanContent}`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setTimestamp(new Date())
        .setFooter(`⭐ 1 | ${message.id}`)
        .setImage(image);
      await starChannel.send({ embed });
    }
   
})
   
client.on('messageReactionRemove', async (reaction, user) => {
   
    const message = reaction.message;
    if (message.author.id === user.id) return;
    if (message.author.bot) return;
    if (reaction.emoji.name !== '⭐') return;
    const starChannel = client.channels.get(starboardChannelID)
    if (!starChannel) return;
    const fetchedMessages = await starChannel.fetchMessages({ limit: 100 });
    const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(reaction.message.id));
    if (stars) {
      const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      const foundStar = stars.embeds[0];
      const image = message.attachments.size > 0 ? await (reaction, message.attachments.array()[0].url) : '';
      const embed = new Discord.RichEmbed()
        .setColor(foundStar.color)
        .setDescription(`${foundStar.description}`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setTimestamp()
        .setFooter(`⭐ ${parseInt(star[1])-1} | ${message.id}`)
        .setImage(image);
      const starMsg = await starChannel.fetchMessage(stars.id);
      await starMsg.edit({ embed });
      if(parseInt(star[1]) - 1 == 0) return starMsg.delete(1000);
    }
 
});

client.login("Put_Your_TOKEN");
```
