'use strict';

import { easeOutExpo } from '../../_assets/btt/js/_helper';
import scrollTo from 'scrollTo';

export default class Accordion {
    constructor() {
        if ($('.accordion').length) {
            $('.accordion__header').on('click', function (e) {
                e.preventDefault();

                $(this).find('.accordion__btn').trigger('click');
            });

            $('.accordion__btn').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let $this = $(this),
                    $parent = $this.parent(),
                    $next = $parent.next(),
                    $accordion = $this.closest('.accordion');

                $this.toggleClass('active');
                $next.slideToggle(easeOutExpo);

                TweenMax.to(window, 1, {
                    scrollTo: $accordion.offset().top - $('.header').outerHeight(),
                    ease: Expo.easeOut,
                    delay: 0.5
                });
            });
        }
    }
}
