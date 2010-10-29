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

/* A few useful utility functions. */

// Capture a method on an object.
function method(obj, name) {
  return function() {obj[name].apply(obj, arguments);};
}

// The value used to signal the end of a sequence in iterators.
var StopIteration = {toString: function() {return "StopIteration"}};

// Apply a function to each element in a sequence.
function forEach(iter, f) {
  if (iter.next) {
    try {while (true) f(iter.next());}
    catch (e) {if (e != StopIteration) throw e;}
  }
  else {
    for (var i = 0; i < iter.length; i++)
      f(iter[i]);
  }
}

// Map a function over a sequence, producing an array of results.
function map(iter, f) {
  var accum = [];
  forEach(iter, function(val) {accum.push(f(val));});
  return accum;
}

// Create a predicate function that tests a string againsts a given
// regular expression. No longer used but might be used by 3rd party
// parsers.
function matcher(regexp){
  return function(value){return regexp.test(value);};
}

// Test whether a DOM node has a certain CSS class. Much faster than
// the MochiKit equivalent, for some reason.
function hasClass(element, className){
  var classes = element.className;
  return classes && new RegExp("(^| )" + className + "($| )").test(classes);
}

// Insert a DOM node after another node.
function insertAfter(newNode, oldNode) {
  var parent = oldNode.parentNode;
  parent.insertBefore(newNode, oldNode.nextSibling);
  return newNode;
}

function removeElement(node) {
  if (node.parentNode)
    node.parentNode.removeChild(node);
}

function clearElement(node) {
  while (node.firstChild)
    node.removeChild(node.firstChild);
}

// Check whether a node is contained in another one.
function isAncestor(node, child) {
  while (child = child.parentNode) {
    if (node == child)
      return true;
  }
  return false;
}

// The non-breaking space character.
var nbsp = "\u00a0";
var matching = {"{": "}", "[": "]", "(": ")",
                "}": "{", "]": "[", ")": "("};

// Standardize a few unportable event properties.
function normalizeEvent(event) {
  if (!event.stopPropagation) {
    event.stopPropagation = function() {this.cancelBubble = true;};
    event.preventDefault = function() {this.returnValue = false;};
  }
  if (!event.stop) {
    event.stop = function() {
      this.stopPropagation();
      this.preventDefault();
    };
  }

  if (event.type == "keypress") {
    event.code = (event.charCode == null) ? event.keyCode : event.charCode;
    event.character = String.fromCharCode(event.code);
  }
  return event;
}

// Portably register event handlers.
function addEventHandler(node, type, handler, removeFunc) {
  function wrapHandler(event) {
    handler(normalizeEvent(event || window.event));
  }
  if (typeof node.addEventListener == "function") {
    node.addEventListener(type, wrapHandler, false);
    if (removeFunc) return function() {node.removeEventListener(type, wrapHandler, false);};
  }
  else {
    node.attachEvent("on" + type, wrapHandler);
    if (removeFunc) return function() {node.detachEvent("on" + type, wrapHandler);};
  }
}

function nodeText(node) {
  return node.textContent || node.innerText || node.nodeValue || "";
}

function nodeTop(node) {
  var top = 0;
  while (node.offsetParent) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return top;
}

function isBR(node) {
  var nn = node.nodeName;
  return nn == "BR" || nn == "br";
}
function isSpan(node) {
  var nn = node.nodeName;
  return nn == "SPAN" || nn == "span";
}
