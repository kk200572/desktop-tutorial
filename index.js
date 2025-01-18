const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!search')) {
    const query = message.content.replace('!search', '').trim();
    const result = searchQuestion(query);
    message.channel.send(result || 'No matching question found.');
  }
});

function searchQuestion(query) {
  const data = JSON.parse(fs.readFileSync('questions.json', 'utf8'));
  const question = data.find(q => q.title.toLowerCase().includes(query.toLowerCase()));
  return question ? question.answer : null;
}

// 使用環境變數讀取 Discord Token
client.login(process.env.DISCORD_BOT_TOKEN);
