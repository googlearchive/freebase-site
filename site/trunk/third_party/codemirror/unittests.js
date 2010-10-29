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
 * Test Harness for CodeMirror
 * JS-unit compatible tests here.  The two available assertions are
 * assertEquals (strict equality) and assertEquivalent (looser equivalency).
 *
 * 'editor' is a global object for the CodeMirror editor shared between all
 * tests.  After manipulating it in each test, try to restore it to
 * approximately its original state.
 */

function testSetGet() {
  var code = 'It was the best of times.\nIt was the worst of times.';
  editor.setCode(code);
  assertEquals(code, editor.getCode());
  editor.setCode('');
  assertEquals('', editor.getCode());
}

function testSetStylesheet() {
  function cssStatus() {
    // Returns a list of tuples, for each CSS link return the filename and
    // whether it is enabled.
    links = editor.win.document.getElementsByTagName('link');
    css = [];
    for (var x = 0, link; link = links[x]; x++) {
      if (link.rel.indexOf("stylesheet") !== -1) {
        css.push([link.href.substring(link.href.lastIndexOf('/') + 1),
                 !link.disabled])
      }
    }
    return css;
  }
  assertEquivalent([], cssStatus());
  editor.setStylesheet('css/jscolors.css');
  assertEquivalent([['jscolors.css', true]], cssStatus());
  editor.setStylesheet(['css/csscolors.css', 'css/xmlcolors.css']);
  assertEquivalent([['jscolors.css', false], ['csscolors.css', true], ['xmlcolors.css', true]], cssStatus());
  editor.setStylesheet([]);
  assertEquivalent([['jscolors.css', false], ['csscolors.css', false], ['xmlcolors.css', false]], cssStatus());
}

// Update this list of tests as new ones are added.
var tests = ['testSetGet', 'testSetStylesheet'];

