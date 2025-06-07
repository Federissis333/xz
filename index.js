const { Client, Collection, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

client.commands = new Collection();

require('./src/handlers/commandHandler')(client);
require('./src/handlers/eventHandler')(client);

client.login('MTM4MTAzNDk2ODY2MjQwOTMwNg.Gw3JYp.V1_CJFMkTYVe27_7ZVA8gonPOBcoH5eLMBsDlc');