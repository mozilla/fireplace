define('shothandles', ['core/z'], function(z) {
    function attachHandles(slider, $container) {
        $container.find('.prev, .next').remove();

        var $prevHandle = $('<a class="arrow-button prev"></a>'),
            $nextHandle = $('<a class="arrow-button next"></a>');

        function setHandleState() {
            $prevHandle.addClass('disabled');
            $nextHandle.addClass('disabled');

            if (slider.hasNext()) {
                $nextHandle.removeClass('disabled');
            }
            if (slider.hasPrev()) {
                $prevHandle.removeClass('disabled');
            }
        }

        slider.element.addEventListener('fsmoveend', setHandleState);

        setHandleState();
        $container[0].slider = slider;
        $container.append($prevHandle, $nextHandle);
    }

    z.body.on('click', '.arrow-button:not(.disabled)', function(e) {
        e.preventDefault();
        var slider = this.parentNode.slider;
        if (this.classList.contains('prev')) {
            slider.toPrev();
        } else {
            slider.toNext();
        }
    });

    return {attachHandles: attachHandles};
});
