/*
    Arrow buttons for navigating back and forth in a preview tray that tell
    Flipsnap what to do.

    - Buttons disabled if there is no room to scroll left or right.
    - We limit Flipsnap's max scroll position by 1 so we cant't scroll too far.
    - If no room to scroll left or right (e.g., not enough previews), hide
      buttons completely.
*/
define('previews-buttons',
    ['core/capabilities', 'core/z'],
    function(caps, z) {
    'use strict';
    var isDesktop = caps.device_type() === 'desktop';

    function attach(slider, $container, opts) {
        if (!isDesktop) {
            return;
        }
        var isLightbox = opts && opts.isLightbox;

        $container.find('.arrow-btn-prev, .arrow-btn-next').remove();

        var $prevBtn = $('<a class="arrow-btn arrow-btn-prev"></a>');
        var $nextBtn = $('<a class="arrow-btn arrow-btn-next"></a>');
        var $previewBtns = $prevBtn.add($nextBtn);

        function setPreviewBtnState() {
            // Toggles whether buttons are hidden or disabled.
            $previewBtns.addClass('arrow-btn-disabled');

            var hasButton = false;
            if (slider.hasNext() &&
                (slider.currentPoint < slider.numBars - 1 || isLightbox)) {
                // Only show the Next button if there're more previews to see.
                $nextBtn.removeClass('arrow-btn-disabled');
                hasButton = true;
            }
            if (slider.hasPrev()) {
                $prevBtn.removeClass('arrow-btn-disabled');
                hasButton = true;
            }

            if (!isLightbox) {
                // Always show button for lightbox.
                $previewBtns.toggle(hasButton);
            }
        }

        slider.element.addEventListener('fsmoveend', setPreviewBtnState);
        $(slider.tray).on('previews--button-update', setPreviewBtnState);

        setPreviewBtnState();
        $container[0].slider = slider;
        $container.append($previewBtns);

        return {
            prevBtn: $prevBtn[0],
            nextBtn: $nextBtn[0],
        };
    }

    z.body.on('click', '.arrow-btn:not(.arrow-btn-disabled)', function(e) {
        e.preventDefault();
        var slider = this.parentNode.slider;
        if (this.classList.contains('arrow-btn-prev')) {
            slider.toPrev();
        } else {
            slider.toNext();
        }
    });

    return {
        attach: attach
    };
});
