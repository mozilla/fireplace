define('common/linefit', ['jquery'], function($) {
    $.fn.linefit = function(lines) {
        // This function shrinks text to fit on one line.
        var min_font_size = 7;
        lines = lines || 1;
        return this.each(function() {
            this.innerHTML = '<span class="linefitted">' + this.innerHTML + '</span>';
            var $span = $(this).find('span'),
                fs = parseFloat($span.css('font-size').replace('px', '')),
                max_height = Math.ceil(parseFloat($span.css('line-height').replace('px', ''))) * lines,
                height = $span.height();
            if (+height > +max_height * 2) {
                // It's more than one line.
                while (height > max_height && fs > min_font_size) {
                    // Repeatedly shrink the text by 0.5px until all the text fits.
                    fs -= .5;
                    $span.css('font-size', fs);
                    height = $span.height();
                }
            }
        });
    };
});
