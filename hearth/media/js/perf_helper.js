/* Adapted from
   https://raw.githubusercontent.com/mozilla-b2g/gaia/master/shared/js/performance_testing_helper.js */
define('perf_helper', [], function() {
    'use strict';

     function dispatch(name) {
       if (!window.mozPerfHasListener) {
         return;
       }

       var now = window.performance.now();

       setTimeout(function() {
         var detail = {
           name: name,
           timestamp: now
         };
         var event = new CustomEvent('x-moz-perf', { detail: detail });

         window.dispatchEvent(event);
       });
     }

     [
       'moz-chrome-dom-loaded',
       'moz-chrome-interactive',
       'moz-app-visually-complete',
       'moz-content-interactive',
       'moz-app-loaded'
     ].forEach(function(eventName) {
         window.addEventListener(eventName, function mozPerfLoadHandler() {
           dispatch(eventName);
         }, false);
       });

     window.PerformanceTestingHelper = {
       dispatch: dispatch
     };
});
