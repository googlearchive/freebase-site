var tids = [];

var get_cost = function(header_value, cost_key) { 
    var parts =  header_value.split(',');
    if (! parts) { 
        return '';
    }
    for (var i = 0; i < parts.length; i++) { 
        var pp = parts[i].split('='); 
        pp[0] = pp[0].replace(/^\s*/, "").replace(/\s*$/, "");
        if (pp.length > 0 && pp[0] == cost_key) { return pp[1]; } 
    }

    return '';
}

var callback = function(result) { 

    if (typeof result.transaction_id != 'undefined') { tids.push([result.transaction_id, '']); return;}
    r = JSON.parse(result.body);
    tids.push([r['transaction_id'], get_cost(result['headers']['X-Metaweb-Cost'] || result['headers']['x-metaweb-cost'], 'dt')]);

};

var print_stats = function() { 

    tids.forEach(function (tid) { 
        url = acre.form.build_url('http://stats.metaweb.com/query/transaction', { 'tid' : tid[0] });
        acre.write('<br/><a href="' + url + '">' + tid[0] + '</a> (' + tid[1] + ' secs as reported by dt in x-metaweb-cost)\n'); }
     );

}

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
                      'genre' : [],
                      'origin' : [],
                      'limit' : 10
                    }];





var big_film_query = [{ 'type' : '/film/film',
                    'name' : null,
                    'id' : null,
                    'mid' : null,
                    'directed_by' : [],
                    'starring' : [{}],
                    'genre' : [],
                    'limit' : 20
                  }];

var big_book_query = [{ 'type' : '/book/book',
                    'name' : null,
                    'id' : null,
                    'mid' : null,
                    'genre' : [],
                    'editions' : [],
                    'characters' : [{}],
                    'limit' : 20
                  }];


var big_artist_query = [{ 'type' : '/music/artist',
                      'name' : null,
                      'id' : null,
                      'mid' : null,
                      'album' : [{}],
                      'genre' : [],
                      'origin' : [],
                      'album' : [{}],
                      'limit' : 20
                    }];

var big_architect_query = [{ 'type' : '/architecture/architect',
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


var big_celebrities_query = [{ 'type' : '/celebrities/celebrity',
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

var big_location_query = [{ 'type' :'/location/country',
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


