const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// Inserisci il tuo token qui
const bot = new Telegraf('7669146887:AAE5DWLbqAS_T_nyz4J5z-sjWh8rmyG9q1E');

// Connessione a MongoDB
mongoose.connect('mongodb+srv://giggin645:743PSAgAGTnjtGMa@gxac21r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
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
});

// Gestione dei comandi tramite bottoni inline
bot.on('callback_query', async (ctx) => {
  const game = ctx.callbackQuery.data;
  let resultMessage = '';
  let balanceMessage = await displayBalance(ctx.from.id);

  // Logica dei giochi
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
        await updateUserBalance(ctx.from.id, 500); // Guadagno di 500 crediti
        resultMessage = `| ${resultSlot.join(' | ')} | Hai vinto 500 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -100); // Perdita di 100 crediti
        resultMessage = `| ${resultSlot.join(' | ')} | Hai perso 100 crediti. 😞`;
      }
      break;

    case 'dice':
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      const diceWin = diceRoll === 6;
      if (diceWin) {
        await updateUserBalance(ctx.from.id, 200); // Guadagno di 200 crediti
        resultMessage = `Hai lanciato il dado e hai ottenuto: ${diceRoll}. Hai vinto 200 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -50); // Perdita di 50 crediti
        resultMessage = `Hai lanciato il dado e hai ottenuto: ${diceRoll}. Hai perso 50 crediti. 😞`;
      }
      break;

    // Aggiungi logica per altri giochi qui...
    case 'roulette':
      const rouletteNumber = Math.floor(Math.random() * 37);
      const betNumber = Math.floor(Math.random() * 37); // Simulazione di una scommessa
      const rouletteWin = rouletteNumber === betNumber;
      if (rouletteWin) {
        await updateUserBalance(ctx.from.id, 1000); // Guadagno di 1000 crediti
        resultMessage = `La ruota ha fermato su: ${rouletteNumber}. Hai vinto 1000 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -200); // Perdita di 200 crediti
        resultMessage = `La ruota ha fermato su: ${rouletteNumber}. Hai perso 200 crediti. 😞`;
      }
      break;
    case 'blackjack': 
      const blackjackCards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
      const playerCard = blackjackCards[Math.floor(Math.random() * blackjackCards.length)];
      const dealerCard = blackjackCards[Math.floor(Math.random() * blackjackCards.length)];
      const playerValue = typeof playerCard === 'number' ? playerCard : (playerCard === 'A' ? 11 : 10);
      const dealerValue = typeof dealerCard === 'number' ? dealerCard : (dealerCard === 'A' ? 11 : 10);
      if (playerValue > dealerValue) {
        await updateUserBalance(ctx.from.id, 300); // Guadagno di 300 crediti
        resultMessage = `Hai pescato: ${playerCard}. Il banco ha: ${dealerCard}. Hai vinto 300 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -100); // Perdita di 100 crediti
        resultMessage = `Hai pescato: ${playerCard}. Il banco ha: ${dealerCard}. Hai perso 100 crediti. 😞`;
      }
      break;  
    case 'poker':
      const pokerCards = ['♠', '♥', '♦', '♣'];
      const playerPokerCard = pokerCards[Math.floor(Math.random() * pokerCards.length)];
      const dealerPokerCard = pokerCards[Math.floor(Math.random() * pokerCards.length)];
      if (playerPokerCard === dealerPokerCard) {
        await updateUserBalance(ctx.from.id, 400); // Guadagno di 400 crediti
        resultMessage = `Hai pescato: ${playerPokerCard}. Il banco ha: ${dealerPokerCard}. Hai vinto 400 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -150); // Perdita di 150 crediti
        resultMessage = `Hai pescato: ${playerPokerCard}. Il banco ha: ${dealerPokerCard}. Hai perso 150 crediti. 😞`;
      }
      break;  
    case 'bingo':
      const bingoNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      const drawnNumber = bingoNumbers[Math.floor(Math.random() * bingoNumbers.length)];
      const bingoWin = drawnNumber % 2 === 0; // Simulazione di vincita
      if (bingoWin) {
        await updateUserBalance(ctx.from.id, 600); // Guadagno di 600 crediti
        resultMessage = `Numero estratto: ${drawnNumber}. Hai vinto 600 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -250); // Perdita di 250 crediti
        resultMessage = `Numero estratto: ${drawnNumber}. Hai perso 250 crediti. 😞`;
      }
      break;
    case 'grattaevinci':
      const scratchCardResult = Math.random() < 0.5; // 50% di probabilità di vincere
      if (scratchCardResult) {
        await updateUserBalance(ctx.from.id, 700); // Guadagno di 700 crediti
        resultMessage = `Hai grattato e hai vinto 700 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -300); // Perdita di 300 crediti
        resultMessage = `Hai grattato e hai perso 300 crediti. 😞`;
      }
      break;    
    case 'keno':
      const kenoNumbers = Array.from({ length: 80 }, (_, i) => i + 1);
      const drawnKenoNumber = kenoNumbers[Math.floor(Math.random() * kenoNumbers.length)];
      const kenoWin = drawnKenoNumber % 3 === 0; // Simulazione di vincita
      if (kenoWin) {
        await updateUserBalance(ctx.from.id, 800); // Guadagno di 800 crediti
        resultMessage = `Numero estratto: ${drawnKenoNumber}. Hai vinto 800 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -350); // Perdita di 350 crediti
        resultMessage = `Numero estratto: ${drawnKenoNumber}. Hai perso 350 crediti. 😞`;
      }
      break;
    case 'lotto':
      const lottoNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      const drawnLottoNumber = lottoNumbers[Math.floor(Math.random() * lottoNumbers.length)];
      const lottoWin = drawnLottoNumber % 5 === 0; // Simulazione di vincita
      if (lottoWin) {
        await updateUserBalance(ctx.from.id, 900); // Guadagno di 900 crediti
        resultMessage = `Numero estratto: ${drawnLottoNumber}. Hai vinto 900 crediti! 🎉`;
      } else {
        await updateUserBalance(ctx.from.id, -400); // Perdita di 400 crediti
        resultMessage = `Numero estratto: ${drawnLottoNumber}. Hai perso 400 crediti. 😞`;
      }
      break;
    case 'exit':
      resultMessage = "Grazie per aver giocato! Arrivederci! 👋";
      break;

    default:
      resultMessage = "Scelta non valida!";
  }

  // Risposta con risultato del gioco e saldo aggiornato
  ctx.answerCbQuery();
  ctx.reply(resultMessage);
  ctx.reply(balanceMessage);
});

// Comandi aggiuntivi per ricaricare e prelevare saldo
bot.command('ricarica', async (ctx) => {
  // Aggiungi crediti all'utente (esempio 500 crediti)
  await updateUserBalance(ctx.from.id, 500);
  ctx.reply('Hai ricaricato il tuo saldo con 500 crediti! 💳');
});

bot.command('preleva', async (ctx) => {
  // Preleva crediti dall'utente (esempio 200 crediti)
  await updateUserBalance(ctx.from.id, -200);
  ctx.reply('Hai prelevato 200 crediti! 💸');
});

// Gestione degli errori
bot.catch((err) => {
  console.error('Errore:', err);
});

// Avvio del bot
bot.launch();
console.log('Bot avviato e in ascolto...');
// Gestione della chiusura del bot