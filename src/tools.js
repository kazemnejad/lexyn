const _ = require('underscore')

var EPSILON = '\'\'';

function extend(objekt, zuper) {
    _.extend(objekt, zuper);

    objekt.zuper = zuper;
}

function newObject(prototype) {
    function F() {
        // Deliberatley left empty
    }

    F.prototype = prototype;

    return new F();
}

function includes(array1, array2) {
    for (var i in array1) {
        if (array2.indexOf(array1[i]) < 0) {
            return false;
        }
    }

    return true;
}

function includeEachOther(array1, array2) {
    return includes(array1, array2) && includes(array2, array1);
}

function includesUsingEquals(array1, array2) {
    for (var i in array1) {
        if (indexOfUsingEquals(array1[i], array2) < 0) {
            return false;
        }
    }

    return true;
}

function includeEachOtherUsingEquals(array1, array2) {
    return includesUsingEquals(array1, array2) && includesUsingEquals(array2, array1);
}

function getOrCreateArray(dictionary, key) {
    var result = dictionary[key];

    if (result == undefined) {
        result = [];
        dictionary[key] = result;
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
        array.push(element);

        return true;
    }

    return false;
}

function isElementUsingEquals(element, array) {
    for (var i in array) {
        if (element.equals(array[i])) {
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
function addUniqueUsingEquals(element, array) {
    if (!isElementUsingEquals(element, array)) {
        array.push(element);

        return true;
    }

    return false;
}

/**
 * @return
 * <br>Range: <code>[-1 .. array.length - 1]</code>
 */
function indexOfUsingEquals(element, array) {
    for (var i in array) {
        if (element.equals(array[i])) {
            return i;
        }
    }

    return -1;
}

function $(id) {
    return document.getElementById(id);
}

function assertEquality(expected, actual) {
    if (expected != actual) {
        throw 'Assertion failed: expected ' + expected + ' but was ' + actual;
    }
}

function assertEquals(expected, actual) {
    if (!expected.equals(actual)) {
        throw 'Assertion failed: expected ' + expected + ' but was ' + actual;
    }
}

function resize(textInput, minimumSize) {
    textInput.size = Math.max(minimumSize, textInput.value.length);
}

module.exports = {
    extend: extend,
    resize: resize,
    assertEquals:  assertEquals,
    assertEquality: assertEquality,
    $: $,
    indexOfUsingEquals: indexOfUsingEquals,
    addUniqueUsingEquals: addUniqueUsingEquals,
    isElementUsingEquals: isElementUsingEquals,
    addUnique: addUnique,
    isElement: isElement,
    trimElements: trimElements,
    getOrCreateArray: getOrCreateArray,
    includeEachOtherUsingEquals: includeEachOtherUsingEquals,
    includesUsingEquals: includesUsingEquals,
    includeEachOther: includeEachOther,
    includes: includes,
    newObject: newObject,
    extend: extend,
    EPSILON: EPSILON,
}

// const {
//     extend,
//     resize,
//     assertEquals,
//     assertEquality,
//     $,
//     indexOfUsingEquals,
//     addUniqueUsingEquals,
//     isElementUsingEquals,
//     addUnique,
//     isElement,
//     trimElements,
//     getOrCreateArray,
//     includeEachOtherUsingEquals,
//     includesUsingEquals,
//     includeEachOther,
//     includes,
//     newObject
// }