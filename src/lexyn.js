#!/usr/bin/env node

const tokenize = require('./tokenizer').tokenize
const parse = require('./parser').parse

let guideMsg = `
Please specify input/output path

*** Guide ***

### Python Language Toknizer:
src/lexyn.js --tokenize --src path/to/src --dst path/to/dst

[example]:
src/lexyn.js --tokenize --src py_lex_test.txt --dst tmp.txt

### Parser:
src/lexyn.js --parse --method [lr1, lalr1, sl1, ll1] --src path/to/grammer

[example]:
src/lexyn.js --parse --method lalr1 --src grammer_lr.txt

### Parser & Parsing Steps:
src/lexyn.js --parse --method [lr1, lalr, sl1, ll1] --src path/to/grammer --input <some_text>

[example]:
src/lexyn.js --parse --method lalr --src grammer_lr.txt --input cdd
`

const optionDefinitions = [{
        name: 'tokenize',
        alias: 't',
        type: Boolean
    },
    {
        name: 'parse',
        alias: 'p',
        type: Boolean
    },
    {
        name: 'method',
        alias: 'm',
        type: String
    },
    {
        name: 'src',
        alias: 's',
        type: String,
    },
    {
        name: 'dst',
        alias: 'd',
        type: String,
    },
    {
        name: 'input',
        alias: 'i',
        type: String
    }
]

const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

if (options.tokenize === undefined && options.parse === undefined) {
    if (options.src === undefined || options.dst === undefined) {
        console.log(guideMsg)
        process.exit(0)
    }

    console.log('please specify your desired action')
    process.exit(0)
}

if (options.parse === true && options['method'] === undefined) {
    if (options.src === undefined) {
        console.log('please specify grammer path')
        process.exit(0)
    }

    console.log('please specify parsing method')
    process.exit(0)
}

if (options.tokenize) {
    tokenize(options.src, options.dst)
} else if (options.parse) {
    parse(options.src, options['method'], options.input)
}