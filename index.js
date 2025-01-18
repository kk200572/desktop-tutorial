const { Client, GatewayIntentBits } = require('discord.js');
const { google } = require('googleapis');
require('dotenv').config(); // 使用 .env 文件存儲密鑰

// 初始化 Discord bot 客戶端
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log('Bot is online!');
});

// 用於認證 Google Sheets API
async function authenticateGoogleSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SHEET_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
}

// 根據用戶查詢關鍵字查詢 Google Sheets 中的問題和答案
async function getAnswerFromSheet(query) {
    const sheets = await authenticateGoogleSheets();

    // 替換為你的 Google Sheets ID
    const spreadsheetId = 'your-google-sheet-id';
    const range = 'Sheet1!A2:B';  // A列是問題，B列是答案

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const rows = response.data.values;
    if (!rows.length) {
        console.log('找不到問題');
        return '抱歉，我無法找到該問題的答案。';
    }

    // 遍歷題庫並查找匹配的問題
    for (const row of rows) {
        const question = row[0];  // A欄：問題
        const answer = row[1];    // B欄：答案
        if (question.toLowerCase().includes(query.toLowerCase())) {
            return `問題：${question}\n答案：${answer}`;
        }
    }

    return '抱歉，我無法找到該問題的答案。';
}

// 處理來自 Discord 的訊息
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;  // 忽略機器人自己的訊息

    if (message.content.startsWith("!query")) {
        const query = message.content.slice(7).trim(); // 擷取用戶查詢的關鍵字

        if (!query) {
            return message.reply('請提供查詢關鍵字。');
        }

        // 查詢 Google Sheets 並回應用戶
        const answer = await getAnswerFromSheet(query);
        message.reply(answer);
    }
});

// 登錄到 Discord 伺服器
client.login(config.token);
