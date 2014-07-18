define('buckets', [], function() {

    function build() {
        function noop() {return '';}

        var aelem = document.createElement('audio');
        var velem = document.createElement('video');

        // Compatibilty with PhantomJS, which doesn't implement canPlayType
        if (!('canPlayType' in aelem)) {
            velem = aelem = {canPlayType: noop};
        }

        var prefixes = ['moz', 'webkit', 'ms'];

        function prefixed(property, context) {
            if (!context) {
                context = window;
            }
            try {
                if (context[property] !== undefined) {
                    return context[property];
                }
            } catch(e) {
                return false;
            }
            // Camel-case it.
            property = property[0].toUpperCase() + property.substr(1);

            for (var i = 0, e; e = prefixes[i++];) {
                try {
                    if (context[e + property] !== undefined) {
                        return context[e + property];
                    }
                } catch(err) {
                    return false;
                }
            }
        }

        var has_gum = prefixed('getUserMedia', navigator);
        if (has_gum && navigator.mozGetUserMedia) {
            // Gecko 18's gum is a noop.
            try {
                navigator.mozGetUserMedia(); // Should throw a TypeError.
                has_gum = false;
            } catch(e) {}
        }

        var audiocontext = window.webkitAudioContext || window.AudioContext;
        var has_audiocontext = !!(audiocontext);

        return [
            navigator.mozApps !== undefined,
            navigator.mozApps !== undefined && navigator.mozApps.installPackage !== undefined,
            navigator.mozPay !== undefined,
            // FF 18 and earlier throw an exception on this key
            (function() {try{return !!window.MozActivity;} catch(e) {return false;}})(),
            window.ondevicelight !== undefined,
            window.ArchiveReader !== undefined,
            navigator.battery !== undefined,
            navigator.mozBluetooth !== undefined,
            navigator.mozContacts !== undefined,
            navigator.getDeviceStorage !== undefined,
            (function() { try{return window.mozIndexedDB || window.indexedDB;} catch(e) {return false;}})(),
            navigator.geolocation !== undefined && navigator.geolocation.getCurrentPosition !== undefined,
            navigator.addIdleObserver !== undefined && navigator.removeIdleObserver,
            navigator.mozConnection !== undefined && (navigator.mozConnection.metered === true || navigator.mozConnection.metered === false),
            navigator.mozNetworkStats !== undefined,
            window.ondeviceproximity !== undefined,
            navigator.mozPush !== undefined || navigator.push !== undefined,
            window.ondeviceorientation !== undefined,
            navigator.mozTime !== undefined,
            navigator.vibrate !== undefined,
            navigator.mozFM !== undefined || navigator.mozFMRadio !== undefined,
            navigator.mozSms !== undefined,
            !!((window.ontouchstart !== undefined) || window.DocumentTouch && document instanceof DocumentTouch),
            window.screen.width <= 540 && window.screen.height <= 960,  // qHD support
            !!aelem.canPlayType('audio/mpeg').replace(/^no$/, ''),  // mp3 support
            !!(window.Audio),  // Audio Data API
            has_audiocontext,  // Web Audio API
            !!velem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,''),  // H.264
            !!velem.canPlayType('video/webm; codecs="vp8"').replace(/^no$/,''),  // WebM
            !!prefixed('cancelFullScreen', document),  // Full Screen API
            !!prefixed('getGamepads', navigator),  // Gamepad API
            !!(prefixed('persistentStorage') || window.StorageInfo),  // Quota Management API
            // WebRTC:
            has_gum && !prefixed('cameras', navigator),  // Can take photos
            has_gum && has_audiocontext &&
                !!((new audiocontext()).createMediaStreamSource),  // Can record audio
            has_gum && false,  // XXX: Google WebRTC issue 2088
            window.MediaStream !== undefined,
            window.DataChannel !== undefined,
            prefixed('RTCPeerConnection'),
            prefixed('SpeechSynthesisEvent'),  // WebSpeech Synthesis
            prefixed('SpeechInputEvent'),  // WebSpeech Input
            prefixed('requestPointerLock', document.documentElement),  // Pointer lock
            prefixed('notification', navigator),  // TODO: window.webkitNotifications?
            prefixed('alarms', navigator),  // Alarms
            (new XMLHttpRequest()).mozSystem !== undefined,  // mozSystemXHR
            prefixed('TCPSocket', navigator),  // mozTCPSocket/mozTCPSocketServer
            prefixed('mozInputMethod', navigator),
            prefixed('mozMobileConnections', navigator)
        ];
    }

    var capabilities = [];  // build(); - deactivated for now because of false positives and performance problems on some devices. See bug 1003266. 
    var profile = parseInt(capabilities.map(function(x) {return !!x ? '1' : '0';}).join(''), 2).toString(16);
    // Add a count.
    profile += '.' + capabilities.length;
    // Add a version number.
    profile += '.4';

    return {
        capabilities: capabilities,
        profile: profile
    };

});
