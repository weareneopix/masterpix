const IN_PLACE_SYMBOL = ':red_circle:';
const OUT_OF_PLACE_SYMBOL = ':large_blue_circle:';
const PADDING_SYMBOL = ':white_circle:';

const NUMBERS_EMOJI = {
    0: ':zero:',
    1: ':one:',
    2: ':two:',
    3: ':three:',
    4: ':four:',
    5: ':five:',
    6: ':six:',
    7: ':seven:',
    8: ':eight:',
    9: ':nine',
};

/**
 * Display attempt info in white, red and blue circles.
 * @param inPlace {number} Number of in-place correct symbols.
 * @param outOfPlace {number} Number of out-of-place symbols.
 * @param attemptNo {number} Number of attempt.
 * @return {string}
 */
const formatInfo = (inPlace, outOfPlace, attemptNo) => {
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
    return `${result.join('  ')}   ${attemptToEmoji(attemptNo)} `;
};

/**
 * Convert number to emoji string with a hash sign in front.
 * @param attemptNo {number}
 * @return {string}
 */
const attemptToEmoji = (attemptNo) => {
    const numbers = attemptNo.toString().split('');
    const emojis = numbers.map(n => NUMBERS_EMOJI[n]);
    return `:hash: ${emojis.join('')}`
};

module.exports = {
    attemptToEmoji,
    formatInfo,
};
