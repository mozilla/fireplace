define('header', ['capabilities', 'z'], function(capabilities, z) {
    // We would use :hover, but we want to hide the menu on fragment load!
    if (capabilities.desktop) {
        $('.act-tray').on('mouseover', function() {
            $('.act-tray').addClass('active');
        }).on('mouseout', function() {
            $('.act-tray').removeClass('active');
        }).on('click', '.account-links a', function() {
            $('.account-links, .settings').removeClass('active');
        });
        z.page.on('loaded', function() {
            $('.account-links, .settings').removeClass('active');
        });
    }
});
