dev = require('./dev');
test = require('./test');
prod = require('./prod');

config = {
    'test': test,
    'dev': dev,
    'prod': prod
}

env = process.env.ENV_NAME || 'test';

module.exports = config[env];