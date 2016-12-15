'use strict';

import doT from 'doT';
import { ripple, toaster } from './_material';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>';

$(() => {
    if ($('.timetable').length) {
        let $xml = '';
        $xml = '<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>';
        $xml += '<Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt">';


        // Check status
        //$xml += '<CheckStatusRequest>';
        //$xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        //$xml += '<RequestorRef>A6F762</RequestorRef>';
        //$xml += '</CheckStatusRequest>';


        // Vehicle monitoring request
        //$xml += '<ServiceRequest>';
        //$xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        //$xml += '<RequestorRef>A6F762</RequestorRef>';
        //$xml += '<VehicleMonitoringRequest version="2.0">';
        //$xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        //$xml += '<VehicleMonitoringRef>VM_ACT_0200</VehicleMonitoringRef>';
        //$xml += '</VehicleMonitoringRequest>';
        //$xml += '</ServiceRequest>';


        // BusStop Monitoring request
        $xml += '<ServiceRequest>';
        $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        $xml += '<RequestorRef>A6F762</RequestorRef>';
        $xml += '<StopMonitoringRequest version="2.0">';
        $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        $xml += '<MonitoringRef>2014</MonitoringRef>';
        $xml += '</StopMonitoringRequest>';
        $xml += '</ServiceRequest>';


        $xml += '</Siri>';


        $.ajax({
        //  url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/A6F762/vm/status.xml',
            url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/A6F762/sm/service.xml',
            data: $xml,
            type: 'POST',
            contentType: "text/xml",
            dataType: "text",
            success: function (xml) {
                TweenMax.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        $('.loader').remove();
                        processData(xml);
                    }
                });
            },
            error: function (msg) {
                console.log(error);

                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });

        // $('body').on('click', '.card', function (e) {
        //     e.preventDefault();

        //     let $this = $(this),
        //         serviceNum = $this.data('servicenum');

        //     if (serviceNum == undefined) {
        //         return false;
        //     }

        //     ripple(e, $this);

        //     $this.find('.eta').text('');

        //     $this.append(loader);

        //     $.ajax({
        //         url: 'https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=' + busStopId + '&ServiceNo=' + serviceNum + '&SST=True',
        //         type: 'GET',
        //         headers: {
        //             'AccountKey': 'GXJLVP0cQTyUGWGTjf7TwQ==',
        //             'UniqueUserID': '393c7339-4df2-4e6a-b840-ea6b1f5d8acc',
        //             'accept': 'application/json'
        //         },
        //         success: function (data) {
        //             // console.log(data);

        //             TweenMax.to('.loader', 0.75, {
        //                 autoAlpha: 0,
        //                 scale: 0,
        //                 ease: Expo.easeOut,
        //                 onComplete: function () {
        //                     $('.loader').remove();
        //                     updateEta($this, data);
        //                 }
        //             });
        //         },
        //         error: function (error) {
        //             console.log(error);

        //             toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
        //         },
        //         statusCode: function (code) {
        //             console.log(code);
        //         }
        //     });
        // });
    }
});

function processData(xml) {
    let xmlDoc = $.parseXML(xml),
        $xml = $(xmlDoc),
        $monitoredStopVisit = $xml.find('MonitoredStopVisit'),
        cardHeader = doT.template($('#card-header').html()),
        cardTemplate = doT.template($('#card-template').html()),
        obj = {},
        cardMarkup = '',
        now = new Date(),
        arr,
        eta,
        etaMin;

    for (let i = 0, l = $monitoredStopVisit.length; i < l; i++) {
        arr = new Date($($monitoredStopVisit[i]).find('ExpectedArrivalTime')[0].innerHTML);
        eta = arr.getTime() - now.getTime(); // This will give difference in milliseconds
        etaMin = Math.round(eta / 60000);

        obj = {
            serviceNo: $($monitoredStopVisit[i]).find('PublishedLineName')[0].innerHTML,
            // status: services[i].Status,
            estimatedArrival: etaMin
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
    let services = json.Services,
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
    let query = window.location.search.substring(1),
        vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");

        if (pair[0] == variable) {
            return pair[1];
        }
    }

    return (false);
};
