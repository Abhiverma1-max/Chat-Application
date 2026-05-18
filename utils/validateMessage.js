function validateMessage(message) {
    return (
        typeof message === 'string' &&
        message.trim().length > 0 &&
        message.length <= 1000
    );
}

module.exports = validateMessage;