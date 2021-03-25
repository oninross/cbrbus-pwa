'use strict';

import $ from "jquery";
import gsap from "gsap";
import doT from 'dot';

$(() => {
    // Ripple Effect
    var $rippleEffect = $('button, .cta');

    $rippleEffect.on('click', function (e) {
        var $this = $(this);

        if (!$this.hasClass('disabled')) {
            ripple(e, $this);
        }
    });
});



//////////////
// Toaster  //
//////////////
let toasterInd = 0,
    toaster = function (msg = "Toaster message", ttl = 5, isReload = false) {
        // Alert Toaster
        let popupAlert = doT.template($('#toaster-template').html()),
            obj = {
                ind: toasterInd,
                message: msg,
                isReload: isReload
            };

        if (!$('.toaster__wrap').length) {
            $('#main').after('<div class="toaster__wrap" />');
        }

        $('.toaster__wrap').append(popupAlert(obj));

        let toaster = '.toaster' + toasterInd;

        gsap.to(toaster, 0.75, {
            opacity: 1,
            scale: 1,
            ease: "expo.out"
        });

        if (ttl !== 0) {
            gsap.to(toaster, 0.75, {
                opacity: 0,
                scale: 0.75,
                ease: "expo.out",
                delay: ttl,
                onComplete: function () {
                    $(toaster).remove();
                }
            });
        }

        $(toaster).on('click', '.js-dismiss', function (e) {
            e.preventDefault();

            gsap.to($(this).parent(), 0.75, {
                opacity: 0,
                scale: 0.75,
                ease: "expo.out",
                onComplete: function () {
                    $(toaster).remove();
                }
            });
        });

        toasterInd++;
    };

$('body').on('click', '.js-refresh-app', function () {
    window.location.reload();
});




///////////////////
// Ripple Effect //
///////////////////
let inc = 0;
let ripple = function (e, el) {
    if ($('.no-svg').length || el.find('svg').length) {
        return false;
    }

    // create SVG element
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
        x = e.offsetX,
        y = e.offsetY;

    if (x == undefined) {
        return false;
    }

    svg.setAttributeNS(null, 'class', 'ripple ripple' + inc);
    g.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')');
    circle.setAttributeNS(null, 'r', (parseInt(el.outerWidth()) + x));

    svg.appendChild(g);
    g.appendChild(circle);
    el.append(svg);

    var $ripple = el.find('.ripple' + inc);
    gsap.from($ripple.find('circle'), 1.5, {
        attr: { r: 0 },
        opacity: 0.75,
        ease: "expo.out",
        onComplete: function () {
            $ripple.remove();
        }
    });

    inc++;
};

export { toaster, ripple };
