const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Khởi tạo bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

// Lưu trữ UID cho mỗi user
const watchList = new Map();
const intervals = new Map();

// Hàm check UID
async function checkUID(uid) {
    try {
        const response = await axios.get(`https://graph2.facebook.com/v3.3/${uid}/picture?redirect=false`);
        return response.data.data.height && response.data.data.width;
    } catch {
        return false;
    }
}

// Hàm check và gửi status
async function checkAndSendStatus(chatId) {
    const uids = watchList.get(chatId);
    if (!uids || uids.size === 0) return;

    for (const uid of uids) {
        try {
            const isLive = await checkUID(uid);
            await bot.sendMessage(
                chatId,
                `🔍 UID: ${uid}\n` +
                `📊 Status: ${isLive ? '✅ LIVE' : '❌ DIE'}\n` +
                `⏰ Time: ${new Date().toLocaleTimeString('vi-VN')}`
            );
        } catch (error) {
            console.error(`Error checking UID ${uid}:`, error);
        }
    }
}

// Command /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        '👋 *Chào mừng đến với Bot Check Live UID Facebook!*\n\n' +
        '*Các lệnh:*\n' +
        '`/watch [uid]` - Thêm UID vào danh sách theo dõi\n' +
        '`/unwatch [uid]` - Xóa UID khỏi danh sách\n' +
        '`/list` - Xem danh sách đang theo dõi\n' +
        '`/stop` - Dừng theo dõi tất cả',
        {parse_mode: 'Markdown'}
    );
});

// Command /watch [uid]
bot.onText(/\/watch (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const uid = match[1];

    if (!/^\d+$/.test(uid)) {
        return bot.sendMessage(chatId, '❌ UID không hợp lệ! Vui lòng nhập số.');
    }

    if (!watchList.has(chatId)) {
        watchList.set(chatId, new Set());
    }
    watchList.get(chatId).add(uid);

    if (!intervals.has(chatId)) {
        intervals.set(chatId, setInterval(() => {
            checkAndSendStatus(chatId);
        }, parseInt(process.env.CHECK_INTERVAL)));
    }

    bot.sendMessage(chatId, `✅ Đã thêm UID ${uid} vào danh sách theo dõi`);
});

// Command /unwatch [uid]
bot.onText(/\/unwatch (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const uid = match[1];

    if (watchList.has(chatId)) {
        watchList.get(chatId).delete(uid);
        bot.sendMessage(chatId, `✅ Đã xóa UID ${uid} khỏi danh sách theo dõi`);
        
        if (watchList.get(chatId).size === 0) {
            clearInterval(intervals.get(chatId));
            intervals.delete(chatId);
        }
    }
});

// Command /list
bot.onText(/\/list/, (msg) => {
    const chatId = msg.chat.id;
    const uids = watchList.get(chatId);

    if (!uids || uids.size === 0) {
        return bot.sendMessage(chatId, '📝 Không có UID nào đang được theo dõi');
    }

    bot.sendMessage(
        chatId,
        '📝 *Danh sách UID đang theo dõi:*\n\n' + 
        Array.from(uids).map(uid => `• \`${uid}\``).join('\n'),
        {parse_mode: 'Markdown'}
    );
});

// Command /stop
bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    
    if (intervals.has(chatId)) {
        clearInterval(intervals.get(chatId));
        intervals.delete(chatId);
    }
    
    watchList.delete(chatId);
    bot.sendMessage(chatId, '✅ Đã dừng theo dõi tất cả UID');
});

// Xử lý lỗi
bot.on('polling_error', (error) => {
    console.error('Bot polling error:', error);
});

console.log('🤖 Bot đang chạy...'); 