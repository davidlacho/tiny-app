const generateRandomString = () => Math.random().toString(36).replace('0.', '').substring(0, 6);

module.exports.generateRandomString = generateRandomString;
