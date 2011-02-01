/*

testing: one local require

*/

var t1 = new Date();
acre.require('util.sjs');
var t2 = new Date();
acre.write('duration: ' + (t2-t1)/1000 + ' secs');



