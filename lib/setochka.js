var fs = require('fs'),
    print = require('sys').print,
    cssp = require('cssp'),
    tree,
    src = process.argv[2] ? fs.readFileSync(process.argv[2]).toString() : null,
    extracted = '';

var re = /^\-setochka\-/;

if (src !== null) {
    tree = cssp.parse(src);
//    console.log(tree);
    extracted = extractFromTree(tree, re);
//    console.log(extracted);
console.log('src');
console.log(src);
console.log('setochka');
print(cssp.translate(extracted));
console.log('out');
print(cssp.translate(tree));
} else {
    console.log('USAGE: setochka filename');
}

function extractFromTree(tree, re) {
    var statement,
        declarations,
        result = ['stylesheet'];

    for (var i = 1; i < tree.length; i++) {
        statement = tree[i];
        if (statement[0] === 'ruleset') {
            declarations = extractFromBlock(statement[2], re);
            if (declarations.length) {
                result.push(createRuleset(statement, declarations));
                result.push(['s', '\n']);
            }
        }
    }

    return result;
}

function extractFromBlock(block, re) {
    var blockPart,
        result = [];

    for (var i = 1; i < block.length; i++) {
        blockPart = block[i];
        if (blockPart[0] === 'declaration' && wantToExtract(blockPart, re)) {
            result.push(block.splice(i--, 1)[0]);
        }
    }

    return result;
}

function wantToExtract(declaration, re) {
    return re.test(cssp.translate(declaration[1], 'property').trim());
}

function createRuleset(ruleset, declarations) {
    var result = ['ruleset', ruleset[1]],
        block = ['block'];

    block.push(['s', '\n']);
    for (var i = 0; i < declarations.length; i++) {
        block.push(declarations[i]);
        block.push(['decldelim']);
        block.push(['s', '\n']);
    }

    result.push(block);

    return result;
}
