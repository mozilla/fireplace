/**
  * TextOverflowClamp.js
  *
  * Updated 2013-05-09 to remove jQuery dependancy.
  * But be careful with webfonts!
  *
  * http://codepen.io/chriscoyier/pen/iBtep
  */

define('textoverflowclamp', ['jquery'], function($) {
    var clamp, $measure, text, lineWidth,
        lineStart, lineCount, wordStart,
        $line, lineText, wasNewLine;

    // measurement element is made a child of the clamped
    // element to get its style
    $measure = $('<span>').addClass('msr');

    return function(el, lineClamp) {
        var $el = $(el);

        // reset to safe starting values
        lineStart = wordStart = 0;
        lineCount = 1;
        wasNewLine = false;
        lineWidth = $el.width();

        // get all the text, remove any line changes
        text = $el.text().replace(/\n/g, ' ');
        $el.empty();

        // add measurement element within so it inherits styles
        $el.append($measure);

        // http://ejohn.org/blog/search-and-dont-replace/
        text.replace(/ /g, function(m, pos) {
            // ignore any further processing if we have total lines
            if (lineCount === lineClamp) return;
            // create a text node and place it in the measurement element
            $measure.text(text.substr(lineStart, pos - lineStart));
            // have we exceeded allowed line width?
            if (lineWidth < $measure.width()) {
                if (wasNewLine) {
                    // we have a long word so it gets a line of it's own
                    lineText = text.substr(lineStart, pos + 1 - lineStart);
                    // next line start position
                    lineStart = pos + 1;
                } else {
                    // grab the text until this word
                    lineText = text.substr(lineStart, wordStart - lineStart);
                    // next line start position
                    lineStart = wordStart;
                }
                // create a line element
                $line = $('<span>').text(lineText);
                $el.append($line);

                // yes, we created a new line
                wasNewLine = true;
                lineCount++;
            } else {
                // did not create a new line
                wasNewLine = false;
            }
            // remember last word start position
            wordStart = pos + 1;
            // clear measurement element
            $measure.find('span:first-child').remove();
        });
        // remove the measurement element from the container
        $measure.remove();
        // create the last line element
        $line = $('<span>').addClass('clamped');

        // add all remaining text to the line element
        $line.text(text.substr(lineStart));
        // add the line element to the container
        $el.append($line);
    }
});
