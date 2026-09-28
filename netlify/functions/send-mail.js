exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { sender, to, subject, textBody } = JSON.parse(event.body);

        // 確保只能用自己的身份發信 (例如 pigg)
        if (!sender || !sender.startsWith('pigg')) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized sender' }) };
        }

        // 呼叫 Postmark Outbound API 發信
        const response = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': '你的Postmark伺服器ServerToken'
            },
            body: JSON.stringify({
                From: `${sender}@pigmail.pig365.work.gd`,
                To: to,
                Subject: subject,
                TextBody: textBody
            })
        });

        const result = await response.json();
        return { statusCode: 200, body: JSON.stringify({ success: true, result }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
