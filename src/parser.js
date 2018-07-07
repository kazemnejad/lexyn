/*
 *  The MIT License
 * 
 *  Copyright 2011 Greg.
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 * 
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 * 
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

fs = require('fs')

const grammer = require('./grammer')
const LRClosureTable = require('./lrclosuretable').LRClosureTable
const LRTable = require('./lrtable').LRTable
const CliTable = require('cli-table')
const LL1 = require('./ll1')

const colors = require('colors');

const {
    extend,
    resize,
    assertEquals,
    assertEquality,
    $,
    indexOfUsingEquals,
    addUniqueUsingEquals,
    isElementUsingEquals,
    addUnique,
    isElement,
    trimElements,
    getOrCreateArray,
    includeEachOtherUsingEquals,
    includesUsingEquals,
    includeEachOther,
    includes,
    newObject,
    EPSILON
} = require('./tools')

const Tree = require('./tree')
const chooseActionElement = require('./lrtable').chooseActionElement

/**
 * Use formatInitialParseView() to create a parse view before calling this function.
 */
function parseInput(lrTable, inputStr, maximumStepCount) {
    var stack = [0];

    function stateIndex() {
        return stack[2 * ((stack.length - 1) >> 1)];
    }

    inputStr = inputStr.trim().replace(/ /g, '')

    var tokens = (inputStr + '$').split('');
    var tokenIndex = 0;
    var token = tokens[tokenIndex];
    var state = lrTable.states[stateIndex()];
    var action = state[token];
    var actionElement = chooseActionElement(state, token);

    var rows = [
        [(1 + '').gray, formatStack(stack), formatInput(tokens, tokenIndex), formatAction(state, token, true)]
    ]
    var i = 2;

    while (i <= maximumStepCount && action != undefined && actionElement != 'r0') {
        if (actionElement.actionType == 's') {
            stack.push(tokens[tokenIndex++]);
            stack.push(parseInt(actionElement.actionValue));
        } else if (actionElement.actionType == 'r') {
            var ruleIndex = actionElement.actionValue;
            var rule = lrTable.grammar.rules[ruleIndex];
            var removeCount = isElement(EPSILON, rule.development) ? 0 : rule.development.length * 2;
            var removedElements = stack.splice(stack.length - removeCount, removeCount);
            var node = new Tree(rule.nonterminal, []);

            for (var j = 0; j < removedElements.length; j += 2) {
                node.children.push(removedElements[j]);
            }

            stack.push(node);
        } else {
            stack.push(parseInt(actionElement));
        }

        var state = lrTable.states[stateIndex()];
        var token = stack.length % 2 == 0 ? stack[stack.length - 1] : tokens[tokenIndex];
        action = state[token];
        actionElement = chooseActionElement(state, token);

        rows.push([(i + '').gray, formatStack(stack), formatInput(tokens, tokenIndex), formatAction(state, token, true)]);
        ++i;
    }

    const table = new CliTable({
        head: ['step', 'STACK', 'INPUT', 'ACTION']
    });
    table.push(...rows)

    return table.toString();
}

function formatStack(stack) {
    var result = stack.slice(0);

    for (var i = 0; i < result.length; i += 2) {
        result[i] = (result[i] + '').blue;
    }

    return result.join(' ');
}

function formatInput(tokens, tokenIndex) {
    return tokens.slice(tokenIndex).join(' ').yellow
}


function cleanGrammerText(grammer) {
    try {
        var lines = grammer.split('\n')
        var result = ''
        let rules = []
        for (let line of lines) {
            var parts = line.split('->')
            if (parts.length != 2)
                continue

            var left = parts[0].trim()
            var right = parts[1].trim().replace(/ /g, '')

            if (left == "S'" && right == 'S$')
                right = 'S'

            var rule = left + ' -> ' + right.split('').join(' ')
            rules.push(rule)
        }
        result = rules.join('\n').replace(/#/g, "''")
        return result
    } catch (e) {
        process.exit('Unable to read grammer')
    }
}

function formatLrTable(lr) {
    const g = lr.grammar
    const terms = g.terminals.concat(['$'].concat(g.nonterminals))

    const tableHead = ['#']
    for (let t of terms)
        tableHead.push(t)


    let rows = []
    for (let state of lr.states) {
        let row = [state.index]

        for (let t of terms) {
            row.push(formatAction(state, t))
        }

        rows.push(row)
    }

    const table = new CliTable({
        head: tableHead
    });

    table.push(...rows)

    return table.toString()
}

function formatAction(state, token, forceSingleAction) {
    let action = state[token]
    if (action === undefined)
        return ''

    if (forceSingleAction === undefined)
        forceSingleAction = false

    let result = ''
    if (action.length > 1 && !forceSingleAction) {
        actions = []
        for (let a of action)
            actions.push(a.toString())
        result = actions.join('/').yellow
    } else {
        result = action[0].toString()
        if (result == 'r0')
            result = 'acc'.green

        if (forceSingleAction && action[0].actionType == '')
            result = 'goto ' + result
    }

    return result
}

function renderParsingSteps(lr, input) {
    console.log()
    parseTable = parseInput(lr, input, 100)
    if (parseTable.search('acc') == -1)
        console.log('string not accepted!'.red)
    else {
        console.log('Parsing Steps'.cyan)
        console.log(parseTable)
        console.log('string accepted!'.green)
    }
}

function handleParsing(data, method, input) {
    var txt = cleanGrammerText(data)

    console.log('Grammer:'.yellow)
    console.log(txt.yellow)

    if (method == 'lr1')
        var Item = require('./lr1item')
    else if (method == 'slr1')
        var Item = require('./slritem')
    else if (method == 'lalr1')
        var Item = require('./lalr1item')
    else if (method == 'll1') {
        LL1.handleLl1(txt, input)
        process.exit(0)
    } else
        process.exit(0)

    let g = new grammer.Grammar(txt)
    let lrClosureTable = new LRClosureTable(g, Item);
    let lr = new LRTable(lrClosureTable);

    console.log('')
    console.log((Item.prototype.grammarType + ' Parse Table:').cyan)
    console.log(formatLrTable(lr))

    if (input !== undefined)
        renderParsingSteps(lr, input)

}

function parse(src, method, input) {
    fs.readFile(src, 'ascii', function (err, data) {
        if (err) {
            return console.log(err);
        }

        handleParsing(data, method, input)
    });
}

module.exports = {
    parse: parse
}