const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

const client = new Client({
  checkUpdate: false,
});

const tokenFilePath = path.join(__dirname, 'token.txt');
const idFilePath = path.join(__dirname, 'id.json');

function getToken() {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const token = fs.readFileSync(tokenFilePath, 'utf-8').trim();
      if (!token) {
        console.error('❌ Token vazio no token.txt');
        process.exit(1);
      }
      return token;
    } else {
      console.error('❌ Arquivo token.txt não encontrado!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro ao ler token.txt:', error);
    process.exit(1);
  }
}

// Função para pegar o ID da pessoa cuja DM deve ser limpa com base no id.json
function getTargetIdFromJson(selfbotUserId) {
  try {
    if (fs.existsSync(idFilePath)) {
      const idMap = JSON.parse(fs.readFileSync(idFilePath, 'utf-8'));
      const targetId = idMap[selfbotUserId];
      if (targetId) return targetId;
      else {
        console.error(`❌ Nenhuma entrada no id.json para o ID ${selfbotUserId}`);
        return null;
      }
    } else {
      console.error('❌ Arquivo id.json não encontrado!');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao ler id.json:', error);
    return null;
  }
}

async function clearDMByUserId(userId) {
  try {
    const user = await client.users.fetch(userId);
    if (!user) {
      console.log('Usuário não encontrado.');
      return;
    }

    let dmChannel = user.dmChannel;
    if (!dmChannel) {
      dmChannel = await user.createDM();
    }

    const messages = await dmChannel.messages.fetch({ limit: 100 });
    const ownMessages = messages.filter(m => m.author.id === client.user.id);

    console.log(`🧹 Encontradas ${ownMessages.size} mensagens suas para deletar.`);

    for (const [msgId, message] of ownMessages) {
      await message.delete();
      console.log(`Mensagem ${msgId} deletada.`);
      await new Promise(r => setTimeout(r, 500)); // evita rate limit
    }

    console.log(`✅ Limpeza de DM com o usuário ${userId} concluída.`);
  } catch (err) {
    console.error('❌ Erro ao limpar DM:', err);
  }
}

client.on('ready', async () => {
  console.log(`${client.user.username} (selfbot) está pronto!`);

  const targetId = getTargetIdFromJson(client.user.id); // Aqui pegamos o destino pelo ID do selfbot
  if (targetId) {
    await clearDMByUserId(targetId);
  } else {
    console.log('⚠️ Nenhum ID disponível no JSON para limpar DM.');
  }
});

const token = getToken();
client.login(token);

// Exportável
module.exports = { client, clearDMByUserId };
