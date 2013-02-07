define('outgoing_links', ['capabilities', 'z'], function(capabilities, z) {
    function init() {
        // Show the actual URL of outgoing links in the status bar.
        // e.g. http://outgoing.mozilla.org/v1/b2d58f443178ce1de2ef80bb57dcc80211232c8b/http%3A//wvtc.net/
        // ...will display as http://wvtc.net/
        //
        z.win.bind('loaded', function mungeLinks() {

            // Hijack external links if we're within the app.
            if (capabilities.chromeless) {
                $('a[rel=external]').attr('target', '_blank');
            }

            $('a[href^="http://outgoing.mozilla.org"]').each(function(e) {
                var $a = $(this),
                    outgoing = $a.attr('href'),
                    dest = unescape(outgoing.split('/').slice(5).join('/'));
                // Change it to the real destination:
                $a.attr('href', dest);
                if (capabilities.chromeless) {
                    $a.attr('target', '_blank');
                }
                $a.click(function(e) {
                    // Change it to the outgoing URL:
                    $a.attr('href', outgoing);
                    setTimeout(function() {
                        // Put back the real destination:
                        $a.attr('href', dest);
                    }, 100);
                    return true;
                });
            });
        });


        // If we're inside the Marketplace app, open external links in the Browser.
        z.doc.on('click', 'a.external, a[rel=external]', function() {
            if (capabilities.chromeless) {
                $(this).attr('target', '_blank');
            }
        });
    }

    return {init: init};
});
