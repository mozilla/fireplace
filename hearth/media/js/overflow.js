// Checks buttons for overflowing text and makes them wider if necessary.
// - Currently only deals with infobox buttons.
define('overflow', [], function() {

    // If this happens elsewhere we can target `.button` and use the
    // .closest() parent to apply "overflowing" to.
    var $infobox = $('.infobox.support');

    $infobox.find('ul.c a').each(function() {
        if (this.scrollWidth > $(this).innerWidth()) {
            $infobox.addClass('overflowing');
            return;
        }
    });
});
