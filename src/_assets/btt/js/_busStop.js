'use strict';

import doT from 'doT';
import { API_KEY } from './_helper';
import { ripple, toaster } from './_material';
import { checkBookmark, setBookmark } from './_bookmark';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    isLoading = true,
    busArr = [],
    busObjArr= [],
    busStopId,
    busStopName;

$(() => {
    if ($('.timetable').length) {
        if (getQueryVariable('busStopId')) {
            busStopId = getQueryVariable('busStopId');
        } else {
            busStopId = _busStopId;
        }

        getBusStopName();

        lookupBusId(busStopId, busStopName);

        $('.js-refresh').on('click', function() {
            if (isLoading) {
                return false;
            }

            $('body').append(loader);

            TweenMax.staggerTo('.card', 0.75, {
                opacity: 0,
                top: -50,
                ease: Expo.easeOut
            }, 0.1, function() {
                lookupBusId(busStopId, null);
            });
        });

        $('body').on('click', '.js-bookmark', function (e) {
            e.preventDefault();

            let $this = $(this),
                $id = $this.data('id');

            setBookmark($id);
        });
    }
});

function getQueryVariable(variable) {
    let query = window.location.search.substring(1),
        vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");

        if (pair[0] == variable) {
            return pair[1];
        }
    }

    return false;
};

let lookupBusId = function (id, name) {
    let $xml = '';

    busStopName = name;
    isLoading = false;

    $xml = '<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>';
    $xml += '<Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt">';


    // Check status
    //$xml += '<CheckStatusRequest>';
    //$xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
    //$xml += '<RequestorRef>' + API_KEY +'</RequestorRef>';
    //$xml += '</CheckStatusRequest>';


    // BusStop Monitoring request
    $xml += '<ServiceRequest>';
    $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
    $xml += '<RequestorRef>' + API_KEY +'</RequestorRef>';
    $xml += '<StopMonitoringRequest version="2.0">';
    $xml += '<PreviewInterval>PT60M</PreviewInterval>';
    $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
    $xml += '<MonitoringRef>' + id + '</MonitoringRef>';
    $xml += '</StopMonitoringRequest>';
    $xml += '</ServiceRequest>';


    $xml += '</Siri>';


    $.ajax({
        // url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY +'/vm/service.xml',
        url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY +'/sm/service.xml',
        // url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY +'/pt/service.xml',
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
        error: function (error) {
            console.log(error);

            toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
        }
    });
};

function processData(xml) {
    let xmlDoc = $.parseXML(xml),
        $xml = $(xmlDoc),
        $status = $xml.find('Status')[0].innerHTML == 'true' ? true : false,
        $monitoringRef = $xml.find('MonitoringRef');

    if (!$status) {
        toaster('Whoops! Something went wrong! Error (' + $xml.find('ErrorText')[0].innerHTML + ')');
        return false;
    }

    console.log(xmlDoc)

    let $monitoredStopVisit = $xml.find('MonitoredStopVisit'),
        cardHeader = doT.template($('#card-header').html()),
        cardTemplate = doT.template($('#card-template').html()),
        cardEmptyTemplate = doT.template($('#card-empty-template').html()),
        now = new Date(),
        obj = {},
        vehicleFeatureArr = [],
        etaArr = [],
        cardMarkup = '',
        vehicleFeatureRef = '',
        serviceNum = '',
        arr = '',
        eta = '',
        etaMin = '',
        icon = '';

    getBusStopName();

    if ($monitoredStopVisit.length || $monitoringRef.length) {
        if (busStopName != undefined) {
            obj = {
                busStopName: busStopName,
                busStopId: $monitoringRef[0].innerHTML,
                isBookmarked: checkBookmark($monitoringRef[0].innerHTML) == true ? 'active' : ''
            };

            cardMarkup += cardHeader(obj);
        }

        $monitoredStopVisit.each(function (i, v) {
            if ($($monitoredStopVisit[i]).find('ExpectedArrivalTime')[0] == undefined) {
                if ($($monitoredStopVisit[i]).find('AimedArrivalTime')[0] == undefined ) {
                    arr = new Date($($monitoredStopVisit[i]).find('AimedDepartureTime')[0].innerHTML);
                } else {
                    arr = new Date($($monitoredStopVisit[i]).find('AimedArrivalTime')[0].innerHTML);
                }
            } else {
                arr = new Date($($monitoredStopVisit[i]).find('ExpectedArrivalTime')[0].innerHTML);
            }

            vehicleFeatureArr = [];
            vehicleFeatureRef = $($monitoredStopVisit[i]).find('VehicleFeatureRef'),
            eta = arr.getTime() - now.getTime(); // This will give difference in milliseconds
            etaMin = Math.round(eta / 60000);
            serviceNum = $($monitoredStopVisit[i]).find('PublishedLineName')[0].innerHTML;

            for (let j = 0, m = vehicleFeatureRef.length; j < m; j++) {
                icon = vehicleFeatureRef[j].innerHTML;
                icon = icon.replace(' ', '-').toLowerCase();
                vehicleFeatureArr.push(icon);
            }

            etaArr = [];
            etaArr.push(etaMin);

            obj = {
                serviceNum: serviceNum,
                feature: vehicleFeatureArr,
                estimatedArrival: etaArr
            };

            // Initial push for busArr
            if (i == 0) {
                busArr.push(serviceNum);
                busObjArr.push(obj);
            }

            // console.log(busObjArr)
            // Check if bus is already present in array
            if (busArr.indexOf(serviceNum) == -1) {
                // New Bus Service
                busArr.push(serviceNum);
                busObjArr.push(obj);
            } else {
                // Existing Bus Service
                let busArrEta = busObjArr[busArr.indexOf(serviceNum)].estimatedArrival;

                if (busArrEta.length < 2 && busObjArr[0].estimatedArrival != etaMin) {
                    busArrEta.push(etaMin);
                    busArrEta.sort(function(a, b) {
                        return a - b;
                    });
                }
            }
        });

        let byServiceNum = busObjArr.slice(0);

        byServiceNum.sort(function(a, b) {
            return a.serviceNum - b.serviceNum;
        });

        $.each(byServiceNum, function (i, v) {
            // Append Markup
            cardMarkup += cardTemplate(byServiceNum[i]);
        })
    } else {
        cardMarkup += cardEmptyTemplate({});
    }

    // Render Markup
    $('.cards-wrapper').html(cardMarkup);

    TweenMax.to('.btn-refresh', 0.75, {
        opacity: 1,
        top: 0,
        ease: Expo.easeOut,
    });

    TweenMax.staggerTo('.card', 0.75, {
        opacity: 1,
        top: 0,
        ease: Expo.easeOut,
        delay: 0.1
    }, 0.1);
};

function getBusStopName() {
    if (getQueryVariable('busStopName')) {
        busStopName = decodeURI(getQueryVariable('busStopName'));
    } else if (busStopName == '') {
        busStopName = _busStopName;
    }
};

export { lookupBusId }
