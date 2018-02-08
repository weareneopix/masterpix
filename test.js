const mastermind = require('./mastermind')

const tests = [
    ['ABCD', 'BBAE', 1, 1],
    ['ABAC', 'BBAA', 2, 1],
    ['AAAA', 'AAAA', 4, 0],
    ['ABCD', 'DCBA', 0, 4],
    ['AABC', 'BCAA', 0, 4],
    ['ABCD', 'CBAD', 2, 2],
    ['ABCD', 'ABBE', 2, 0],
    ['AAAA', 'BBBB', 0, 0],
]

tests.forEach(test => {
    const correct = test[0].split('')
    const attempt = test[1].split('')
    const expected = {
        inPlaceCount: test[2],
        outOfPlaceCount: test[3],
    }

    const actual = mastermind.attemptInfo(correct, attempt)

    if (expected.outOfPlaceCount === actual.outOfPlaceCount && expected.inPlaceCount === actual.inPlaceCount) {
        console.log('OK')
    } else {
        console.log('=====')
        console.log('Fail')
        console.log(correct, '     ', attempt)
        console.log('Expected: ', expected.inPlaceCount, expected.outOfPlaceCount)
        console.log('Actual:   ', actual.inPlaceCount, actual.outOfPlaceCount)
        console.log('=====')
    }

})
