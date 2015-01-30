/*
* A carousel that is mostly intended for the desktop promo. Offsets are
* managed in CSS so the JS doesn't deal with that. The carousel only
* supports cycling and requires at least as many items as are visible at
* rest.
*
* Flexbox ordering is used to reorder the items without modifying the DOM.
* Cycling works by cloning the desktop-promo-items for use as
* placeholders. When at rest there are no placeholders visible. When the
* carousel is rotating one placeholder will be shown in the position of
* the item that is cycling around to the other side.
*
* <div class="desktop-promo">
*   <div class="desktop-promo-nav-left">&lt;</div>
*   <div class="desktop-promo-items">
*     <div class="desktop-promo-item">My awesome content!</div>
*     <!-- Insert more awesome content -->
*   </div>
*   <div class="desktop-promo-nav-right">&gt;</div>
* </div>
*/

define('mkt-carousel', ['core/defer'], function (defer) {
    function initialize() {
        var root = document.querySelector('.desktop-promo');
        var desktopPromo = root.querySelector('.desktop-promo-items');
        var promoItems = Array.prototype.slice.call(desktopPromo.children);
        var placeholderItems = promoItems.map(function(item) {
            var placeholder = item.cloneNode(true);
            placeholder.classList.add('desktop-promo-placeholder-item');
            desktopPromo.appendChild(placeholder);
            return placeholder;
        });
        var transitioning = false;

        // Shuffle the items once so that the first item is centered.
        // [1, 2, 3] ~> [3, 1, 2]
        cycleRight(promoItems);
        cycleRight(placeholderItems);

        function setOrder(el, i) {
            el.style['-webkit-order'] = i;
            el.style.order = i;
        }

        function setPromoItemsOrder() {
            promoItems.forEach(function (item, i) {
                setOrder(item, i);
                if (i === 0) {
                    item.setAttribute('data-navigate', 'prev');
                } else if (i === 2) {
                    item.setAttribute('data-navigate', 'next');
                } else {
                    item.removeAttribute('data-navigate');
                }
            });
        }

        function showPlaceholder(placeholder, position) {
            placeholder.classList.add('desktop-promo-placeholder-item-shown');
            var placeholderIndex = position ===  'right' ? promoItems.length : -1;
            setOrder(placeholder, placeholderIndex);
        }

        function hidePlaceholder(placeholder) {
            // Remove the placeholder.
            placeholder.classList.remove('desktop-promo-placeholder-item-shown');
        }

        function setItemsOffset(position) {
            desktopPromo.setAttribute('data-action', position);
        }

        function animateItemsOffset(position) {
            if (['left', 'center'].indexOf(position) === -1) {
                console.error('animating non animated promo offset');
            }

            transitioning = true;
            var transitionDone = defer.Deferred();
            setItemsOffset(position);
            afterTransition(function () {
                transitioning = false;
                transitionDone.resolve();
            });
            return transitionDone.promise();
        }

        function afterTransition(callback) {
            // Hide the placeholder after the transition ends.
            desktopPromo.addEventListener('transitionend', function animationDone() {
                callback();
                // Remove this event listener.
                desktopPromo.removeEventListener('transitionend', animationDone);
            });
        }

        function waitForRedraw(callback) {
            // Wait for the second animation frame because Firefox seems to perform
            // the first request in the same cycle.
            requestAnimationFrame(function () {
                requestAnimationFrame(callback);
            });
        }

        function cycleRight(array) {
            var centerItem = array.pop();
            array.unshift(centerItem);
            return centerItem;
        }

        function cycleLeft(array) {
            var centerItem = array.shift();
            array.push(centerItem);
            return centerItem;
        }

        function shiftRight() {
            var wrappingItem = cycleRight(promoItems);
            var placeholder = cycleRight(placeholderItems);
            setPromoItemsOrder();
            showPlaceholder(placeholder, 'right');
            setItemsOffset('right');

            waitForRedraw(function () {
                animateItemsOffset('center').then(function () {
                    hidePlaceholder(placeholder);
                    setItemsOffset('start');
                });
            });
        }

        function shiftLeft() {
            var wrappingItem = cycleLeft(promoItems);
            var placeholder = cycleLeft(placeholderItems);
            setPromoItemsOrder();
            showPlaceholder(placeholder, 'left');
            animateItemsOffset('left').then(function () {
                setItemsOffset('start');
                hidePlaceholder(placeholder);
            });
        }

        root.addEventListener('click', function (e) {
            if (transitioning) {
                return;
            }
            if (e.target.getAttribute('data-navigate') === 'prev') {
                e.preventDefault();
                e.stopPropagation();
                shiftRight();
            } else if (e.target.getAttribute('data-navigate') === 'next') {
                e.preventDefault();
                e.stopPropagation();
                shiftLeft();
            }
        });

        setPromoItemsOrder();

        return {
            shiftLeft: shiftLeft,
            shiftRight: shiftRight,
            transitioning: transitioning,
        };
    }

    return {initialize: initialize};
});
