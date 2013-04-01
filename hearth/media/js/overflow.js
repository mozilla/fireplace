// Checks buttons for overflowing text and makes them wider if necessary.
// - Currently only deals with infobox buttons.
define('overflow', [], function() {
    function init() {
        var $infobox = $('.infobox');

        $infobox.find('ul.c a').each(function() {
            if (this.scrollWidth > $(this).innerWidth()) {
                $infobox.addClass('overflowing');
                return;
            }
        });
    }

    return {init: init};
});
