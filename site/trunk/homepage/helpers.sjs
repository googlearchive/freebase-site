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

var exports = {
  "format_stat": format_stat,
  "compute_coverage_percentage": compute_coverage_percentage,
  "lowercase_alphabet": lowercase_alphabet,
  "uppercase_alphabet": uppercase_alphabet
};

var mf = acre.require("MANIFEST").mf;
var h = mf.require("core", "helpers");

function format_stat(number) {
  var abbr = ["K", "M", "B", "T"];
  for (var i=abbr.length; i>0; i--) {
    var power = Math.pow(10, i*3);
    if (number >= power) {
      return Math.round(number / power) + abbr[i-1];
    }
  }
  return ""+number;
}

function compute_coverage_percentage(domain) {
  var last_week = domain.activity.weeks[domain.activity.weeks.length-1];
  return Math.round((last_week.f / last_week.c) * 100);
}

function facts_per_topic(domain) {
  var value = domain.activity.total.e / domain.activity.total.t;
  value = Math.log(value) / Math.LN10;
  return Math.round(value * 10);
}

function lowercase_alphabet() {
  return ['a', 'b', 'c', 'd', 'e', 'f', 
          'g', 'h', 'i', 'j', 'k', 'l', 
          'm', 'n', 'o', 'p', 'q', 'r', 
          's', 't', 'u', 'v', 'w', 'x', 
          'y', 'z'];
}

function uppercase_alphabet() {
  return ['A', 'B', 'C', 'D', 'E', 'F', 
          'G', 'H', 'I', 'J', 'K', 'L', 
          'M', 'N', 'O', 'P', 'Q', 'R', 
          'S', 'T', 'U', 'V', 'W', 'X', 
          'Y', 'Z'];
}

h.extend_helpers(this);
