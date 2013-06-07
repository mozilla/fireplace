define('shothandles', ['utils'], function(utils) {
    function attachHandles(slider, $container) {
        $container.find('.prev, .next').remove();

        var $prevHandle = $('<a href="#" class="prev"></a>'),
            $nextHandle = $('<a href="#" class="next"></a>');

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

        $prevHandle.on('click', utils._pd(function() {
            slider.toPrev();
        }));
        $nextHandle.on('click', utils._pd(function() {
            slider.toNext();
        }));

        slider.element.addEventListener('fsmoveend', setHandleState);

        setHandleState();
        $container.append($prevHandle, $nextHandle);
    }

    return {attachHandles: attachHandles};
});
