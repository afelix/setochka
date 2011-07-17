exports.config = {
    outFile: function(filename) { return 'base.' + filename },
    aliases: {
        'test': {
            mark: 'test',
            description: 'Для тестов.',
            outFile: function(filename) { return 'test.' + filename },
            tokens: {
                'property': [/^setochka\-/, /^\-setochka\-/]
            }
        },
        'webkit': {
            mark: 'wk',
            description: 'WebKit: -webkit-.',
            outFile: function(filename) { return 'webkit.' + filename },
            tokens: {
                'property': [/^\-webkit\-/]
            }
        }
    }
}
