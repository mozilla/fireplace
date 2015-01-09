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

define('mkt-carousel', ['defer'], function (defer) {
    function initialize() {
        var root = document.querySelector('.desktop-promo');
        var previousButton = root.querySelector('.desktop-promo-nav-left');
        var nextButton = root.querySelector('.desktop-promo-nav-right');
        var desktopPromo = root.querySelector('.desktop-promo-items');
        var promoItems = Array.prototype.slice.call(desktopPromo.children);
        var placeholderItems = promoItems.map(function(item) {
            var placeholder = item.cloneNode(true);
            placeholder.classList.add('desktop-promo-placeholder-item');
            desktopPromo.appendChild(placeholder);
            return placeholder;
        });
        var transitioning = false;

        function setOrder(el, i) {
            el.style['-webkit-order'] = i;
            el.style.order = i;
        }

        function setPromoItemsOrder() {
            promoItems.forEach(setOrder);
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

        function shiftRight() {
            // Cycle the promo items.
            var wrappingItem = promoItems.pop();
            promoItems.unshift(wrappingItem);

            // Cycle the placeholder items.
            var placeholder = placeholderItems.pop();
            placeholderItems.unshift(placeholder);

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
            // Cycle the promo items.
            var wrappingItem = promoItems.shift();
            promoItems.push(wrappingItem);

            // Cycle the placeholder items.
            var placeholder = placeholderItems.shift();
            placeholderItems.push(placeholder);

            setPromoItemsOrder();
            showPlaceholder(placeholder, 'left');
            animateItemsOffset('left').then(function () {
                setItemsOffset('start');
                hidePlaceholder(placeholder);
            });
        }

        previousButton.addEventListener('click', function () {
            if (!transitioning) {
                shiftRight();
            }
        });

        nextButton.addEventListener('click', function () {
            if (!transitioning) {
                shiftLeft();
            }
        });

        return {
            shiftLeft: shiftLeft,
            shiftRight: shiftRight,
            transitioning: transitioning,
        };
    }

    return {initialize: initialize};
});
