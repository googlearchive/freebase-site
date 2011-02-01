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


//bust the cache
acre.freebase.touch();
var t1 = new Date();
acre.freebase.mqlread(film_query);
acre.freebase.mqlread(book_query);
acre.freebase.mqlread(artist_query);
var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');
