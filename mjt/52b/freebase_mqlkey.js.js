

(function (mjt) {

/**
 *
 *  routines to quote and unquote javascript strings as valid mql keys
 * 
 */

var mqlkey_start = 'A-Za-z0-9';
var mqlkey_char = 'A-Za-z0-9_-';

var MQLKEY_VALID = new RegExp('^[' + mqlkey_start + '][' + mqlkey_char + ']*$');

var MQLKEY_CHAR_MUSTQUOTE = new RegExp('([^' + mqlkey_char + '])', 'g');


/**
 *  quote a unicode string to turn it into a valid mql /type/key/value
 *
 */
mjt.freebase.mqlkey_quote = function (s) {
    if (MQLKEY_VALID.exec(s))   // fastpath
        return s;

    var convert = function(a, b) {
        var hex = b.charCodeAt(0).toString(16).toUpperCase();
        if (hex.length == 2)
            hex = '00' + hex;
        return '$' + hex;
    };

    x = s.replace(MQLKEY_CHAR_MUSTQUOTE, convert);

    if (x.charAt(0) == '-' || x.charAt(0) == '_') {
        x = convert(x,x.charAt(0)) + x.substr(1);
    }

    // TESTING
    /*
    if (mjt.debug && mqlkey_unquote(x) !== s) {
        mjt.log('failed roundtrip mqlkey quote', s, x);
    }
    */
    return x;
}


/**
 *  unquote a /type/key/value string to a javascript string
 *
 */
mjt.freebase.mqlkey_unquote = function (x) {
    x = x.replace(/\$([0-9A-Fa-f]{4})/g, function (a,b) {
        return String.fromCharCode(parseInt(b, 16));
    });
    return x;
}

// convert a mql id to an id suitable for embedding in a url path.
// UNTESTED
// and DEPRECATED
var mqlid_to_mqlurlid = function (id) {
    if (id.charAt(0) === '~') {
        return id;
    }

    if (id.charAt(0) === '#') {
        return '%23' + id.substr(1);
    }

    if (id.charAt(0) !== '/') {
        return 'BAD-ID';
    }

    // requote components as keys and rejoin.
    var segs = id.split('/');
    var keys = [];
    for (var i = 1; i < segs.length; i++) {
        var seg = segs[i];
        // conservative uri encoding for now
        keys.push(encodeURIComponent(mqlkey_unquote(seg)));
    }
    // urlids do not have leading slashes!!!
    return '/'.join(keys);
}

})(mjt);
