define('linefit', ['jquery'], function($) {
    $.fn.linefit = function(lines) {
        // This function shrinks text to fit on one line.
        var min_font_size = 7;
        lines = lines || 1;
        return this.each(function() {
            this.innerHTML = '<span class="linefitted">' + this.innerHTML + '</span>';
            var $span = $(this).find('span'),
                span = $span.get(0),
                fs = parseFloat($span.css('font-size').replace('px', '')),
                nb_rects = span.getClientRects().length;
            while (nb_rects > lines && fs > min_font_size) {
                // Repeatedly shrink the text by 0.5px until all the text fits.
                fs -= 0.5;
                $span.css('font-size', fs);
                nb_rects = span.getClientRects().length;
            }
        });
    };
});
