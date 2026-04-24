const http = require('http');

const loginOptions = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).token;
    
    const chatOptions = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const chatReq = http.request(chatOptions, (chatRes) => {
      console.log(`STATUS: ${chatRes.statusCode}`);
      let chatData = '';
      chatRes.on('data', chunk => chatData += chunk);
      chatRes.on('end', () => {
        console.log(`BODY: ${chatData}`);
      });
    });
    
    chatReq.on('error', (e) => console.error(e));
    chatReq.write(JSON.stringify({ message: "What are the departments and how many are there?", history: [] }));
    chatReq.end();
  });
});

req.on('error', (e) => console.error(e));
req.write(JSON.stringify({ email: 'admin@lms.edu', password: 'password' }));
req.end();
