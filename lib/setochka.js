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
    writeExtracts(extracts, srcFile);
    if (config.outFile) fs.writeFileSync(config.outFile(srcFile), cssp.translate(tree));
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
    var statement,
        toRemove;

    for (var i = 1; i < tree.length; i++) {
        statement = tree[i];
        if (statement[0] === 'ruleset') {
            if (toRemove = extractFromBlock(statement[2], extracts)) {
                createRulesets(statement, extracts);
                if (emptyBlock(statement[2], toRemove)) tree.splice(i--, 1);
            }
        }
    }
}

function emptyBlock(block, toRemove) {
    var empty = true;

    for (var i = 1; i < block.length; i++) {
        if (toRemove[i]) {
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

function createRuleset(ruleset, declarations) {
    return ['ruleset', ruleset[1], ['block'].concat(declarations, findLastBlockNR(ruleset[2]))];
}

function extractFromBlock(block, extracts) {
    var declaration,
        tBlock = translateBlock(block),
        alias,
        toRemove = null,
        scd;

    for (var i = 1; i < tBlock.length; i++) {
        if (declaration = tBlock[i]) {
            extracted = false;
            for (var k in extracts) {
                alias = extracts[k];
                for (var l in alias.tokens) {
                    if (extractToken(block[i], l, declaration[l], alias)) {
                        toRemove = toRemove || {};
                        // copy pre-declaration parts
                        scd = copySCLeft(block, i - 1);
                        alias.buffer = alias.buffer.concat(scd);
                        for (j = 0; j < scd.length; j++) toRemove[i - j - 1] = true;
                        // copy declaration
                        alias.buffer.push(block[i]);
                        toRemove[i] = true;
                        // copy post-declaration parts
                        scd = copySCDRight(block, i + 1);
                        alias.buffer = alias.buffer.concat(scd);
                        for (j = 0; j < scd.length; j++) toRemove[i + j + 1] = true;

                        break;
                    }
                }
            }
        }
    }

    return toRemove;
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
            return true;
        }
    }

    return false;
}

function copySCDRight(block, i) {
    var result = [],
        blockToken;

    for (; i < block.length; i++) {
        blockToken = block[i];
        if ((blockToken[0] === 's' && !/[\n\r]/.test(blockToken[1])) ||
            blockToken[0] === 'comment' ||
            blockToken[0] === 'decldelim') result.push(blockToken);
        else return result;
    }

    return result;
}

function copySCLeft(block, i) {
    var result = [],
        blockToken;

    for (; i > 0; i--) {
        blockToken = block[i];
        if (blockToken[0] === 's' || blockToken[0] === 'comment') result.push(blockToken);
        else return result;
    }

    return result;
}

function findLastBlockNR(block) {
    var blockToken;

    for (var i = block.length - 1; i > 0; i--) {
        blockToken = block[i];
        if (blockToken[0] === 's' && /[\n\r]/.test(blockToken[1])) return blockToken;
        else if (blockToken[0] !== 's' && blockToken[0] !== 'comment') return [];
    }

    return [];
}

function writeExtracts(extracts, srcFile) {
    var alias;

    for (var k in extracts) {
        alias = extracts[k];
        if (alias.stylesheet.length > 1 && config.aliases[k].outFile) {
            fs.writeFileSync(config.aliases[k].outFile(srcFile), cssp.translate(alias.stylesheet));
        }
    }
}
