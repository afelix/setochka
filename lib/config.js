exports.config = {
    outFile: function(filename) { return 'base.' + filename },
    aliases: {
        'moz': {
            mark: 'moz',
            description: 'Gecko (Mozilla): -moz-',
            outFile: function(filename) { return 'moz.' + filename },
            tokens: {
                'property': [/^\-moz\-/]
            }
        },
        'webkit': {
            mark: 'webkit',
            description: 'WebKit (Safari, Chrome): -webkit-, -apple-, -khtml-',
            outFile: function(filename) { return 'webkit.' + filename },
            tokens: {
                'property': [/^\-webkit\-/, /^\-apple\-/, /^\-khtml\-/]
            }
        },
        'o': {
            mark: 'o',
            description: 'Presto (Opera): -o-, -xv-',
            outFile: function(filename) { return 'o.' + filename },
            tokens: {
                'property': [/^\-o\-/, /^\-xv\-/]
            }
        },
        'ms': {
            mark: 'ms',
            description: 'Internet Explorer: -ms-',
            outFile: function(filename) { return 'ms.' + filename },
            tokens: {
                'property': [/^\-ms\-/]
            }
        }
    }
}
