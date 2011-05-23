var result;
try {
  var qparam = acre.request.body_params.query || acre.request.params.query;
  var envelope = JSON.parse(qparam);
  var query = envelope.query;
  delete envelope.query;
  result = acre.freebase.mqlwrite(query, envelope);
} catch (e) {
  result = e;
}

acre.write(JSON.stringify(result, null, 2));