/* global RR: true, TweenMax: true, TimelineMax: true, jQuery: true, ripple: true, Ease: true, Expo: true */
/* jshint unused: false */

/**
 * RR - apiCalls
 */
var RR = (function (parent, $) {
    'use strict';

    var busStopName = getQueryVariable('busStopName'),
        busStopId = getQueryVariable('busStopId'),
        loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>';

    busStopName = busStopName.split('+').join(' ');
    busStopName = decodeURIComponent(busStopName);

    var setup = function () {
        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=' + busStopId + '&SST=True',
            type: 'GET',
            headers: {
                'AccountKey': 'GXJLVP0cQTyUGWGTjf7TwQ==',
                'UniqueUserID': '393c7339-4df2-4e6a-b840-ea6b1f5d8acc',
                'accept': 'application/json'
            },
            success: function (data) {
                // console.log(data);
                TweenMax.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        $('.loader').remove();
                        processData(data);
                    }
                });

            },
            error: function (error) {
                console.log(error);

                RR.materialDesign.toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            },
            statusCode: function (code) {
                console.log(code);
            }
        });

        $('body').on('click', '.card', function (e) {
            e.preventDefault();

            var $this = $(this),
                serviceNum = $this.data('servicenum');

            RR.materialDesign.ripple(e, $this);

            $this.find('.eta').text('');

            $this.append(loader);

            $.ajax({
                url: 'https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=' + busStopId + '&ServiceNo=' + serviceNum + '&SST=True',
                type: 'GET',
                headers: {
                    'AccountKey': 'GXJLVP0cQTyUGWGTjf7TwQ==',
                    'UniqueUserID': '393c7339-4df2-4e6a-b840-ea6b1f5d8acc',
                    'accept': 'application/json'
                },
                success: function (data) {
                    // console.log(data);

                    TweenMax.to('.loader', 0.75, {
                        autoAlpha: 0,
                        scale: 0,
                        ease: Expo.easeOut,
                        onComplete: function () {
                            $('.loader').remove();
                            updateEta($this, data);
                        }
                    });
                },
                error: function (error) {
                    console.log(error);

                    RR.materialDesign.toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
                },
                statusCode: function (code) {
                    console.log(code);
                }
            });
        });
    };

    function processData(json) {
        var services = json.Services,
            cardTemplate = doT.template($('#card-template').html()),
            obj = {},
            cardMarkup = '',
            now = new Date(),
            arr,
            eta,
            etaMin;

        $('.header h1').text(busStopName);

        for (var i = 0, l = services.length; i < l; i++) {
            arr = new Date(services[i].NextBus.EstimatedArrival);
            eta = arr.getTime() - now.getTime(); // This will give difference in milliseconds
            etaMin = Math.round(eta / 60000);

            obj = {
                serviceNo: services[i].ServiceNo,
                status: services[i].Status,
                EstimatedArrival: etaMin
            };

            cardMarkup += cardTemplate(obj);
        }

        $('.timetable .col-12').html(cardMarkup);

        TweenMax.staggerTo('.card', 0.75, {
            opacity: 1,
            top: 1,
            ease: Expo.easeOut
        }, 0.1);
    };

    function updateEta(el, json) {
        var services = json.Services,
            now = new Date(),
            arr,
            eta,
            etaMin;

        arr = new Date(services[0].NextBus.EstimatedArrival);
        eta = arr.getTime() - now.getTime(); // This will give difference in milliseconds
        etaMin = Math.round(eta / 60000);

        if (etaMin < 0) {
            el.find('.eta').html('<p class="departed">Departed</p>');
        } else if (etaMin == 0) {
            el.find('.eta').html('<p class="arriving">Arriving</p>');
        } else if (etaMin == 1) {
            el.find('.eta').html('<p class="near">' + etaMin + ' min</p>');
        } else {
            el.find('.eta').html('<p>' + etaMin + ' mins</p>');
        }

        el.find('.eta').text();
    };

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1),
            vars = query.split("&");

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");

            if (pair[0] == variable) {
                return pair[1];
            }
        }

        return (false);
    };

    // Export module method
    parent.apiCalls = {
        setup: setup
    };

    return parent;

}(RR || {}, jQuery));

jQuery(function ($) {
    // Self-init Call
    RR.apiCalls.setup();
});
