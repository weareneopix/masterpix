const {RtmClient, CLIENT_EVENTS, WebClient} = require('@slack/client');
const mastermind = require('./mastermind');
const {attemptToEmoji, formatInfo} = require('./string.helper');

// An access token (from your Slack app or custom integration - usually xoxb)
const token = process.env.SLACK_TOKEN;

// Cache of data
const appData = {};

// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
});

const web = new WebClient(token);
const channelListPromise = web.channels.list();

// The client will emit an RTM.AUTHENTICATED event on when the connection data is avaiable
// (before the connection is open)
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
    // Cache the data necessary for this app in memory
    appData.selfId = connectData.self.id;
    console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

// The client will emit an RTM.RTM_CONNECTION_OPEN the connection is ready for
// sending and receiving messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    channelListPromise
        .then(channelInfo => {
            const channels = channelInfo.channels.filter(x => x.is_member);
            channels.map(sendWelcomeMessage); // send greeting message to all subscribed channels
        });
    console.log(`Ready`);
});

let game = null;
let attemptNo = 0;

rtm.on(CLIENT_EVENTS.RTM.CONNECTING, () => console.log('Connecting...'));
rtm.on(CLIENT_EVENTS.RTM.WS_OPENING, () => console.log('Opening...'));
rtm.on(CLIENT_EVENTS.RTM.WS_OPENED, () => {
    console.log('Opened!');
});

rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, error => {
    console.error('ERROR');
    console.error(error);
});

rtm.on(CLIENT_EVENTS.RTM.RAW_MESSAGE, (event) => {
    // new message in a thread

    const eventJSON = JSON.parse(event);

    if (eventJSON.type === 'message') {
        if (eventJSON.subtype === 'message_changed') {
            if (game) {
                // game is on, so display proper message
                sendMessage(`I can't (at this point of my development) update your previous attempt. Please make a new one.`, eventJSON.channel, `Message edit.`);
            }
            return;
        } else if (eventJSON.subtype === 'message_replied') {
            return;
        }

        const text = eventJSON.text.trim().toLowerCase();
        if (text === 'start') {
            if (game == null) {
                game = mastermind.initState();
                sendMessage(`New game started! Possible symbols are ${Object.values(mastermind.symbols).join(', ')}. `, eventJSON.channel, `New game started on ${new Date()}.`);
            } else {
                sendMessage(`The game has already started`, eventJSON.channel, `New game attempted while running.`);
            }
        } else if (text === 'end' && game) {
            sendMessage(`The end state was ${game.join(' ')}`, eventJSON.channel, `Users gave up.`);
            game = null;
            attemptNo = 0;
        } else if (text === 'song') {
            sendSong(eventJSON.channel);
        } else {
            const regex = /(?:\s*(\:\w+\:)\s*)/g;
            match = regex.exec(text);
            const attempt = [];
            while (match != null) {
                attempt.push(match[0].trim());
                match = regex.exec(text);
            }
            if (attempt.length === 4 && attempt.every(mastermind.isSymbol)) {
                attemptNo++;
                const result = mastermind.attemptInfo(game, attempt);
                const msg = formatInfo(result.inPlaceCount, result.outOfPlaceCount, attemptNo);
                sendMessage(msg, eventJSON.channel, `attempt`);

                if (result.inPlaceCount === 4) {
                    sendMessage(`:tada: :tada: BRAVO!! :tada: :tada:`, eventJSON.channel, `bravo`);
                    sendMessage(`You've completed the game in ${attemptToEmoji(attemptNo)}.`, eventJSON.channel, `attempt info`);
                    game = null;
                    attemptNo = 0;

                    if (eventJSON.user === 'U44RYQQBG') {
                        sendSong(eventJSON.channel);
                    }
                }
            } else {
                // sendMessage('Idiot wut??', eventJSON.channel, `someone is haking us ${text}`)
            }
        }
    }
});

const sendMessage = (text, channel, logMessage) => {
    rtm.sendMessage(text, channel)
        .then(() => console.log(logMessage))
        .catch(e => console.log(e))
};

const sendWelcomeMessage = (channel) => {
    const greetingMessage = `Hello people of :neopix:! Let's play a game, shall we? Hit \`start\` whenever you are ready :smile:`;
    sendMessage(greetingMessage, channel.id, 'Greeting.');
};

const sendSong = (channelId) => {
    const song = `_Pomesaj ove noći crnu i zlatnu_
_Ispuni zahteve da zaradis platu_
_A radi dok ti klijent dise na vratu_
_Pa mozda negde doguram_
_Al' Neopiksu pripadam_
> :laza:`;
    sendMessage(song, channelId, 'Song');
};

// Start the connecting process
rtm.start();
