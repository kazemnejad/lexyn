const CliTable = require('cli-table')

function $(id) {
	return document.getElementById(id);
}

var EPSILON = '\'\'';

var alphabet;
var nonterminals;
var terminals;
var rules;
var firsts;
var follows;
var ruleTable;

function createLl1Table(txt) {

	rules = txt.split('\n');
	alphabet = [];
	nonterminals = [];
	terminals = [];

	collectAlphabetAndNonterminalsAndTerminals();
	collectFirsts();
	collectFollows();
	makeRuleTable();
}

function makeRuleTable() {
	ruleTable = new Object();

	for (var i in rules) {
		var rule = rules[i].trim().split('->');

		if (rule.length < 2) {
			continue;
		}

		var nonterminal = rule[0].trim();
		var development = trimElements(rule[1].trim().split(' '));

		var developmentFirsts = collectFirsts3(development);

		for (var j in developmentFirsts) {
			var symbol = developmentFirsts[j];

			if (symbol != EPSILON) {
				if (ruleTable[nonterminal] == undefined) {
					ruleTable[nonterminal] = new Object();
				}

				var oldTableRule = ruleTable[nonterminal][symbol];

				if (oldTableRule == undefined) {
					ruleTable[nonterminal][symbol] = rules[i].trim();
				} else {
					let oldRules = {}
					for (let r of oldTableRule.split('\n'))
						oldRules[r.trim()] = true

					if (oldRules[rules[i].trim()] === undefined)
						ruleTable[nonterminal][symbol] = oldTableRule + "\n" + rules[i].trim();
				}
			} else {
				for (var j in follows[nonterminal]) {
					var symbol2 = follows[nonterminal][j];

					if (ruleTable[nonterminal] == undefined) {
						ruleTable[nonterminal] = new Object();
					}

					var oldTableRule = ruleTable[nonterminal][symbol2];

					if (oldTableRule == undefined) {
						ruleTable[nonterminal][symbol2] = rules[i].trim();
					} else {
						let oldRules = {}
						for (let r of oldTableRule.split('\n'))
							oldRules[r.trim()] = true

						if (oldRules[rules[i].trim()] === undefined)
							ruleTable[nonterminal][symbol2] = oldTableRule + "\n" + rules[i].trim();

						// ruleTable[nonterminal][symbol2] = oldTableRule + "\n" + rules[i].trim();
					}
				}
			}
		}
	}
}

function emptyIfUndefined(string) {
	return string == undefined ? '' : string;
}

function collectFirsts() {
	firsts = new Object();

	var notDone;

	do {
		notDone = false;

		for (var i in rules) {
			var rule = rules[i].split('->');

			if (rule.length < 2) {
				continue;
			}

			var nonterminal = rule[0].trim();
			var development = trimElements(rule[1].trim().split(' '));
			var nonterminalFirsts = firsts[nonterminal];

			if (nonterminalFirsts == undefined) {
				nonterminalFirsts = [];
			}

			if (development.length == 1 && development[0] == EPSILON) {
				notDone |= addUnique(EPSILON, nonterminalFirsts);
			} else {
				notDone |= collectFirsts4(development, nonterminalFirsts);
			}

			firsts[nonterminal] = nonterminalFirsts;
		}
	} while (notDone);
}

/**
 * @param development
 * <br>Array of symbols
 * @param nonterminalFirsts
 * <br>Array of symbols
 * <br>Input-output
 * @return <code>true</code> If <code>nonterminalFirsts</code> has been modified
 */
function collectFirsts4(development, nonterminalFirsts) {
	var result = false;
	var epsilonInSymbolFirsts = true;

	for (var j in development) {
		var symbol = development[j];
		epsilonInSymbolFirsts = false;

		if (isElement(symbol, terminals)) {
			result |= addUnique(symbol, nonterminalFirsts);

			break;
		}

		for (var k in firsts[symbol]) {
			var first = firsts[symbol][k];

			epsilonInSymbolFirsts |= first == EPSILON;

			result |= addUnique(first, nonterminalFirsts);
		}

		if (!epsilonInSymbolFirsts) {
			break;
		}
	}

	if (epsilonInSymbolFirsts) {
		result |= addUnique(EPSILON, nonterminalFirsts);
	}

	return result;
}

/**
 * @param sequence
 * <br>Array of symbols
 */
function collectFirsts3(sequence) {
	var result = [];
	var epsilonInSymbolFirsts = true;

	for (var j in sequence) {
		var symbol = sequence[j];
		epsilonInSymbolFirsts = false;

		if (isElement(symbol, terminals)) {
			addUnique(symbol, result);

			break;
		}

		for (var k in firsts[symbol]) {
			var first = firsts[symbol][k];

			epsilonInSymbolFirsts |= first == EPSILON;

			addUnique(first, result);
		}

		epsilonInSymbolFirsts |= firsts[symbol] == undefined || firsts[symbol].length == 0;

		if (!epsilonInSymbolFirsts) {
			break;
		}
	}

	if (epsilonInSymbolFirsts) {
		addUnique(EPSILON, result);
	}

	return result;
}

function collectFollows() {
	follows = new Object();

	var notDone;

	do {
		notDone = false;

		for (var i in rules) {
			var rule = rules[i].split('->');

			if (rule.length < 2) {
				continue;
			}

			var nonterminal = rule[0].trim();
			var development = trimElements(rule[1].trim().split(' '));

			if (i == 0) {
				var nonterminalFollows = follows[nonterminal];

				if (nonterminalFollows == undefined) {
					nonterminalFollows = [];
				}

				notDone |= addUnique('$', nonterminalFollows);

				follows[nonterminal] = nonterminalFollows;
			}

			for (var j in development) {
				var symbol = development[j];

				if (isElement(symbol, nonterminals)) {
					var symbolFollows = follows[symbol];

					if (symbolFollows == undefined) {
						symbolFollows = [];
					}

					var afterSymbolFirsts = collectFirsts3(development.slice(parseInt(j) + 1));

					for (var k in afterSymbolFirsts) {
						var first = afterSymbolFirsts[k];

						if (first == EPSILON) {
							var nonterminalFollows = follows[nonterminal];

							for (var l in nonterminalFollows) {
								notDone |= addUnique(nonterminalFollows[l], symbolFollows);
							}
						} else {
							notDone |= addUnique(first, symbolFollows);
						}
					}

					follows[symbol] = symbolFollows;
				}
			}
		}
	} while (notDone);
}

function collectAlphabetAndNonterminalsAndTerminals() {
	for (var i in rules) {
		var rule = rules[i].split('->');
		if (rule.length != 2) {
			continue;
		}

		var nonterminal = rule[0].trim();
		var development = trimElements(rule[1].trim().split(' '));

		addUnique(nonterminal, alphabet);
		addUnique(nonterminal, nonterminals);

		for (var j in development) {
			var symbol = development[j];

			if (symbol != EPSILON) {
				addUnique(symbol, alphabet);
			}
		}
	}

	subtract(alphabet, nonterminals, terminals);
}

/**
 * @param result
 * <br>Array
 * <br>Input-output
 * @return <code>result</code>
 */
function subtract(array1, array2, result) {
	for (var i in array1) {
		var element = array1[i];

		if (!isElement(element, array2)) {
			result[result.length] = element;
		}
	}

	return result;
}

/**
 * @return
 * <br>Array
 * <br>New
 */
function trimElements(array) {
	var result = [];

	for (var i in array) {
		result[i] = array[i].trim();
	}

	return result;
}

function isElement(element, array) {
	for (var i in array) {
		if (element == array[i]) {
			return true;
		}
	}

	return false;
}

/**
 * @param array
 * <br>Input-output
 * @return <code>true</code> iff <code>array</code> has been modified
 */
function addUnique(element, array) {
	if (!isElement(element, array)) {
		array[array.length] = element;

		return true;
	}

	return false;
}

function resize(textInput, minimumSize) {
	textInput.size = Math.max(minimumSize, textInput.value.length);
}

function formatStack(stack) {
	return stack.join(' ')
}

function formatInput(input, index) {
	return input.slice(index).join(' ') + " $"
}

function formatRule(rule) {
	return rule;
}

function parseInput(inputStr, maximumStepCount) {
	inputStr = inputStr.trim().replace(/ /g, '')
	// var input = $('input').value.trim().split(' ');
	var input = inputStr.split('');

	var stack = ['$', nonterminals[0]];
	let parsingRows = []
	parsingRows.push([
		formatStack(stack),
		formatInput(input, 0),
		''
	])
	// var parsingRows = stack.join(' ') + "   " + input.join(' ') + " $";

	var ok = true;
	var tree = new Object();
	tree.label = 'root';
	tree.children = [];
	var parents = [tree];

	for (var i = 0, index = 0; i < maximumStepCount && 1 < stack.length; ++i) {
		var stackTop = stack[stack.length - 1];
		var symbol = index < input.length ? input[index] : '$';

		if (symbol.trim() == '') {
			symbol = '$';
		}

		var rule = '';

		if (stackTop == symbol) {
			stack.pop();
			++index;
			parents.pop().children.push(symbol);
		} else {
			if (isElement(stackTop, nonterminals)) {
				rule = ruleTable[stackTop][symbol];
				var node = new Object();
				node.label = stackTop;
				node.children = [];
				parents.pop().children.push(node);

				if (rule == undefined) {
					ok = false;
					break;
				}

				stack.pop();

				var reverseDevelopment = rule.split('->')[1].trim().split(' ').slice(0).reverse();

				for (var i in reverseDevelopment) {
					parents.push(node);
				}

				if (!isElement(EPSILON, reverseDevelopment)) {
					stack = stack.concat(reverseDevelopment);
				} else {
					parents.pop().children.push(EPSILON);
				}
			} else {
				ok = false;
				break;
			}
		}

		// parsingRows += '<tr><td nowrap=\"nowrap\">' + stack.join(' ') + "</td><td nowrap=\"nowrap\">" + input.slice(index).join(' ') + " $</td><td nowrap=\"nowrap\">" + rule + "</td></tr>\n";
		parsingRows.push([
			formatStack(stack),
			formatInput(input, index),
			formatRule(rule)
		])
	}

	const table = new CliTable({
		head: ['STACK', 'INPUT', 'RULE']
	})

	table.push(...parsingRows)

	return [table.toString(), ok]
}

function toString(tree) {
	if (tree.label == undefined) {
		return '' + tree;
	}

	var result = "<table class=\"tree\" border=\"1\"><thead><tr><th colspan=\"" + tree.children.length + "\">" + tree.label + "</th></tr></thead><tbody><tr>";

	for (var i in tree.children) {
		result += "<td>" + toString(tree.children[i]) + "</td>";
	}

	result += "</tr></tbody></table>";

	return result;
}

function renderRuleTable() {
	const head = ['NonTerminal']
	for (let t of terminals.concat(['$']))
		head.push(t);

	let rows = []

	for (var i in nonterminals) {
		var nonterminal = nonterminals[i];
		let row = [nonterminal]

		for (var j in terminals)
			row.push(emptyIfUndefined(ruleTable[nonterminal][terminals[j]]))

		row.push(emptyIfUndefined(ruleTable[nonterminal]['$']))

		rows.push(row)
	}

	const table = new CliTable({
		head: head
	})

	table.push(...rows)

	return table.toString()
}


function handleLl1(grammerTxt, input) {
	createLl1Table(grammerTxt)
	console.log(('\nLL(1) Parse Table:').cyan)
	console.log(renderRuleTable())

	if (input) {
		const [str, ok] = parseInput(input, 100)
		if (ok) {
			console.log('\nParsing Steps'.cyan)
			console.log(str)
			console.log('string accepted!'.green)
		} else {
			console.log('\nstring not accepted!'.red)
		}
	}
}

module.exports = {
	handleLl1: handleLl1
}