const {RtmClient, CLIENT_EVENTS, WebClient} = require('@slack/client');
const mastermind = require('./mastermind');

const IN_PLACE_SYMBOL = ':red_circle:';
const OUT_OF_PLACE_SYMBOL = ':large_blue_circle:';
const PADDING_SYMBOL = ':white_circle:';

const formatInfo = (inPlace, outOfPlace) => {
    let inPlaceLeft = inPlace;
    let outOfPlaceLeft = outOfPlace;
    const result = [PADDING_SYMBOL, PADDING_SYMBOL, PADDING_SYMBOL, PADDING_SYMBOL];
    for (let i = 0; i < result.length; i++) {
        if (inPlaceLeft > 0) {
            result[i] = IN_PLACE_SYMBOL;
            inPlaceLeft--;
        } else if (outOfPlaceLeft > 0) {
            result[i] = OUT_OF_PLACE_SYMBOL;
            outOfPlaceLeft--;
        }
    }
    return result.join('  ');
};

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
// sending and recieving messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPEN, () => {
    console.log(`Ready`);
});

let game = null;

rtm.on('connecting', () => console.log('Connecting...'));
rtm.on('ws_opening', () => console.log('Opening...'));
rtm.on('ws_opened', () => {
    console.log('Opened!');
});


rtm.on('ws_error', error => {
    console.error('ERROR');
    console.error(error);
});

rtm.on('raw_message', (event) => {
    const eventJSON = JSON.parse(event);
    if (eventJSON.type === 'message') {
        const text = eventJSON.text.trim().toLowerCase();
        if (text === 'start') {
            if (game == null) {
                game = mastermind.initState();
                sendMessage(`New game started! Possible symbols are ${Object.values(mastermind.symbols).join(', ')}. `, eventJSON.channel, `New game started on ${new Date()}.`);
            } else {
                sendMessage(`The game has already started`, eventJSON.channel, `New game attempted while running.`);
            }
        } else if (text === 'end') {
            sendMessage(`The end state was ${game.join(' ')}`, eventJSON.channel, `Users gave up.`);
            game = null;
        } else {
            const regex = /(?:\s*(\:\w+\:)\s*)/g;
            match = regex.exec(text);
            const attempt = [];
            while (match != null) {
                attempt.push(match[0].trim());
                match = regex.exec(text);
            }
            if (attempt.length === 4 && attempt.every(mastermind.isSymbol)) {
                const result = mastermind.attemptInfo(game, attempt);
                const msg = formatInfo(result.inPlaceCount, result.outOfPlaceCount);
                sendMessage(msg, eventJSON.channel, `attempt`);

                if (result.inPlaceCount === 4) {
                    sendMessage(`:tada: :tada: BRAVO!! :tada: :tada:`, eventJSON.channel, `bravo`);
                    game = null
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

// Start the connecting process
rtm.start();
