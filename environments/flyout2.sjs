var MAX_NOTABLE = 3;
var id = acre.request.params["id"];
var lang = acre.request.params["lang"];
if (!lang) { lang = "en"}

try {
  var topic = acre.freebase.get_topic(id, {"filter": "suggest", "lang": lang});
} catch(e) {
  acre.write("Sorry, there was an error fetching data for " + id + " - is this a valid id?");
  acre.exit(-1);

}	
var props = {};
for (var prop_id in topic.property) {

  if (topic.property[prop_id]["values"]) {
	props[prop_id] = topic.property[prop_id]["values"][0]["text"];
  }
}

var suggest_prop_ids = {};
var count = 0;

if (topic.property["/synthetic/notability/notable_properties"]) {

	for (var i in topic.property["/synthetic/notability/notable_properties"]["values"]) { 

		var p = topic.property["/synthetic/notability/notable_properties"]["values"][i]["property"]["/synthetic/notable_for/property"]["values"][0];
		if (props[p["id"]]) { 
			suggest_prop_ids[p["id"]] = p["text"];
			count++;
		}	
		if (count >= MAX_NOTABLE) { break; }

	}
}

var notable_for = [];

if (topic.property["/synthetic/notability/notable_for"]) { 
	notable_for.push(topic.property["/synthetic/notability/notable_for"]["values"][0]["text"])
}

if (topic.property["/synthetic/notability/notable_types"]) {
	for (var i in topic.property["/synthetic/notability/notable_types"]["values"].slice(0, MAX_NOTABLE - notable_for.length)) {
		notable_for.push(topic.property["/synthetic/notability/notable_types"]["values"][i]["text"])
	}
}

var imgurl = acre.freebase.imgurl(topic['id'], 75, null, 'fit', '/freebase/no_image_png');
var output = '<div class="fbs-flyout-content">';

output += '<img class="fbs-flyout-image-true" id="fbs-topic-image" src="' + imgurl + '"/><h1 class="fbs-flyout-image-true" id="fbs-flyout-title">' + props["/type/object/name"] + '</h1>';

for (prop_id in suggest_prop_ids) { 
	output += '<h3 class="fbs-topic-properties fbs-flyout-image-true"><strong>' + suggest_prop_ids[prop_id] + '</strong>: ' + props[prop_id] + '</h3>';
}

if (props['/common/topic/article']) {
  output += '<p class="fbs-topic-article fbs-flyout-image-true">' + props["/common/topic/article"].substr(0, 250) + '...</p>';
}

for (i in notable_for) { 
 output += notable_for[i];
	if (i != notable_for.length-1) { 
		output += ', ';
 }
}
output += '</div>';

if (acre.request.params["callback"]) {
	
	acre.response.set_header("Content-type", "text/javascript");
	var result = { "id" : id, "html" : output};	
	acre.write("/** this is jsonp **/ foo(" + JSON.stringify(result) + ");");

} else {
	acre.response.set_header("Content-type", "text/html");
	acre.write(output);
}