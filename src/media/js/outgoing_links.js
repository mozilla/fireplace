define('outgoing_links', ['capabilities', 'z'], function(capabilities, z) {

    // Show the actual URL of outgoing links in the status bar.
    // e.g. http://outgoing.mozilla.org/v1/b2d58f443178ce1de2ef80bb57dcc80211232c8b/http%3A//wvtc.net/
    // ...will display as http://wvtc.net/
    //

    var outbound = 'a[href^="http://outgoing.mozilla.org"]';

    z.win.on('loaded', function() {
        // Hijack external links if we're within the app.
        if (capabilities.chromeless) {
            $('a[rel=external], a[href*="://"], ' + outbound).attr('target', '_blank');
        }

        $(outbound).each(function() {
            var outgoing = this.getAttribute('href'),
                dest = unescape(outgoing.split('/').slice(5).join('/'));
            // Change it to the real destination:
            this.setAttribute('data-orig-href', outgoing);
            this.setAttribute('href', dest);
        });
    });

    // If we're inside the Marketplace app, open external links in the Browser.
    z.page.on('click', 'a.external, a[rel=external]', function() {
        if (capabilities.chromeless) {
            $(this).attr('target', '_blank');
        }
    }).on('click', 'a[data-orig-href]', function() {
        var el = this;
        var href = el.getAttribute('href');
        el.setAttribute('href', el.getAttribute('data-orig-href'));
        window.setTimeout(function() {
            // Put back the real destination:
            el.setAttribute('href', href);
        }, 100);
    });
});
