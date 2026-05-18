const autocannon = require('autocannon');
autocannon({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 10
}, console.log);