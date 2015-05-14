define('truncator',
    ['core/utils', 'core/z', 'jquery'],
    function(utils, z, $) {

    return {
        init: function() {
            z.page.on('click', '.truncate-toggle', utils._pd(function() {
                // Toggle description.
                var $this = $(this);
                $this.prev('.truncated-wrapper').toggleClass('truncated');
                $this.remove();
            }));
            this.init = function() {};
        },
        removeUntruncated: function() {
            $('.truncated-wrapper').each(function() {
                // 'truncated' class applied by default, remove if unneeded.
                var $this = $(this);
                if ($this.prop('scrollHeight') <= $this.prop('offsetHeight')) {
                    $this.removeClass('truncated')
                         .next('.truncate-toggle')
                         .hide();
                }
            });
        },
    };
});
