const https = require('https');

const data = JSON.stringify({
    email: "hadi.tiger.2003q@gmail.com",
    password: "test1234567890"
});

const options = {
    hostname: 'procreative-dalilah-horsy.ngrok-free.dev',
    port: 443,
    path: '/api/auth/token/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'ngrok-skip-browser-warning': 'true'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => {
        body += d;
    });
    res.on('end', () => {
        console.log(body);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(data);
req.end();
