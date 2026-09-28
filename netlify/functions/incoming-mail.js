const axios = require('axios');

const BIN_ID = '6aa1715dac6210605ab87b62';
const API_KEY = '$2a$10$Q3e6T7l53HKgJr3pc5tuW.5dTGTAyi6948TrSpoe7mNIZm6kaRMbm';

exports.handler = async function(event, context) {
    // 確保只接受 POST 請求（Postmark Webhook 觸發方式）
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const mailData = JSON.parse(event.body);
        const recipient = mailData.To || mailData.OriginalRecipient || '';
        const targetUsername = recipient.split('@')[0]; // 萃取出帳號名稱 (例如 ffff)

        if (!targetUsername) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid recipient' }) };
        }

        // 從 JSONBin 驗證該收件帳號是否存在
        const binRes = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const users = binRes.data.record;
        const isValidUser = users.some(u => u.username === targetUsername);

        if (!isValidUser) {
            console.log(`攔截未授權的收件目標: ${recipient}`);
            return { statusCode: 403, body: JSON.stringify({ error: 'Recipient not allowed' }) };
        }

        // 驗證通過，成功接收郵件
        console.log(`成功收到寄給 [${targetUsername}] 的信件：${mailData.Subject}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Mail processed successfully' })
        };
    } catch (error) {
        console.error('處理郵件發生錯誤:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
