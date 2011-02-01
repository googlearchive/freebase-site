/*

test: 3 medium sized mqlread requests

*/

//films

var util = acre.require('util.sjs');

acre.freebase.touch();
var t1 = new Date();

film_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.film_query})), {'callback' : util.callback });
book_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.book_query})), {'callback' : util.callback });
artist_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : util.artist_query})), {'callback' : util.callback });


acre.async.wait_on_results();

var t2 = new Date();
acre.response.set_header('content-type', 'text/html');
acre.write('duration: ' + (t2-t1)/1000 + ' secs\n');
util.print_stats();
