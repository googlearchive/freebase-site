/*

test: 6 large sized mqlread requests

*/

//films

var util = acre.require('util.sjs');

//bust the cache
acre.freebase.touch();
var t1 = new Date();
util.callback(acre.freebase.mqlread(util.big_film_query));
util.callback(acre.freebase.mqlread(util.big_book_query));
util.callback(acre.freebase.mqlread(util.big_artist_query));
util.callback(acre.freebase.mqlread(util.big_architect_query));
util.callback(acre.freebase.mqlread(util.big_celebrities_query));
util.callback(acre.freebase.mqlread(util.big_location_query));
var t2 = new Date();
acre.response.set_header('content-type', 'text/html');

acre.write('duration: ' + (t2-t1)/1000 + ' secs');
util.print_stats();