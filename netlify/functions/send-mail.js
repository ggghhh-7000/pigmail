exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { sender, to, subject, textBody } = JSON.parse(event.body);

        if (!sender) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized sender' }) };
        }

        const response = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': 'f1d6182fd4d2d0ffb3ab734f79deffe9'
            },
            body: JSON.stringify({
                From: `${sender}@pigmail.pig365.work.gd`,
                To: to,
                Subject: subject,
                TextBody: textBody
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            return { statusCode: response.status, body: JSON.stringify({ error: result.Message || 'Postmark 寄信失敗' }) };
        }

        return { statusCode: 200, body: JSON.stringify({ success: true, result }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
