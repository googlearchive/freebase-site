var id = acre.request.params.id;

var template = acre.require('collection-topics-template');
var url = acre.freebase.service_url + "/private/query" + id;
var result = JSON.parse(acre.urlfetch(url).body);

var topics = [];

// We only want to return 9 topics
// So get rid of extra
if(result.results.length > 9) {
    result.results = result.results.slice(0,9);
}

for (var x=0; x < result.results.length; x++) {
    var r = result.results[x];
    
    var id = r['id'];
    var name = r['/type/object/name'][0]['value'];
    var link = 'http://www.freebase.com/view' + id;
    topics.push({id: id, name: name, link: link});
}

acre.response.set_header('content-type', 'text/html');
acre.write(template.body(topics));
