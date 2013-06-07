define('common/linefit', ['jquery'], function($) {
    $.fn.linefit = function(lines) {
        // This function shrinks text to fit on one line.
        var min_font_size = 7;
        lines = lines || 1;
        return this.each(function() {
            var $this = $(this),
                fs = parseFloat($this.css('font-size').replace('px', '')),
                max_height = Math.ceil(parseFloat($this.css('line-height').replace('px', ''))) * lines,
                height = $this.height();
            while (height > max_height && fs > min_font_size) {
                // Repeatedly shrink the text by 0.5px until all the text fits.
                fs -= .5;
                $this.css('font-size', fs);
                height = $this.height();
            }
        });
    };
});
