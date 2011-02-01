/*

test: 6 large sized mqlread requests

*/

//films

var film_query = [{ 'type' : '/film/film',
                    'name' : null,
                    'id' : null,
                    'mid' : null,
                    'directed_by' : [],
                    'starring' : [{}],
                    'genre' : [],
                    'limit' : 20
                  }];

var book_query = [{ 'type' : '/book/book',
                    'name' : null,
                    'id' : null,
                    'mid' : null,
                    'genre' : [],
                    'editions' : [],
                    'characters' : [{}],
                    'limit' : 20
                  }];


var artist_query = [{ 'type' : '/music/artist',
                      'name' : null,
                      'id' : null,
                      'mid' : null,
                      'album' : [{}],
                      'genre' : [],
                      'origin' : [],
                      'limit' : 20
                    }];

var architect_query = [{ 'type' : '/architecture/architect',
                         'id' : null,
                         'mid' : null,
                         'name' : null,
                         'structures_designed' : [{}],
                         'architectural_style' : [{}],
                         'structure_count' : null,
                         '/people/person/date_of_birth' : null,
                         '/people/person/place_of_birth': null,
                         'limit' : 20,
                         
                       }];


var celebrities_query = [{ 'type' : '/celebrities/celebrity',
                           'id' : null,
                           'name' : null,
                           'mid' : null,
                           'celebrity_friends' : [{}],
                           'celebrity_rivals' : [{}],
                           'rehab_history' : [{}],
                           '/people/person/date_of_birth' : null,
                           '/people/person/place_of_birth': null,
                           'limit' : 20,
                         }];

var location_query = [{ 'type' :'/location/country',
                        'id' : null,
                        'name' : null,
                        'mid' : null,
                        'capital' : [],
                        'form_of_government' : [],
                        'official_language' : [],
                        'currency_used' : [],
                        'gdp_nominal' : [{}],
                        'calling_code' : null,
                        'limit' : 20
                      }];



//bust the cache
acre.freebase.touch();
var t1 = new Date();

var callback = function(result) { };
film_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : film_query})), {'callback' : callback });
book_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : book_query})), {'callback' : callback });
artist_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : artist_query})), {'callback' : callback });
architect_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : architect_query})), {'callback' : callback });
celebrities_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : celebrities_query})), {'callback' : callback });
location_query = acre.async.urlfetch(acre.freebase.service_url + '/api/service/mqlread?q=' + acre.form.quote(JSON.stringify({'query' : location_query})), {'callback' : callback });


acre.async.wait_on_results();

//acre.write(JSON.stringify(film_query));
var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');