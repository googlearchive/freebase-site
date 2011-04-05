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

(function($) {
  /**
   * Given the following markup pattern:
   *
   * <div class="image-stack">
   *   <a href="#foo" class="img-stack-item"><img src="image-01.jpg" /></a>
   *   <a href="#foo" class="img-stack-item"><img src="image-02.jpg" /></a>
   *   <a href="#foo" class="img-stack-item"><img src="image-03.jpg" /></a>
   *   etc…
   * </div>
   *
   * $(".image_stack").stack_images();
   *
   * Will do the following:
   *
   * 1. Find all images inside the selector
   * 2. Determine a count of said images
   * 3. Apply appropriate z-index value for each image
   * 4. Apply random css3 rotation value
   */
  $.fn.stack_images = function() {
    
    console.log(this);
    return this.each(function(){

      // Get the images and total count
      var images = $(this).children(".img-stack-item");
      var image_count = images.length;

      images.each(function(index){
        var $img = $(this);

        // z-index to be applied to image
        var z_index = image_count - index;

        // rotation value to be applied to image
        var rotate_amount = Math.floor(Math.random() * 1000) % 10;

        // If we're on the first (top) image, set rotation to 0
        var rotation = '-' + rotate_amount + 'deg';
        if ((index) === 0 ) {
          rotation = '0deg';
        }
        
        $img.css({
          "z-index": z_index, 
          "-webkit-transform": "rotate(" + rotation + ")",
          "-moz-transform": "rotate(" + rotation + ")"
        })

      }); 

    });
  }
   
}) (jQuery);
