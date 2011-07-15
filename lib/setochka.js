var config = require('./config.js').config,
    fs = require('fs'),
    print = require('sys').print,
    cssp = require('cssp'),
    opts = require('yanlibs/lib/yanutil').getopts(process.argv.slice(2, process.argv.length),
        ['--version', '-v',
         '--help', '-h',
         '--list', '-l'],
        ['--config', '-c',
         '--alias', '-a',
         '--input', '-i']),
    tree,
    srcFile = opts.pairs['-i'] || opts.pairs['--input'],
    src = srcFile ? fs.readFileSync(srcFile).toString() : null,
    extracted = '';

var extracts = initExtracts(opts.pairs['-a'] || opts.pairs['--alias']);

if (src !== null) {
    tree = cssp.parse(src);
    extractFromTree(tree, extracts);
    for (var k in extracts) {
        if (extracts[k].stylesheet.length > 1) {
            print(cssp.translate(extracts[k].stylesheet));
        }
    }
} else {
    console.log('USAGE: setochka filename');
}

function initExtracts(aliases) {
    var result = {},
        aliases = aliases ? aliases.trim().split(',') : Object.keys(config.aliases),
        alias;

    for (var i = 0; i < aliases.length; i++) {
        alias = aliases[i];
        if (config.aliases[alias]) {
            result[alias] = {
                stylesheet: ['stylesheet'],
                tokens: config.aliases[alias].tokens,
                buffer: []
            };
        }
    }

    return result;
}

function extractFromTree(tree, extracts) {
    var statement;

    for (var i = 1; i < tree.length; i++) {
        statement = tree[i];
        if (statement[0] === 'ruleset') {
            if (extractFromBlock(statement[2], extracts)) {
                createRulesets(statement, extracts);
                if (emptyBlock(statement[2])) tree.splice(i--, 1);
            }
        }
    }
}

function emptyBlock(block) {
    var empty = true;

    for (var i = 1; i < block.length; i++) {
        if (block[i] === '__remove_it__') {
            block.splice(i--, 1)[0];
        } else if (block[i][0] === 'declaration') {
            empty = false;
        }
    }

    return empty;
}

function createRulesets(ruleset, extracts) {
    var alias;

    for (var k in extracts) {
        alias = extracts[k];
        if (alias.buffer.length) {
            alias.stylesheet.push(createRuleset(ruleset, alias.buffer));
            alias.buffer.length = 0;
        }
    }
}

function extractFromBlock(block, extracts) {
    var declaration,
        tBlock = translateBlock(block),
        alias,
        extracted,
        result = false;

    for (var i = 1; i < tBlock.length; i++) {
        if (declaration = tBlock[i]) {
            extracted = false;
            for (var k in extracts) {
                alias = extracts[k];
                for (var l in alias.tokens) {
                    if (extractToken(block[i], l, declaration[l], alias)) {
                        extracted = true;
                        result = true;
                        break;
                    }
                }
            }
            if (extracted) block[i] = '__remove_it__';
        }
    }

    return result;
}

function translateBlock(block) {
    var result = [null],
        blockPart;

    for (var i = 1; i < block.length; i++) {
        blockToken = block[i];
        if (blockToken[0] === 'declaration') {
            result.push({
                'declaration': cssp.translate(blockToken, 'declaration').trim(),
                'property': cssp.translate(blockToken[1], 'property').trim(),
                'value': cssp.translate(blockToken[2], 'value').trim()
            });
        } else result.push(null);
    }

    return result;
}

function extractToken(declaration, token, _token, alias) {
    var matches = alias.tokens[token];

    for (var i = 0; i < matches.length; i++) {
        if (matches[i].test(_token)) {
            alias.buffer.push(declaration);
            return true;
        }
    }

    return false;
}

function createRuleset(ruleset, declarations) {
    return ['ruleset', ruleset[1], ['block'].concat(declarations)];
}
