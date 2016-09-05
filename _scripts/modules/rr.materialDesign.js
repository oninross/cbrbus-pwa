/* global RR: true, TweenMax: true, TimelineMax: true, jQuery: true, ripple: true, Ease: true, Expo: true, scrollMonitor: true */
/* jshint unused: false, strict: false */

/**
 * RR - Material Design Components
 */
var RR = (function (parent, $) {
    'use strict';

    var $body = $('body'),
        $window = $(window),
        isMobileDevice = $window.width() < 1024 ? 1 : 0;

    // Select Box Beautifier
    $.fn.materialize = function () {
        return this.each(function () {
            var $this = $(this),
                $label = $('<span class = "material-label"/>'),
                $arrow = $('<span class = "icon icon-chevron-down"/>'),
                $wrapper = $('<div class = "material-select-wrapper js-material-drop"/>'),
                $wrapperNative = $('<div class = "material-select-wrapper native js-material-drop"/>'),
                markup = '';

            if ($this.hasClass('native')) {
                $this.wrap($wrapperNative);
            } else {
                $this.wrap($wrapper);
            }

            $this
                .before($label)
                .before($arrow)
                .on('change', function (e) {
                    $label.text($this.find(':selected').text());
                });

            $label.text($this.find(':selected').text());

            markup += '<div class="card-wrapper"><ul>';

            $this.find('option').each(function () {
                var $that = $(this);

                if ($that.is(':selected')) {
                    markup += '<li class="active"><button>' + $that.text() + '</button></li>';
                } else {
                    markup += '<li><button>' + $that.text() + '</button></li>';
                }
            });

            markup += '</ul></div>';

            $this.after(markup);

            $this.parent().on('click', '.material-label', function () {
                var $this = $(this),
                    $parent = $this.parent(),
                    $card = $this.parent().find('.card-wrapper');

                if ($parent.hasClass('native') && isMobileDevice) {
                    return false;
                }

                if ($this.hasClass('active')) {
                    TweenMax.to($card, 0.25, {
                        autoAlpha: 0,
                        scale: 0.75,
                        ease: Expo.easeOut,
                        onComplete: function () {
                            TweenMax.set($card.find('li'), {
                                opacity: 1,
                                top: 0
                            });
                        }
                    });
                } else {
                    var activeInd = $card.find('.active').index(),
                        materialDropPos = $('.material-select-wrapper .card-wrapper li').outerHeight() * activeInd;

                    TweenMax.to($card, 0.25, {
                        autoAlpha: 1,
                        scale: 1,
                        top: -materialDropPos,
                        ease: Expo.easeOut
                    });

                    TweenMax.staggerTo($card.find('li'), 1, {
                        opacity: 1,
                        top: 0,
                        ease: Expo.easeOut,
                        delay: 0.3
                    }, 0.1);
                }

                $this.toggleClass('active');

                $card.addClass('active').mCustomScrollbar('scrollTo', 0);

                $window.on('resize scroll', debounce(listener, 250));
            }).on('click', 'button', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $cardWrapper = $this.parents('.card-wrapper'),
                    $materialSelectWrapper = $this.parents('.material-select-wrapper'),
                    $parent = $this.parent(),
                    ind = $parent.index() + 1,
                    selectedValue = $materialSelectWrapper.find('select option:nth-child(' + ind + ')').val();

                if ($parent.hasClass('native') && isMobileDevice) {
                    return false;
                }

                $materialSelectWrapper.find('.active').removeClass('active');
                $parent.addClass('active');

                TweenMax.to($cardWrapper, 0.25, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeIn,
                    onComplete: function () {
                        TweenMax.set($cardWrapper.find('li'), { opacity: 0, top: -20 });
                    }
                });

                $materialSelectWrapper
                    .find('select').val(selectedValue).trigger('change').end()
                    .find('.material-label').text($this.text());

                $window.off('resize scroll', listener, 250);
            });

            $this.next().mCustomScrollbar({
                setTop: 0,
                setHeight: 250,
                theme: 'minimal-dark',
                scrollbarPosition: 'outside'
                // SET SCROLLABALE
            });

            $body.on('click', function (e) {
                var $eTarget = $(e.target),
                    $materialSelectWrapper = $('.material-select-wrapper'),
                    $cardWrapper = $('.material-select-wrapper .card-wrapper');

                if (!$eTarget.hasClass('material-select-wrapper') && !$eTarget.parents('.material-select-wrapper').length) {
                    $materialSelectWrapper.find('.material-label').removeClass('active');

                    TweenMax.to($cardWrapper, 0.25, {
                        autoAlpha: 0,
                        scale: 0,
                        top: 0,
                        ease: Expo.easeInOut,
                        onComplete: function () {
                            TweenMax.set($cardWrapper.find('li'), {
                                opacity: 0,
                                top: -20
                            });
                        }
                    });

                    $window.off('resize scroll', debounce(listener, 250));
                }
            });

            function listener() {
                $('.material-select-wrapper').find('.material-label').removeClass('active');

                TweenMax.to('.material-select-wrapper .card-wrapper', 0.5, {
                    autoAlpha: 0,
                    scale: 0,
                    top: 0,
                    ease: Expo.easeIn,
                    onComplete: function () {
                        TweenMax.set('.material-select-wrapper .card-wrapper li', {
                            opacity: 0,
                            top: -20
                        });
                    }
                });

                $window.off('resize scroll', debounce(listener, 250));
            };
        });
    };

    var setup = function () {

        // Ripple Effect
        var $rippleEffect = $('button, .cta');

        $rippleEffect.on('click', function (e) {
            var $this = $(this);

            if (!$this.hasClass('disabled')) {
                ripple(e, $this);
            }
        });


        // Hamburger Menu
        var $materialMenu = $('.material-menu');

        // TimelineMax the menu-icon animation for easier control on Touch/Mouse Events
        var tl = new TimelineMax();

        tl.to('.material-menu .top', 0.2, { top: 4, ease: Expo.easeInOut });
        tl.to('.material-menu .bot', 0.2, { top: -4, ease: Expo.easeInOut }, '-=0.2');

        tl.to('.material-menu .mid', 0.2, { opacity: 0, ease: Expo.easeInOut });
        tl.to('.material-menu .top', 0.2, { rotation: 45, ease: Expo.easeInOut }, '-=0.2');
        tl.to('.material-menu .bot', 0.2, { rotation: -45, ease: Expo.easeInOut }, '-=0.2');


        // Stop the Timeline at 0 else the animation will play after initiation
        tl.pause();

        $materialMenu.on('click', function () {
            var $this = $(this);

            $this.toggleClass('active');

            if ($this.hasClass('active')) {
                tl.reverse();
            } else {
                tl.play();
            }
        });


        // Floating Label Input Box
        $('.floating-input').each(function () {
            var $this = $(this);

            $this
                .wrap('<div class="floating"></div>')
                .before('<span class="placeholder">' + $this.attr('placeholder') + '</span>')
                .attr('placeholder', '')
                .on('focus', function () {
                    var $this = $(this);

                    $this.parent().addClass('focus');
                }).on('blur', function () {
                    var $this = $(this);

                    if ($this.val() === '') {
                        $this.parent().removeClass('focus');
                    }
                });

            if ($this.data('hint') !== undefined && $this.data('hint') !== '') {
                $this.after('<span class="hint"><strong>*Hint: </strong>' + $this.data('hint') + '</span>');
            }

            $('.placeholder').on('click', function () {
                $(this).next().focus();
            });
        });


        // Progress Bar
        $('.progress').each(function () {
            var $this = $(this),
                $progressBar = $this.find('.progress-bar');

            if ($progressBar.data('value') !== undefined) {
                $progressBar.css({ width: $progressBar.data('value') + '%' });
            }
        });

        $('.material').materialize();

        // cards
        var $card = $('.card');
        if ($card.length) {
            $card.each(function (i, el) {
                var $this = $(el);

                var cardWatcher = scrollMonitor.create(el);
                cardWatcher.enterViewport (function () {
                    $this.addClass('show', this.isInViewport);
                    $this.removeClass('up', this.isAboveViewport);
                });

                cardWatcher.exitViewport(function () {
                    $this.removeClass('show', this.isInViewport);
                    $this.toggleClass('up', this.isAboveViewport);
                });
            });

            scrollMonitor.recalculateLocations();
        }

        $window.on('resize', debounce(function () {
            isMobileDevice = $window.width() < 1024 ? true : false;
        }, 250));
    };

    /* Toaster */
    var toasterInd = 0;
    var toaster = function (msg) {
        // Alert Toaster
        var popupAlert = doT.template($('#toaster-template').html()),
            obj = {
                ind: toasterInd,
                message: msg
            };

        if (!$('.toaster-wrap').length) {
            $('#main').after('<div class="toaster-wrap" />');
        }

        $('.toaster-wrap').append(popupAlert(obj));

        var toaster = '.toaster' + toasterInd;

        TweenMax.to(toaster, 0.75, {
            scale: 1,
            ease: Expo.easeOut
        });

        TweenMax.to(toaster, 0.75, {
            scale: 0,
            ease: Expo.easeOut,
            delay: 5,
            onComplete: function () {
                $(toaster).remove();
            }
        });

        $(toaster).on('click', function (e) {
            e.preventDefault();

            TweenMax.to($(this), 0.75, {
                scale: 0,
                ease: Expo.easeOut,
                onComplete: function () {
                    $(toaster).remove();
                }
            });
        });

        toasterInd++;
    };

    /* Ripple Effect */
    var inc = 0;
    var ripple = function (e, el) {
        if ($('.no-svg').length) {
            return false;
        }

        // create SVG element
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
            circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
            x = e.offsetX,
            y = e.offsetY;

        svg.setAttributeNS(null, 'class', 'ripple ripple' + inc);
        g.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')');
        circle.setAttributeNS(null, 'r', (parseInt(el.outerWidth()) + x));

        svg.appendChild(g);
        g.appendChild(circle);
        el.append(svg);

        var $ripple = el.find('.ripple' + inc);
        TweenMax.from($ripple.find('circle'), 1.5, {
            attr: { r: 0 },
            opacity: 0.75,
            ease: Expo.easeOut,
            onComplete: function () {
                $ripple.remove();
            }
        });

        inc++;
    };

    // Export module method
    parent.materialDesign = {
        setup: setup,
        ripple: ripple,
        toaster: toaster
    };

    return parent;

}(RR || {}, jQuery));

jQuery(function ($) {
    'use strict';
    // Self-init Call
    RR.materialDesign.setup();
});
