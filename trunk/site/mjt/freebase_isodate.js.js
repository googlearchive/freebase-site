/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



/**
 * 
 * ISO 8601 date functions
 * 
 * parsing originally from dojo.date.serialize
 *
 * according to http://svn.dojotoolkit.org/src/trunk/LICENSE :
 *    Dojo is availble under *either* the terms of the modified BSD license *or* the
 *    Academic Free License version 2.1.
 * 
 * 
 * formatting from http://delete.me.uk/2005/03/iso8601.html
 * 
 *   "This code is available under the AFL. This should mean
 *    you can use it pretty much anyway you want."
 */

/* - repackaged for mjt
 * - inlined dojo.string.pad
 * - return NaN rather than null for consistency with builtin Date.parse()
 * but not much else done hopefully */

(function (mjt) {

var setIso8601 = function(/*Date*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (uses date and time)
	var comps = (formattedString.indexOf("T") == -1) ? formattedString.split(" ") : formattedString.split("T");
	dateObject = setIso8601Date(dateObject, comps[0]);
	if(comps.length == 2){ dateObject = setIso8601Time(dateObject, comps[1]); }
	return dateObject; /* Date or null */
};

var fromIso8601 = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (uses date and time)
	return setIso8601(new Date(0, 0), formattedString);
};

var setIso8601Date = function(/*String*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (date only)
	var regexp = "^(-?[0-9]{4})((-?([0-9]{2})(-?([0-9]{2}))?)|" +
			"(-?([0-9]{3}))|(-?W([0-9]{2})(-?([1-7]))?))?$";
	var d = formattedString.match(new RegExp(regexp));
	if(!d){
		mjt.log("invalid date string: " + formattedString);
		return NaN;
	}
	var year = d[1];
	var month = d[4];
	var date = d[6];
	var dayofyear = d[8];
	var week = d[10];
	var dayofweek = d[12] || 1;

	dateObject.setFullYear(year);

	if(dayofyear){
		dateObject.setMonth(0);
		dateObject.setDate(Number(dayofyear));
	}
	else if(week){
		dateObject.setMonth(0);
		dateObject.setDate(1);
		var day = dateObject.getDay() || 7;
		var offset = Number(dayofweek) + (7 * Number(week));
	
		if(day <= 4){ dateObject.setDate(offset + 1 - day); }
		else{ dateObject.setDate(offset + 8 - day); }
	} else{
		if(month){
			dateObject.setDate(1);
			dateObject.setMonth(month - 1); 
		}
		if(date){ dateObject.setDate(date); }
	}

	return dateObject; // Date
};

var fromIso8601Date = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (date only)
	return setIso8601Date(new Date(0, 0), formattedString);
};

var setIso8601Time = function(/*Date*/dateObject, /*String*/formattedString){
	// summary: sets a Date object based on an ISO 8601 formatted string (time only)

	// first strip timezone info from the end
	var timezone = "Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$";
	var d = formattedString.match(new RegExp(timezone));

	var offset = 0; // local time if no tz info
	if(d){
		if(d[0] != 'Z'){
			offset = (Number(d[3]) * 60) + Number(d[5] || 0);
			if(d[2] != '-'){ offset *= -1; }
		}
		offset -= dateObject.getTimezoneOffset();
		formattedString = formattedString.substr(0, formattedString.length - d[0].length);
	}

	// then work out the time
	var regexp = "^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$";
	d = formattedString.match(new RegExp(regexp));
	if(!d){
		mjt.log("invalid time string: " + formattedString);
		return NaN;
	}
	var hours = d[1];
	var mins = Number(d[3] || 0);
	var secs = d[5] || 0;
	var ms = d[7] ? (Number("0." + d[7]) * 1000) : 0;

	dateObject.setHours(hours);
	dateObject.setMinutes(mins);
	dateObject.setSeconds(secs);
	dateObject.setMilliseconds(ms);

	if(offset !== 0){
		dateObject.setTime(dateObject.getTime() + offset * 60000);
	}	
	return dateObject; // Date
};

var fromIso8601Time = function(/*String*/formattedString){
	// summary: returns a Date object based on an ISO 8601 formatted string (date only)
	return setIso8601Time(new Date(0, 0), formattedString);
};


/* RFC-3339 Date Functions
 *************************/

var toRfc3339 = function(/*Date?*/dateObject, /*String?*/selector){
//	summary:
//		Format a JavaScript Date object as a string according to RFC 3339
//
//	dateObject:
//		A JavaScript date, or the current date and time, by default
//
//	selector:
//		"dateOnly" or "timeOnly" to format selected portions of the Date object.
//		Date and time will be formatted by default.

//FIXME: tolerate Number, string input?
	if(!dateObject){
		dateObject = new Date();
	}

        // inlined from dojo.string.pad()
	var _ = function(/* string */str, /* integer */len/*=2*/, /* string */ c/*='0'*/, /* integer */dir/*=1*/) {
	//	summary
	//	Pad 'str' to guarantee that it is at least 'len' length with the character 'c' at either the 
	//	start (dir=1) or end (dir=-1) of the string
	var out = String(str);
	if(!c) {
		c = '0';
	}
	if(!dir) {
		dir = 1;
	}
	while(out.length < len) {
		if(dir > 0) {
			out = c + out;
		} else {
			out += c;
		}
	}
	return out;	//	string
        }
	var formattedDate = [];
	if(selector != "timeOnly"){
		var date = [_(dateObject.getFullYear(),4), _(dateObject.getMonth()+1,2), _(dateObject.getDate(),2)].join('-');
		formattedDate.push(date);
	}
	if(selector != "dateOnly"){
		var time = [_(dateObject.getHours(),2), _(dateObject.getMinutes(),2), _(dateObject.getSeconds(),2)].join(':');
		var timezoneOffset = dateObject.getTimezoneOffset();
		time += (timezoneOffset > 0 ? "-" : "+") + 
					_(Math.floor(Math.abs(timezoneOffset)/60),2) + ":" +
					_(Math.abs(timezoneOffset)%60,2);
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
};

var fromRfc3339 = function(/*String*/rfcDate){
//	summary:
//		Create a JavaScript Date object from a string formatted according to RFC 3339
//
//	rfcDate:
//		A string such as 2005-06-30T08:05:00-07:00
//		"any" is also supported in place of a time.

	// backwards compatible support for use of "any" instead of just not 
	// including the time
	if(rfcDate.indexOf("Tany")!=-1){
		rfcDate = rfcDate.replace("Tany","");
	}
	var dateObject = new Date();
	return setIso8601(dateObject, rfcDate); // Date or null
};


////////////////////////////////////////////////////////////////////////////


/**
 *  from  http://delete.me.uk/2005/03/iso8601.html
 *  which is the original source of the dojo parsing too.
 *
 */

var toISO8601String = function (date, format, offset) {
 /* accepted values for the format [1-6]:
 1 Year:
 YYYY (eg 1997)
 2 Year and month:
 YYYY-MM (eg 1997-07)
 3 Complete date:
 YYYY-MM-DD (eg 1997-07-16)
 4 Complete date plus hours and minutes:
 YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
 5 Complete date plus hours, minutes and seconds:
 YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
 6 Complete date plus hours, minutes, seconds and a decimal
 fraction of a second
 YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
 */
    if (!format) { format = 6; }
    if (!offset) {
        offset = 'Z';
    } else {
        var d = offset.match(/([-+])([0-9]{2}):([0-9]{2})/);
        var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
        offsetnum *= ((d[1] == '-') ? -1 : 1);
        date = new Date(Number(Number(date) + (offsetnum * 60000)));
    }

    var zeropad = function (num) { return ((num < 10) ? '0' : '') + num; };

    var str = "";
    str += date.getUTCFullYear();
    if (format > 1) { str += "-" + zeropad(date.getUTCMonth() + 1); }
    if (format > 2) { str += "-" + zeropad(date.getUTCDate()); }
    if (format > 3) {
        str += "T" + zeropad(date.getUTCHours()) +
               ":" + zeropad(date.getUTCMinutes());
    }
    if (format > 5) {
        var secs = Number(date.getUTCSeconds() + "." +
                   ((date.getUTCMilliseconds() < 100) ? '0' : '') +
                   zeropad(date.getUTCMilliseconds()));
        str += ":" + zeropad(secs);
    } else if (format > 4) { str += ":" + zeropad(date.getUTCSeconds()); }

    if (format > 3) { str += offset; }
    return str;
};

////////////////////////////////////////////////////////////////////////////

/**
 *  convert a date specified as an ISO8601 / W3C formatted string
 *  to a javascript Date object.
 */
mjt.freebase.date_from_iso = function (isodate) {
    if (typeof isodate == 'undefined' || isodate === null)
        return NaN;
    return fromIso8601(isodate.toString());
};

/**
 *  convert a a javascript Date object to a string containing
 *  an ISO8601 / W3C formatted representation.
 */

mjt.freebase.date_to_iso = function (d) {
    return toISO8601String(d);
};

    
})(mjt);
