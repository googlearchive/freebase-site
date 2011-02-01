/*

test: 6 large sized mqlread requests

*/
var util = acre.require('util.sjs');

//films


//bust the cache
acre.freebase.touch();
var t1 = new Date();

var callback = function(result) { };
film_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.big_film_query})), {'callback' : util.callback });
book_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.big_book_query})), {'callback' : util.callback });
artist_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.big_artist_query})), {'callback' : util.callback });
architect_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.big_architect_query})), {'callback' : util.callback });
celebrities_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.big_celebrities_query})), {'callback' : util.callback });
location_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.big_location_query})), {'callback' : util.callback });


acre.async.wait_on_results();

acre.response.set_header('content-type', 'text/html');
var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');
util.print_stats();