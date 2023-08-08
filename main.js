/*
WhatsAppUtilitiesBot

A simple whatsapp bot offering very minimal features, made to play with whatsapp's
non-flexible and not-developer-friendly ecosystem.

This project may break anytime, given whatsapp changes their broken codes every now and then.

Please redistribute this file with the LICENSE file attached.

(c) @xditya <https://xditya.me>

--- LICENSE HEADER ---

Copyright 2023 xditya

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

console.info("Initializing...");

const wpClient = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./WP_SESSION",
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
    ],
  },
  ffmpegPath: "/usr/bin/ffmpeg",
});

wpClient.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

wpClient.on("authenticated", () => {
  console.log("Authenticated!");
});

wpClient.on("ready", async () => {
  console.log(
    `Client Started as ${wpClient.info.pushname}\nWhatsAppUtilitiesBot has started!\n(c) @xditya <https://xditya.me>`,
  );
  await wpClient.sendMessage(
    wpClient.info.me._serialized,
    "*WhatsAppUtilitiesBot* is now active on the current account!",
  );
});

const metaData = {
  name: "MySticker",
  author: "WhatsAppUtilitiesBot",
  categories: [],
};

wpClient.on("message", async (msg) => {
  if (msg.hasMedia) {
    if (msg.type == "document" && msg.body.toString().endsWith(".pdf")) {
      await msg.reply("Cannot convert PDF files to sticker!");
      return;
    }
    if (msg.type == "audio" || msg.type == "ptt") {
      await msg.reply("Cannot convert audio files to sticker!");
      return;
    }
    const media = await msg.downloadMedia();
    try {
      await wpClient.sendMessage(msg.from, media, {
        sendMediaAsSticker: true,
        stickerMetadata: metaData,
      });
    } catch (err) {
      console.error(err);
      await msg.reply("Error while sending sticker");
    }
  }
  if (msg.body == "!help") {
    await msg.reply(`
*Hey ${msg._data.notifyName}, congrats on discovering the help menu 🎉*

*Here are the available commands/functions:*
- \`\`\`!help\`\`\` - Displays this help menu.
- \`\`\`!about\`\`\` - Displays information about the bot.
- Send any media file to convert it to a sticker!

*Made with ❤️ by xditya.me*
`);
  } else if (msg.body == "!about") {
    await msg.reply(`
*WhatsAppUtilities Bot*

Just a random project idea. Developed by xditya.me.
For all features, send \`\`\`!help\`\`\`.

You can view the source at https://github.com/xditya/WhatsAppUtilitiesBot.

_User-Privacy-First_: This bot does not store any data, and all the data is stored locally on your device.

Give Suggesstions/features: https://BotzHub.t.me/277 or email me at \`\`\`me@xditya.me\`\`\`
`);
  }
});

console.info("Waiting for QR...");
wpClient.initialize();
