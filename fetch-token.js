const fetch = require('node-fetch');

async function getToken() {
    try {
        const response = await fetch('https://procreative-dalilah-horsy.ngrok-free.dev/api/auth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                email: "hadi.tiger.2003q@gmail.com",
                password: "test1234567890"
            })
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching token:', error);
    }
}

getToken();
