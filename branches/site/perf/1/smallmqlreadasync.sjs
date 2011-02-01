/*

test: 3 medium sized mqlread requests

*/

//films

var util = acre.require('util.sjs');

var film_query = [{ 'type' : '/film/film',
                    'name' : null,
                    'id' : null,
                    'mid' : null,
                    'directed_by' : [],
                    'starring' : [{}],
                    'genre' : [],
                    'limit' : 10
                  }];

var book_query = [{ 'type' : '/book/book',
                    'name' : null,
                    'id' : null,
                    'mid' : null,
                    'genre' : [],
                    'editions' : [],
                    'characters' : [{}],
                    'limit' : 10
                  }];


var artist_query = [{ 'type' : '/music/artist',
                      'name' : null,
                      'id' : null,
                      'mid' : null,
                      'album' : [{}],
                      'genre' : [],
                      'origin' : [],
                      'limit' : 10
                    }];

acre.freebase.touch();
var t1 = new Date();

film_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : film_query})), {'callback' : util.callback });
book_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : book_query})), {'callback' : util.callback });
artist_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : artist_query})), {'callback' : util.callback });


acre.async.wait_on_results();

var t2 = new Date();
acre.response.set_header('content-type', 'text/html');
acre.write('duration: ' + (t2-t1)/1000 + ' secs\n');
util.print_stats();
