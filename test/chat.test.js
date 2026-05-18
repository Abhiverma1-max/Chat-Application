const { expect } = require('chai');
const io = require('socket.io-client');
describe('Chat App', () => {
    let client;
    beforeEach((done) => {
        client = io('http://localhost:3000');
        client.on('connect', done);
    });
    afterEach(() => {
        client.close();
    });
    it('should receive message', (done) => {
        client.emit('chat message', 'Hello');
        client.on('chat message', (msg) => {
            expect(msg.text).to.equal('Hello');
            done();
        });
    });
});