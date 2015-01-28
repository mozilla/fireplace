define('shothandles', ['z'], function(z) {
    function attachHandles(slider, $container) {
        $container.find('.prev, .next').remove();

        var $prevHandle = $('<a href="#" class="arrow-button prev"></a>'),
            $nextHandle = $('<a href="#" class="arrow-button next"></a>');

        function setHandleState() {
            $prevHandle.hide();
            $nextHandle.hide();

            if (slider.hasNext()) {
                $nextHandle.show();
            }
            if (slider.hasPrev()) {
                $prevHandle.show();
            }
        }

        slider.element.addEventListener('fsmoveend', setHandleState);

        setHandleState();
        $container[0].slider = slider;
        $container.append($prevHandle, $nextHandle);
    }

    z.body.on('click', '.arrow-button', function(e) {
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
