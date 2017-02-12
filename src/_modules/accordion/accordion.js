'use strict';

import { easeOutExpo } from '../../_assets/btt/js/_helper';

export default class Accordion {
    constructor() {
        $('.accordion__header').on('click', function (e) {
            e.preventDefault();

            $(this).find('.accordion__btn').trigger('click');
        });

        $('.accordion__btn').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            let $this = $(this),
                $parent = $this.parent(),
                $next = $parent.next();

            $this.toggleClass('active');
            $next.slideToggle(easeOutExpo);
        });
    }
}
