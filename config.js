require('dotenv').config();

const config = {
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        checkInterval: parseInt(process.env.CHECK_INTERVAL) || 5000
    },
    facebook: {
        username: process.env.FB_USERNAME,
        password: process.env.FB_PASSWORD
    },
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};

// Kiểm tra các biến môi trường bắt buộc
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'FB_USERNAME', 'FB_PASSWORD'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

module.exports = config; 