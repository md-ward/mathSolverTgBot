const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  webHook: {
    port: process.env.PORT || 3000,
  }
  // polling: true
});
// Function to solve math expressions
function solveMathExpression(expression) {
  try {
    const result = math.evaluate(expression);
    return result;
  } catch (error) {
    throw new Error('Invalid math expression');
  }
}
var operation = '';

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `Welcome to the Math Bot! You can send me math expressions, and I will solve them for you.
  \n avilable commands :  
  \n- Square root: /sqrt
  \n- Logarithm: /log
  \n- Exponentiation: /pow
  \n- Factorial: /factorial
  \n or just type your own expression make sure to use ( ) for correct results.
  .`;
  bot.sendMessage(chatId, welcomeMessage);
});

// Handle /sqrt command
bot.onText(/\/sqrt/, (msg) => {
  const chatId = msg.chat.id;
  const requestMessage = `Enter the number to calculate its square root (sqrt):`;
  operation = 'sqrt';
  bot.sendMessage(chatId, requestMessage);
});

// Handle /log command
bot.onText(/\/log/, (msg) => {
  const chatId = msg.chat.id;
  operation = 'log';

  const requestMessage = `Enter the number to calculate its logarithm (base 10):`;
  bot.sendMessage(chatId, requestMessage);
});


// Handle /ln command
bot.onText(/\/ln/, (msg) => {
  const chatId = msg.chat.id;
  operation = 'ln';
  const requestMessage = `Enter the number to calculate its natural logarithm (base 2):`;
  bot.sendMessage(chatId, requestMessage);
});

// Handle /pow command
bot.onText(/\/pow/, (msg) => {
  const chatId = msg.chat.id;
  operation = 'pow';
  const requestMessage = `Enter the base and exponent, separated by a comma (e.g., 2, 3):`;
  bot.sendMessage(chatId, requestMessage);
});

// Handle /factorial command
bot.onText(/\/factorial/, (msg) => {
  const chatId = msg.chat.id;
  operation = 'factorial';
  const requestMessage = `Enter a number to calculate its factorial:`;
  bot.sendMessage(chatId, requestMessage);
});
// Handle incoming messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start' || messageText === '/sqrt' || messageText === '/log' || messageText === '/ln' || messageText === '/pow' || messageText === '/factorial') {
    // Ignore commands handled separately
    return;
  }

  // Handle the message and perform math calculations
  try {
    switch (operation) {
      case 'sqrt':
        const sqrtNumber = parseFloat(messageText);
        if (!isNaN(sqrtNumber)) {
          const sqrtResult = Math.sqrt(sqrtNumber);
          bot.sendMessage(chatId, `The square root of ${sqrtNumber} is: ${sqrtResult}`);
          operation = ''
        } else {
          bot.sendMessage(chatId, 'Please provide a valid number for square root calculation.');
        }
        break;
      case 'log':
        const logNumber = parseFloat(messageText);
        if (!isNaN(logNumber)) {
          const logResult = Math.log10(logNumber);

          bot.sendMessage(chatId, `The logarithm (base 10) of ${logNumber} is: ${logResult}`);
          operation = ''
        } else {
          bot.sendMessage(chatId, 'Please provide a valid number for logarithm calculation.');
        }
        break;
      case 'ln':
        const lnNumber = parseFloat(messageText);
        if (!isNaN(lnNumber)) {
          const lnResult = Math.log2(lnNumber);

          bot.sendMessage(chatId, `The logarithm (base 2) of ${lnNumber} is: ${lnResult}`);
          operation = ''
        } else {
          bot.sendMessage(chatId, 'Please provide a valid number for logarithm calculation.');
        }
        break;

      case 'pow':
        const [base, exponent] = messageText.split(',').map(parseFloat);
        if (!isNaN(base) && !isNaN(exponent)) {
          const powResult = math.pow(base, exponent);
          bot.sendMessage(chatId, `The result of ${base} raised to the power of ${exponent} is: ${powResult}`);
          operation = '';
        } else {
          bot.sendMessage(chatId, 'Please provide valid numbers for the base and exponent.');
        }
        break;

      case 'factorial':
        const number = parseFloat(messageText);
        if (!isNaN(number) && Number.isInteger(number) && number >= 0) {
          const factorialResult = math.factorial(number);
          bot.sendMessage(chatId, `The factorial of ${number} is: ${factorialResult}`);
          operation = '';
        } else {
          bot.sendMessage(chatId, 'Please provide a non-negative integer for factorial calculation.');
        }
        break;


      default:
        const result = solveMathExpression(messageText);
        bot.sendMessage(chatId, `The result is: ${result}`);
        break;
    }
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Sorry, I was unable to solve the math expression.');
  }
});

app.use(bodyParser)
app.get(`${process.env.CYCLIC_URL}/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
  console.log(req.body)
});

// Set up the webhook
bot.setWebHook(`${process.env.CYCLIC_URL}/bot${process.env.BOT_TOKEN}`);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
