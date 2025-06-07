const { InteractionType } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    } else if (interaction.isButton()) {
      const command = client.commands.get('clearhelp');
      if (command && typeof command.handleButton === 'function') {
        await command.handleButton(interaction);
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const command = client.commands.get('clearhelp');
      if (command && typeof command.handleModal === 'function') {
        await command.handleModal(interaction);
      }
    }
  }
};
