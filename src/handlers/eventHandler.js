const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
  }
};
