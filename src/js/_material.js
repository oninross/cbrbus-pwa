// 'use strict';

// import doT from 'dot';

// $(() => {
//     // Ripple Effect
//     var $rippleEffect = $('button, .cta');

//     $rippleEffect.on('click', function (e) {
//         var $this = $(this);

//         if (!$this.hasClass('disabled')) {
//             ripple(e, $this);
//         }
//     });
// });



// //////////////
// // Toaster  //
// //////////////
// let toasterInd = 0;
// let toaster = function (msg) {
//     // Alert Toaster
//     var popupAlert = doT.template($('#toaster-template').html()),
//         obj = {
//             ind: toasterInd,
//             message: msg
//         };

//     if (!$('.toaster-wrap').length) {
//         $('#main').after('<div class="toaster-wrap" />');
//     }

//     $('.toaster-wrap').append(popupAlert(obj));

//     var toaster = '.toaster' + toasterInd;

//     TweenMax.to(toaster, 0.75, {
//         scale: 1,
//         ease: Expo.easeOut
//     });

//     TweenMax.to(toaster, 0.75, {
//         scale: 0.5,
//         autoAlpha: 0,
//         ease: Expo.easeOut,
//         delay: 5,
//         onComplete: function () {
//             $(toaster).remove();
//         }
//     });

//     $(toaster).on('click', function (e) {
//         e.preventDefault();

//         TweenMax.to($(this), 0.75, {
//             scale: 0.5,
//             autoAlpha: 0,
//             ease: Expo.easeOut,
//             onComplete: function () {
//                 $(toaster).remove();
//             }
//         });
//     });

//     toasterInd++;
// };



// ///////////////////
// // Ripple Effect //
// ///////////////////
// let inc = 0;
// let ripple = function (e, el) {
//     if ($('.no-svg').length || el.find('svg').length) {
//         return false;
//     }

//     // create SVG element
//     var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
//         g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
//         circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
//         x = e.offsetX,
//         y = e.offsetY;

//     if (x == undefined) {
//         return false;
//     }

//     svg.setAttributeNS(null, 'class', 'ripple ripple' + inc);
//     g.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')');
//     circle.setAttributeNS(null, 'r', (parseInt(el.outerWidth()) + x));

//     svg.appendChild(g);
//     g.appendChild(circle);
//     el.append(svg);

//     var $ripple = el.find('.ripple' + inc);
//     TweenMax.from($ripple.find('circle'), 1.5, {
//         attr: { r: 0 },
//         opacity: 0.75,
//         ease: Expo.easeOut,
//         onComplete: function () {
//             $ripple.remove();
//         }
//     });

//     inc++;
// };

// export { toaster, ripple };
