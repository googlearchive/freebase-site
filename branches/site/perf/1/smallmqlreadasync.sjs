/*

test: 3 medium sized mqlread requests

*/

//films

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

var callback = function(result) { };
film_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : film_query})), {'callback' : callback });
book_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : book_query})), {'callback' : callback });
artist_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : artist_query})), {'callback' : callback });


acre.async.wait_on_results();

var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');
