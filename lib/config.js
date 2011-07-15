exports.config = {
    outFile: function(filename) { return 'new.' + filename },
    aliases: {
        'test': {
            outFile: function(filename) { return 'test.' + filename },
            tokens: {
                'property': [/^setochka\-/, /^\-setochka\-/]
            }
        },
        'webkit': {
            outFile: function(filename) { return 'webkit.' + filename },
            tokens: {
                'property': [/^\-webkit\-/]
            }
        }
    }
}
