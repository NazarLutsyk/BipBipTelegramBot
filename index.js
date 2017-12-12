const TelegramBot = require('node-telegram-bot-api');
const events = require("events");
const fs = require("fs");
const mongoose = require("mongoose");
let Pib = require("./model/Pib");
mongoose.connect('mongodb://localhost/bot', {useMongoClient: true});
mongoose.Promise = global.Promise;
const eventEmitter = new events.EventEmitter();

const token = '438346675:AAF2EOws9mWA1pKY8hdZ_IlN_jcW-ILaG6c';

const bot = new TelegramBot(token, {polling: true});

let field = "";
let pib = new Pib();

bot.onText(/\/save (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const message_id = msg.message_id;
    const from_id = msg.from.id;
    pib.chat_id = chatId;
    pib.from_id = from_id;
    pib.text = match[1];

    bot.sendMessage(msg.chat.id, "Message recieved!\nPlease enter date:");
    field = "date";
});
bot.onText(/\/find/, (msg, match) => {
    Pib.find({from_id : msg.from.id}, "_id text date", function (err, docs) {
        if (!err)
            if (docs.length <= 0) {
                bot.sendMessage(msg.chat.id, `Bips is empty`);
            } else
                for (let i = 0; i < docs.length; i++) {
                    let doc = docs[i];
                    bot.sendMessage(msg.chat.id, `ID: ${doc.id}\nText: ${doc.text}\nDate:${doc.date}`);
                }
        else {
            console.log(err);
        }
    });
});
bot.onText(/\/delete (.+)/, (msg, match) => {
    Pib.findByIdAndRemove(match[1], function (err) {
        if (!err)
            bot.sendMessage(msg.chat.id, match[1] + " was deleted");
    });
});
bot.onText(/\/start/, function (msg, match) {
    fs.readFile("C:\\Users\\nazik\\Pictures\\cat-art-funny-1.jpg",function (err,file) {
        bot.sendPhoto(msg.chat.id,file);
    });
    bot.send
    bot.sendMessage(msg.chat.id, "Hello mutherfucker!");
    bot.sendMessage(msg.chat.id, "write /help");

});

bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, "/save <text> - save bip, after this command " +
        "enter date in format(yyyy-MM-dd HH:MM)\n" +
        "/delete <id> - delete bip\n" +
        "/find - find all bips")
});

bot.on("message", function (msg, match) {
    switch (field) {
        case "date": {
            let date = new Date(msg.text);
            if (date != "Invalid Date") {
                date.setUTCHours(date.getUTCHours() + 2);
                pib.date = date;
                pib.save(function (err) {
                    if (err) {
                        console.log(err);
                        bot.sendMessage(msg.chat.id, "Some error");
                    }
                    bot.sendMessage(msg.chat.id, "Pib saved");
                });
                pib = new Pib();
                field = "";
            } else {
                bot.sendMessage(msg.chat.id, "Please enter normal date!(YYYY-mm-dd HH:MM)");
            }
            break;
        }
        default:
            field = "";
    }
});

(function () {
    let interval = setInterval(function () {
        let date = new Date();
        date.setUTCHours(date.getUTCHours() + 2);
        let query = Pib.find({
            checked: false,
            date: {
                $lte: date
            }}, function (err, docs) {
            if (err)
                console.log(err);
            else
                for (let i = 0; i < docs.length; i++) {
                    let doc = docs[i];
                    doc.checked = true;
                    doc.save();
                    bot.sendMessage(doc.chat_id, "You may todo: " + doc.text + "\nOn:" + doc.date);
                }
        });
    }, 1000 * 60);
})();
