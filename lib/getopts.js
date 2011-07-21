// TODO: move to yanlibs

exports.getopts = function(argv, o_single, o_pairs) {
    var opts = { known: {}, other: [] },
        a,
        arg;

    for (var i = 0; i < argv.length; i++) {
        arg = argv[i];
        if (o_single && o_single.indexOf(arg) !== -1 && (!o_pairs || o_pairs[arg].indexOf(arg) === -1)) {
            opts.known[arg] = true;
        } else if (o_pairs && o_pairs.indexOf(arg) !== -1 && (!o_single || o_single.indexOf(arg) === -1)) {
            a = opts.known[arg] || [];
            a.push(argv[++i]);
            opts.known[arg] = a;
        } else opts.other.push(arg);
    }

    return opts;
};
