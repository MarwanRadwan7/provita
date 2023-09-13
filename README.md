# provita

[![Version][version-shield]](version-url)
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

<center><img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=PROVITA&fontSize=80&fontAlignY=35&animation=twinkling&fontColor=gradient" /></center>

<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://github.com/MarwanRadwan7/provita">
    <img src="https://cdn.discordapp.com/attachments/1136037893236850690/1136267805528969216/Provita_Logo.png" style="border-radius:50%" alt="Provita" width="200" height="200">
  </a>

  <h3 align="center">PROVITA</h3>

  <p align="center">
    Provita is a simple discord bot that helps you focus and relax to study with your friends powered with AI by the unofficial <a href="https://github.com/EvanZhouDev/bard-ai">Bard API</a> for giving you and your server useful answers and providing useful commands like playing quran, Lofi and background noise.
    <br />
    <br />
    <a href="https://github.com/MarwanRadwan7/provita/issues">Report Bug</a>
    ·
    <a href="https://github.com/MarwanRadwan7/provita/issues">Request Feature</a>
    <br>
    <br>
  <a href = "https://discord.com/api/oauth2/authorize?client_id=1127302961660436582&permissions=8&scope=bot%20applications.commands">
  <img src="https://cdn.discordapp.com/attachments/1096186206615785525/1136361183679610990/image0.jpg" width="50%" height="50%">
  </a>
  </p>
</p>

<!-- NOTICE -->

### <img src="https://cdn.discordapp.com/emojis/1055803759831294013.png" width="20px" height="20px"> 》Notice

> Provita is a multipurpose Discord bot base in [Discord.js](https://github.com/Discordjs/discordjs)
> If you like this repository, feel free to leave a star ⭐ to motivate me!

<!-- ABOUT THE PROJECT -->

## <img src="https://cdn.discordapp.com/emojis/852881450667081728.gif" width="20px" height="20px">》Features

- [x] Come with Discord.js v13
- [x] Slash Commands
- [x] Media Commands

## <img src="https://cdn.discordapp.com/emojis/859424401186095114.png" width="20px" height="20px">》Slash Commands

- `/help` -> List all bot 's commands and their description.
- `/chat "question"` -> Ask the AI questions.
- `/quran "sheikh" "surrah"` -> Plays Holy QURAN.
- `/lofi "keywords"` -> Plays LoFi music.
- `/noise "genre"` -> Play this background noise helps you to focus.
- `/pause` -> Toggle to pause/resume currently playing audio.
- `/next` -> Skip currently playing audio.
- `/queue` -> The list of current queue.
- `/shuffle` -> shuffles queue.
- `/stop` -> Clears queue completely and disconnects the bot.

## <img src="https://cdn.discordapp.com/emojis/1009754836314628146.gif" width="25px" height="25px">》Requirements

- NodeJs v16+
- Discord.js v13 [Discord.js Docs](https://old.discordjs.dev/#/docs/discord.js/v13/general/welcome).
- DisTube package v3.3.4. [Docs](https://distube.js.org/#/docs/DisTube/v3/general/welcome)
- libsodium-wrappers package. [Package link](https://www.npmjs.com/package/libsodium-wrappers)
- Discord Token. Get it from [Discord Developers Portal](https://discord.com/developers/applications)
- Mongo Database URL. Get it from [MongoDB](https://cloud.mongodb.com/v2/635277bf9f5c7b5620db28a4#clusters)
- FFMPEG installed. [Link](https://www.ffmpeg.org/download.html)

## <img src="https://cdn.discordapp.com/emojis/814216203466965052.png" width="25px" height="25px">》Installation Guide

### <img src="https://cdn.discordapp.com/emojis/1028680849195020308.png" width="15px" height="15px"> Installing via [NPM](https://www.npmjs.com/)

Clone the repo by running

```bash
git clone https://github.com/MarwanRadwan7/provita.git
```

### After cloning Fill all requirement in `.env`, then run.

```bash
npm install
```

To start your bot

```js
node index.js
```

To start your bot in development mode

```js
npm run devStart index
```

## <img src="https://cdn.discordapp.com/emojis/859424401186095114.png" width="20px" height="20px">》Technical Documentation

### The project structure:

```plaintext
Provita/
├── commands/
│   ├── ask.js
│   └── ... (other command handlers)
├── events/
│   ├── ask.js
│   └── ... (other event handlers)
├── utils/
│   ├── mongoConnection.js
│   └── ... (other helper functions)
├── models/
│   ├── userSession.js
│   └── GuildChannel.js
├── apis/
│   └── bardAPI.js
├── package.json
├── index.js
├── .env
└── .gitignore
```

#### The `.env` file should look like this:

```env
DISCORD_TOKEN = Your bot Token
CLIENT_ID = Client ID
GUILD_ID  = Your Server ID
BARD_KEY  = `__Secure-1PSID` Cookie
ENV = DEVELOPMENT
MONGO_URL = Your MongoDB URL connection
```

## <img src="https://cdn.discordapp.com/emojis/1028680849195020308.png" width="25px" height="25px">》To-Do

- [x] Host the bot.
- [ ] More /commands
- [ ] Upgrade the Ai-API and move to palm api.

## <img src="https://cdn.discordapp.com/emojis/1036083490292244493.png" width="15px" height="15px">》Support Me

<p align = "center"><p>If you liked this repository, feel free to leave a star and support me on BMC. 😊
</p>
<a  href="https://www.buymeacoffee.com/marwan.swe" target="_blank" > 
<img src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-3.svg" alt="SVG Image">
</a>
</p>

[version-shield]: https://img.shields.io/github/package-json/v/MarwanRadwan7/provita?style=for-the-badge
[version-url]: https://github.com/MarwanRadwan7/provita
[contributors-shield]: https://img.shields.io/github/contributors/MarwanRadwan7/provita.svg?style=for-the-badge
[contributors-url]: https://github.com/MarwanRadwan7/provita/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MarwanRadwan7/provita.svg?style=for-the-badge
[forks-url]: https://github.com/MarwanRadwan7/provita/forks
[stars-shield]: https://img.shields.io/github/stars/MarwanRadwan7/provita.svg?style=for-the-badge
[stars-url]: https://github.com/MarwanRadwan7/provita/stargazers
[issues-shield]: https://img.shields.io/github/issues/MarwanRadwan7/provita.svg?style=for-the-badge
[issues-url]: https://github.com/MarwanRadwan7/provita/issues
[license-shield]: https://img.shields.io/github/license/MarwanRadwan7/provita.svg?style=for-the-badge
[license-url]: https://github.com/MarwanRadwan7/provita/blob/main/LICENSE
