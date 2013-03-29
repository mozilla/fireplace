define('shothandles', ['utils'], function(utils) {
    function attachHandles(slider, $container) {
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

        $prevHandle.click(utils._pd(function() {
            slider.toPrev();
        }));
        $nextHandle.click(utils._pd(function() {
            slider.toNext();
        }));

        slider.element.addEventListener('fsmoveend', setHandleState);

        setHandleState();
        $container.append($prevHandle, $nextHandle);
    }

    return {attachHandles: attachHandles};
});
