const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// Usa variabili di ambiente per sicurezza
const botToken = process.env.BOT_TOKEN;
const mongoURI = process.env.MONGO_URI;

const bot = new Telegraf(botToken);

// Connessione a MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connesso a MongoDB'))
  .catch((err) => console.error('Errore di connessione MongoDB:', err));

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  balance: { type: Number, default: 1000 },
});

const User = mongoose.model('User', userSchema);

// Funzione per ottenere il saldo dell'utente
const getUserBalance = async (userId) => {
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId });
    await user.save();
  }
  return user.balance;
};

// Funzione per aggiornare il saldo dell'utente
const updateUserBalance = async (userId, amount) => {
  const user = await User.findOne({ userId });
  if (user) {
    user.balance += amount;
    await user.save();
  }
};

// Funzione per visualizzare il saldo
const displayBalance = async (userId) => {
  const balance = await getUserBalance(userId);
  return `💰 Saldo: ${balance} crediti`;
};

// Comando di avvio
bot.start(async (ctx) => {
  try {
    ctx.reply('Benvenuto nel mio bot Telegram! Seleziona un gioco dal menu qui sotto:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Slot Machine', callback_data: 'slot' }],
          [{ text: 'Dadi', callback_data: 'dice' }],
          [{ text: 'Roulette', callback_data: 'roulette' }],
          [{ text: 'Blackjack', callback_data: 'blackjack' }],
          [{ text: 'Poker', callback_data: 'poker' }],
          [{ text: 'Bingo', callback_data: 'bingo' }],
          [{ text: 'Gratta e Vinci', callback_data: 'grattaevinci' }],
          [{ text: 'Keno', callback_data: 'keno' }],
          [{ text: 'Lotto', callback_data: 'lotto' }],
        ],
      },
    });

    // Visualizza saldo all'avvio
    ctx.reply(await displayBalance(ctx.from.id));
  } catch (err) {
    console.error('Errore nel comando start:', err);
  }
});

// Gestione dei comandi tramite bottoni inline
bot.on('callback_query', async (ctx) => {
  const game = ctx.callbackQuery.data;
  let resultMessage = '';
  let balanceMessage = await displayBalance(ctx.from.id);

  try {
    switch (game) {
      case 'slot':
        const slots = ['🍒', '🍋', '🍉', '🍊', '🍒', '🍉', '🍓'];
        const resultSlot = [
          slots[Math.floor(Math.random() * slots.length)],
          slots[Math.floor(Math.random() * slots.length)],
          slots[Math.floor(Math.random() * slots.length)],
        ];
        const slotWin = resultSlot[0] === resultSlot[1] && resultSlot[1] === resultSlot[2];
        if (slotWin) {
          await updateUserBalance(ctx.from.id, 500);
          resultMessage = `| ${resultSlot.join(' | ')} | Hai vinto 500 crediti! 🎉`;
        } else {
          await updateUserBalance(ctx.from.id, -100);
          resultMessage = `| ${resultSlot.join(' | ')} | Hai perso 100 crediti. 😞`;
        }
        break;

      case 'dice':
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const diceWin = diceRoll === 6;
        if (diceWin) {
          await updateUserBalance(ctx.from.id, 200);
          resultMessage = `Hai lanciato il dado e hai ottenuto: ${diceRoll}. Hai vinto 200 crediti! 🎉`;
        } else {
          await updateUserBalance(ctx.from.id, -50);
          resultMessage = `Hai lanciato il dado e hai ottenuto: ${diceRoll}. Hai perso 50 crediti. 😞`;
        }
        break;

      // Aggiungi logica per altri giochi qui...
      case 'roulette':
        const rouletteNumber = Math.floor(Math.random() * 37);
        const betNumber = Math.floor(Math.random() * 37);
        const rouletteWin = rouletteNumber === betNumber;
        if (rouletteWin) {
          await updateUserBalance(ctx.from.id, 1000);
          resultMessage = `La ruota ha fermato su: ${rouletteNumber}. Hai vinto 1000 crediti! 🎉`;
        } else {
          await updateUserBalance(ctx.from.id, -200);
          resultMessage = `La ruota ha fermato su: ${rouletteNumber}. Hai perso 200 crediti. 😞`;
        }
        break;
      // ...altri giochi
      default:
        resultMessage = "Scelta non valida!";
    }
  } catch (err) {
    console.error('Errore durante il gioco:', err);
    resultMessage = 'Si è verificato un errore durante il gioco. Riprova più tardi.';
  }

  // Risposta con risultato del gioco e saldo aggiornato
  ctx.answerCbQuery();
  ctx.reply(resultMessage);
  ctx.reply(balanceMessage);
});

// Comandi aggiuntivi per ricaricare e prelevare saldo
bot.command('ricarica', async (ctx) => {
  try {
    await updateUserBalance(ctx.from.id, 500);
    ctx.reply('Hai ricaricato il tuo saldo con 500 crediti! 💳');
  } catch (err) {
    console.error('Errore nel comando ricarica:', err);
    ctx.reply('Si è verificato un errore durante la ricarica. Riprova più tardi.');
  }
});

bot.command('preleva', async (ctx) => {
  try {
    await updateUserBalance(ctx.from.id, -200);
    ctx.reply('Hai prelevato 200 crediti! 💸');
  } catch (err) {
    console.error('Errore nel comando preleva:', err);
    ctx.reply('Si è verificato un errore durante il prelievo. Riprova più tardi.');
  }
});

// Gestione degli errori
bot.catch((err) => {
  console.error('Errore generico:', err);
});

// Avvio del bot
bot.launch();
console.log('Bot avviato e in ascolto...');
