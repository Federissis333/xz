const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const tokenFilePath = path.join(__dirname, '../../self/token.txt');
const idFilePath = path.join(__dirname, '../../self/id.json');

const userData = new Map();

module.exports = {
  name: 'clearhelp',
  description: 'Painel com botões para configurar Token, ID e limpar DM.',

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Painel de Configuração')
      .setDescription('Configure Token, ID e Limpar DM.\nLimpar DM só funciona após configurar Token e ID.')
      .setImage('https://i.imgur.com/S61CRkg.png')
      .setColor('DarkGrey');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('config_token')
        .setLabel('Config Token')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('config_id')
        .setLabel('ID')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('clear_dm')
        .setLabel('Limpar DM')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [buttons], flags: 1 << 6 });
  },

  async handleButton(interaction) {
    const userId = interaction.user.id;
    if (!userData.has(userId)) userData.set(userId, { token: null, id: null });

    const data = userData.get(userId);

    if (interaction.customId === 'config_token') {
      const modal = new ModalBuilder()
        .setCustomId('modal_token')
        .setTitle('Informe o Token');

      const tokenInput = new TextInputBuilder()
        .setCustomId('token_input')
        .setLabel('Token')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Digite seu token aqui...')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(tokenInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } else if (interaction.customId === 'config_id') {
      const modal = new ModalBuilder()
        .setCustomId('modal_id')
        .setTitle('Informe o ID para limpar');

      const idInput = new TextInputBuilder()
        .setCustomId('id_input')
        .setLabel('ID da pessoa')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Digite o ID aqui...')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(idInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } else if (interaction.customId === 'clear_dm') {
      if (!fs.existsSync(tokenFilePath) || !fs.existsSync(idFilePath)) {
        await interaction.reply({ content: '❌ Configure Token e ID antes de limpar a DM.', flags: 1 << 6 });
        return;
      }

      await interaction.reply({ content: '🧹 Limpando DM... Isso pode levar alguns segundos.', flags: 1 << 6 });

      const selfbotPath = path.join(__dirname, '../../self/selfbot.js');
      const process = spawn('node', [selfbotPath]);

      process.stdout.on('data', (data) => {
        console.log(`[selfbot] ${data}`);

        if (data.toString().includes('Limpeza de DM com o usuário')) {
          interaction.followUp({ content: '✅ DM limpa com sucesso!', flags: 1 << 6 });
        }
      });

      process.stderr.on('data', (data) => {
        console.error(`[selfbot-erro] ${data}`);
      });

      process.on('close', (code) => {
        console.log(`[selfbot] finalizado com código ${code}`);
      });
    } else {
      await interaction.reply({ content: 'Botão desconhecido.', flags: 1 << 6 });
    }

    userData.set(userId, data);
  },

  async handleModal(interaction) {
    if (interaction.type !== InteractionType.ModalSubmit) return;

    const userId = interaction.user.id;
    if (!userData.has(userId)) userData.set(userId, { token: null, id: null });
    const data = userData.get(userId);

    if (interaction.customId === 'modal_token') {
      const token = interaction.fields.getTextInputValue('token_input');

      try {
        fs.writeFileSync(tokenFilePath, token, 'utf-8');
      } catch (err) {
        console.error('Erro ao salvar token no arquivo:', err);
        await interaction.reply({ content: '❌ Erro ao salvar o token.', flags: 1 << 6 });
        return;
      }

      data.token = token;
      await interaction.reply({ content: '✅ Token salvo com sucesso!', flags: 1 << 6 });
    }

    if (interaction.customId === 'modal_id') {
      const id = interaction.fields.getTextInputValue('id_input');

      let idMap = {};
      try {
        const fileContent = fs.readFileSync(idFilePath, 'utf-8').trim();
        idMap = fileContent ? JSON.parse(fileContent) : {};
      } catch (err) {
        console.error('Erro ao ler id.json:', err);
        idMap = {};
      }

      idMap[userId] = id;

      try {
        fs.writeFileSync(idFilePath, JSON.stringify(idMap, null, 2));
      } catch (err) {
        console.error('Erro ao salvar id.json:', err);
        await interaction.reply({ content: '❌ Erro ao salvar o ID.', flags: 1 << 6 });
        return;
      }

      data.id = id;
      await interaction.reply({ content: `✅ ID salvo: \`${id}\``, flags: 1 << 6 });
    }

    userData.set(userId, data);
  }
};
