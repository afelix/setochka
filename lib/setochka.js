var config = require('./config.js').config,
    fs = require('fs'),
    print = require('sys').print,
    cssp = require('cssp'),
    getopts = require('./getopts.js').getopts,
    opts = getopts(process.argv.slice(2, process.argv.length),
        ['--version', '-v',
         '--help', '-h',
         '--list', '-l'],
        ['--merge-config', '-mc',
         '--replace-config', '-rc',
         '--aliases', '-a',
         '--input', '-i']).known,
    reNR = /[\n\r]/,
    tree, srcFile, src, usrCfgFile, extracts;

if (opts['--version'] || opts['-v']) printFile('VERSION');
else if (opts['--help'] || opts['-h']) printFile('USAGE');
else {
    if (usrCfgFile = (opts['--replace-config'] || opts['-rc'])) {
        config = require(usrCfgFile);
    } else if (usrCfgFile = (opts['--merge-config'] || opts['-mc'])) {
        mergeConfig(config, require(usrCfgFile));
    }

    if (opts['--list'] || opts['-l']) printConfig(config);
    else if (srcFile = (opts['--input'] || opts['-i'])) {
        src = fs.readFileSync(srcFile).toString();

        extracts = initExtracts(opts['-a'] || opts['--aliases']);
        tree = cssp.parse(src);
        extractFromTree(tree, extracts);
        writeExtracts(extracts, srcFile);
        if (config.outFile) fs.writeFileSync(config.outFile(srcFile), cssp.translate(tree));
    } else printFile('USAGE');
}

function initExtracts(aliases) {
    var result = {},
        aliases = aliases ? aliases.trim().split(',') : Object.keys(config.aliases),
        alias,
        t;

    for (var i = 0; i < aliases.length; i++) {
        alias = aliases[i];
        if (config.aliases[alias]) {
            t = config.aliases[alias];
            t['stylesheet'] = ['stylesheet'],
            t['buffer'] = [];
            result[alias] = t;
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
            alias.buffer = [];
        }
    }
}

function createRuleset(ruleset, declarations) {
    var dLastToken = declarations.slice(-1)[0],
        bLastToken = ruleset[2].slice(-1)[0];

    if (isNRToken(dLastToken)) {
        // replace last declaration NR-token by block NR-token
        declarations.splice(-1);
        if (isNRToken(bLastToken)) declarations.push(bLastToken);
        else declarations = declarations.concat(copyTokenNR(bLastToken));
    }

    return ['ruleset', ruleset[1], ['block'].concat(findFirstBlockNR(ruleset[2]), declarations)];
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
                    if (extractToken(block[i], l, declaration[l], alias, block[i - 1])) {
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

function extractToken(declaration, token, _token, alias, prevToken) {
    var matches = alias.tokens[token];

    if (alias.mark && prevToken && prevToken[0] === 'comment' && alias.mark === prevToken[1]) return true;

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
        if (blockToken[0] === 's') {
            result.push(blockToken);
            if (reNR.test(blockToken[1])) return result;
        } else if (blockToken[0] === 'comment' || blockToken[0] === 'decldelim') result.push(blockToken);
        else return result;
    }

    return result;
}

function copySCLeft(block, i) {
    var result = [],
        blockToken;

    for (; i > 0; i--) {
        blockToken = block[i];
        if ((blockToken[0] === 's' && !reNR.test(blockToken[1])) || blockToken[0] === 'comment') result.push(blockToken);
        else return result;
    }

    return result;
}

function writeExtracts(extracts, srcFile) {
    var alias;

    for (var k in extracts) {
        alias = extracts[k];
        if (alias.stylesheet.length > 1 && alias.outFile) {
            fs.writeFileSync(alias.outFile(srcFile), cssp.translate(alias.stylesheet));
        }
    }
}

function isNRToken(token) {
    return (token[0] === 's' && reNR.test(token[1]));
}

function copyTokenNR(token) {
    var t;

    switch (token[0]) {
        case 'declaration':
            t = token[2].slice(-1)[0];
            return isNRToken(t) ? [t] : [];
        default:
            return [];
    }
}

function findFirstBlockNR(blockTokens) {
    var blockToken;

    for (var i = 1; i < blockTokens.length; i++) {
        blockToken = blockTokens[i];
        if (isNRToken(blockToken)) return [blockToken];
        else if (blockToken[0] !== 's' && blockToken[0] !== 'comment') return [];
    }

    return [];
}

// Utils

function printFile(filename) {
    print(fs.readFileSync(__dirname.slice(0, __dirname.lastIndexOf('/')) + '/' + filename).toString());
}

function printConfig(config) {
    var a;

    console.log('Aliases list:');
    for (var k in config.aliases) {
        a = config.aliases[k];
        console.log(' * ' + k);
        a.description && console.log('   Описание: ' + a.description);
        a.mark && console.log('   Метка: ' + a.mark);
    }
}

function mergeConfig(o/*riginal config*/, u/*ser config*/) {
    var oa, ua;

    if (u.config) {
        u = u.config;
        if ('outFile' in u) o.outFile = u.outFile;
        if ('aliases' in u) {
            for (var k in u.aliases) {
                ua = u.aliases[k];
                if (k in o.aliases) {
                    oa = o.aliases[k];
                    if ('description' in ua) oa.description = oa.description;
                    if ('mark' in ua) oa.mark = oa.mark;
                    if ('outFile' in ua) oa.outFile = ua.outFile;
                    if ('tokens' in ua) for (var l in ua.tokens) oa.tokens[l] = ua.tokens[l];
                } else o.aliases[k] = ua;
            }
        }
    }
}
