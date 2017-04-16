import 'jquery.cookie';

'use strict';

export default class AppBanner {
    constructor() {
        let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
            addToHomeScreeen = $.cookie('addToHomeScreeen') == undefined ? false : $.cookie('addToHomeScreeen');

        if (iOS && !addToHomeScreeen) {
            $('#app-banner').addClass('show');
            $('html').addClass('iOS');
            
            $('.js-dismiss').on('click', function () {
                $.cookie('addToHomeScreeen', true, { path: '/' });
                $('#app-banner').removeClass('show');
            });
        }
    }
}
