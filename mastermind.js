/*
    
 */

const symbols = {
    A: ':hearts:',
    B: ':spades:',
    C: ':clubs:',
    D: ':diamonds:',
    E: ':neopix:',
    F: ':sparkles:',
};

/**
 * Check in place.
 * @param correct {string[]}
 * @param attempt {string[]}
 * @returns {{count: number, visited: boolean[]}}
 */
const checkInPlace = (correct, attempt) => {
    let count = 0;
    let visited = Array.from({length: correct.length}).fill(false);
    for (let i = 0; i < correct.length; i++) {
        if (correct[i] === attempt[i]) {
            count++;
            visited[i] = true;
        }
    }
    return {count, visited};
};

/**
 *
 * @param correct {string[]}
 * @param attempt {string[]}
 * @param attemptVisited {boolean[]}
 * @return {number}
 */
const checkOutOfPlace = (correct, attempt, attemptVisited) => {
    let count = 0;
    let correctVisited = [...attemptVisited];
    outer: for (let i = 0; i < attempt.length; i++) {
        if (!attemptVisited[i]) {
            for (let j = 0; j < correct.length; j++) {
                if (!correctVisited[j] && attempt[i] === correct[j]) {
                    count++;
                    correctVisited[j] = true;
                    continue outer;
                }
            }
        }
    }
    return count;
};

/**
 *
 * @param correct {string[]}
 * @param attempt {string[]}
 * @return {{inPlaceCount: number, outOfPlaceCount: number}}
 */
const attemptInfo = (correct, attempt) => {
    const {count: inPlaceCount, visited: attemptVisited} = checkInPlace(correct, attempt);
    const outOfPlaceCount = checkOutOfPlace(correct, attempt, attemptVisited);
    return {inPlaceCount, outOfPlaceCount};
};

const generateRandomNumber = (max, min = 0) => () => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

const initState = () => {
    const keys = Object.keys(symbols);
    const indices = Array.from({length: 4}).map(generateRandomNumber(keys.length));
    // const correct = indices.map(x => keys[x]);
    const emojis = indices.map(k => symbols[keys[k]]);
    return emojis;
};

const isSymbol = str => Object.values(symbols).some(s => s === str.trim());


module.exports = {
    attemptInfo,
    initState,
    isSymbol,
    symbols,
};
