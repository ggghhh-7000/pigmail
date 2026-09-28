exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const mailData = JSON.parse(event.body);
        const recipient = mailData.To || mailData.OriginalRecipient || '';
        const targetUsername = recipient.split('@')[0];

        if (!targetUsername) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid recipient' }) };
        }

        const BIN_ID = '6aa1715dac6210605ab87b62';
        const API_KEY = '$2a$10$Q3e6T7l53HKgJr3pc5tuW.5dTGTAyi6948TrSpoe7mNIZm6kaRMbm';

        // 使用原生 fetch 取代 axios
        const binRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const binData = await binRes.json();
        const users = binData.record;
        
        const isValidUser = users.some(u => u.username === targetUsername);

        if (!isValidUser) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Recipient not allowed' }) };
        }

        console.log(`成功收到寄給 [${targetUsername}] 的信件`);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
        
    } catch (error) {
        console.error('錯誤:', error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
