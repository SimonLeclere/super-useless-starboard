const { Client, MessageEmbed} = require('discord.js');
const client = new Client();


const settings = {
	token: '', // Your discord bot token
	channel: '', // Starboard channel id
	emoji: '⭐' // Emoji
}


client.on('raw', packet => {
	if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
	const channel = client.channels.cache.get(packet.d.channel_id);
	if (channel.messages.cache.has(packet.d.message_id)) return;
	channel.messages.fetch(packet.d.message_id).then(message => {
		const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
		const reaction = message.reactions.cache.get(emoji);
		if (reaction) reaction.users.cache.set(packet.d.user_id, client.users.cache.get(packet.d.user_id));
		if (packet.t === 'MESSAGE_REACTION_ADD') {
			client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
		}
		if (packet.t === 'MESSAGE_REACTION_REMOVE') {
			client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
		}
	});
});

client.on('messageReactionAdd', async (reaction, user) => {
	const message = reaction.message;
	if (reaction.emoji.name !== settings.emoji) return;
	if (message.author.id === user.id) return message.channel.send(`${user}, you cannot star your own messages.`);
	if (message.author.bot) return message.channel.send(`${user}, you cannot star bot messages.`);
	const starChannel = message.guild.channels.cache.get(settings.channel)
	if (!starChannel) return message.channel.send(`It appears that you do not have a \`${starboardChannel}\` channel.`); 
	const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
	const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith(settings.emoji) && m.embeds[0].footer.text.endsWith(message.id));
	if (stars) {
		const regex = new RegExp(`^\\${settings.emoji}\\s([0-9]{1,3})\\s\\|\\s([0-9]{17,20})`);
		const star = regex.exec(stars.embeds[0].footer.text);
		const foundStar = stars.embeds[0];
		const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
		const embed = new MessageEmbed()
			.setColor(foundStar.color)
			.setDescription(foundStar.description)
			.setAuthor(message.author.tag, message.author.displayAvatarURL)
			.setTimestamp()
			.setFooter(`${settings.emoji} ${parseInt(star[1])+1} | ${message.id}`)
			.setImage(image);
		const starMsg = await starChannel.messages.fetch(stars.id);
		await starMsg.edit({ embed });
	}
	if (!stars) {
		const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
		if (image === '' && message.cleanContent.length < 1) return message.channel.send(`${user}, you cannot star an empty message.`);
		const embed = new MessageEmbed()
			.setColor(15844367)
			.setDescription(message.cleanContent)
			.setAuthor(message.author.tag, message.author.displayAvatarURL)
			.setTimestamp(new Date())
			.setFooter(`${settings.emoji} 1 | ${message.id}`)
			.setImage(image);
		await starChannel.send({ embed });
	}
})
	 
client.on('messageReactionRemove', async (reaction, user) => {
	const message = reaction.message;
	if (message.author.id === user.id) return;
	if (reaction.emoji.name !== settings.emoji) return;
	const starChannel = message.guild.channels.cache.get(settings.channel)
	if (!starChannel) return message.channel.send(`It appears that you do not have a \`${starboardChannel}\` channel.`); 
	const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });
	const stars = fetchedMessages.find(m => m.embeds[0].footer.text.startsWith(settings.emoji) && m.embeds[0].footer.text.endsWith(reaction.message.id));
	if (stars) {
		const regex = new RegExp(`^\\${settings.emoji}\\s([0-9]{1,3})\\s\\|\\s([0-9]{17,20})`);
		const star = regex.exec(stars.embeds[0].footer.text);
		const foundStar = stars.embeds[0];
		const image = message.attachments.size > 0 ? await extension(reaction, message.attachments.array()[0].url) : '';
		const embed = new MessageEmbed()
			.setColor(foundStar.color)
			.setDescription(foundStar.description)
			.setAuthor(message.author.tag, message.author.displayAvatarURL)
			.setTimestamp()
			.setFooter(`${settings.emoji} ${parseInt(star[1])-1} | ${message.id}`)
			.setImage(image);
		const starMsg = await starChannel.messages.fetch(stars.id);
		await starMsg.edit({ embed });
		if(parseInt(star[1]) - 1 == 0) return starMsg.delete({ timout: 1000 });
	}
});

function extension(reaction, attachment) {
	const imageLink = attachment.split('.');
	const typeOfImage = imageLink[imageLink.length - 1];
	const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
	if (!image) return '';
	return attachment;
};

client.on('ready', () => console.log('Ready !'));

client.login(settings.token);
