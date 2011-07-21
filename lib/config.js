exports.config = {
    outFile: function(path) { return prefixFile(path, 'base.') },
    aliases: {
        'moz': {
            mark: 'moz',
            description: 'Gecko (Mozilla): -moz-',
            outFile: function(path) { return prefixFile(path, 'moz.') },
            tokens: {
                'property': [/^\-moz\-/]
            }
        },
        'webkit': {
            mark: 'webkit',
            description: 'WebKit (Safari, Chrome): -webkit-, -apple-, -khtml-',
            outFile: function(path) { return prefixFile(path, 'webkit.') },
            tokens: {
                'property': [/^\-webkit\-/, /^\-apple\-/, /^\-khtml\-/]
            }
        },
        'o': {
            mark: 'o',
            description: 'Presto (Opera): -o-, -xv-',
            outFile: function(path) { return prefixFile(path, 'o.') },
            tokens: {
                'property': [/^\-o\-/, /^\-xv\-/]
            }
        },
        'ms': {
            mark: 'ms',
            description: 'Internet Explorer: -ms-',
            outFile: function(path) { return prefixFile(path, 'ms.') },
            tokens: {
                'property': [/^\-ms\-/]
            }
        }
    }
}

function getDirName(path) {
    return path ? path.substr(0, path.lastIndexOf('/')) : '';
}

function getFileName(path) {
    return path ? path.substr(path.lastIndexOf('/') + 1) : '';
}

function prefixFile(path, prefix) {
    return getDirName(path) + '/' + prefix + getFileName(path);
}
