
(function (mjt) {

mjt.freebase.imgurl = function(cid, maxwidth, maxheight, mode, errorid) {
    var qargs = {};
    if (typeof maxwidth !== 'undefined') {
        qargs.maxwidth = maxwidth;
    }
    if (typeof maxheight !== 'undefined') {
        qargs.maxheight = maxheight;
    }
    if (typeof mode !== 'undefined') {
        qargs.mode = mode;
    }
    if (typeof mode !== 'undefined') {
        qargs.errorid = errorid;
    }

    // the formquote is necessary to handle old-style #guids,
    // and should be harmless on valid mql ids.
    return mjt.form_url(this.service_url + '/api/trans/image_thumb'
                        + mjt.formquote(cid),
                        qargs);
};


/**
 *  Applies parameters to a query
 *
 *  @param query     a mql query
 *  @param paths     an object of paramaters where the key is a path and the value is an updated value
 */
mjt.freebase.extend_query = function (query, paths) {
    if (typeof paths == 'undefined')
        paths = {};
    if (typeof query == 'undefined')
        throw new Error('extend_query: MQL query is undefined');

    // go through all the substitutions in the paths dict,
    // patching query accordingly.
    for (var path in paths) {
        var val = paths[path];

        // turn the path expression into a list of keys
        var pathkeys = path.split('.');
        var last_key = pathkeys.pop();

        // walk the obj variable down the path starting
        // at the query root
        var obj = query instanceof Array ? query[0] : query;

        for (var i = 0; i < pathkeys.length; i++) {
            var key = pathkeys[i];
            // If we're on an uncreated frontier, create it.
            if (typeof obj[key] != 'object' || obj[key] === null) {
                obj[key] = {};
            }
            obj = obj[key];
            if (obj instanceof Array) {
                if (obj.length == 0)
                    obj = [{}];

                if (obj.length > 1)
                    throw new Error('extend_query: path ' + JSON.stringify(path)
                                    + ' references an array with more than one element');

                obj = obj[0];
            }
        }

        if (obj === null || typeof obj != 'object') {
            throw new Error('extend_query: path ' + JSON.stringify(path)
                           + ' does not exist in query');
        }

        // patch in the final value
    obj[last_key] = val;
    }
    return query;
};
})(mjt);
