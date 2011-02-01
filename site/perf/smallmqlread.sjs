/*

test: 3 medium sized mqlread requests

*/

//films

var util = acre.require('util.sjs');


//bust the cache
acre.freebase.touch();
var t1 = new Date();
util.callback(acre.freebase.mqlread(util.film_query));
util.callback(acre.freebase.mqlread(util.book_query));
util.callback(acre.freebase.mqlread(util.artist_query));
var t2 = new Date()
acre.response.set_header('content-type', 'text/html');
;
acre.write('duration: ' + (t2-t1)/1000 + ' secs');
util.print_stats();