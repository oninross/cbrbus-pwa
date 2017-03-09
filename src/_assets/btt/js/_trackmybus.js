'use strict';

// import L from 'leaflet';
// import provider from 'providers';
// import CartoDB from 'cartodb';
import { ripple, toaster } from './_material';
import { BASE_URL, API_KEY, GMAP_API_KEY, debounce, easeOutExpo, getQueryVariable, isNotificationGranted } from './_helper';

let $window = $(window),
    isIntervalInit = false,
    markers = [],
    busId,
    refreshInterval;

export default class TrackMyBus {
    constructor() {
        let that = this;

        // Just to wake up the server IF its sleeping
        fetch('//' + BASE_URL + '/register', {
            method: 'post'
        });

        busId = getQueryVariable('busStopId');

        that.isGeolocationEnabled = true;

        window.II.googleMap = this;

        navigator.geolocation.getCurrentPosition(function (position) {
            that.mapSettings = {
                'lat': position.coords.latitude,
                'long': position.coords.longitude,
                'zoom': 12,
                'marker': '/assets/btt/images/currentMarker.png'
                // 'marker': 'https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png'
            };

            that.loadGoogleMap();
        });

        $window.on('resize', debounce(function () {
            $('#map').css({
                height: $(document).outerHeight() - $('.header').outerHeight()
            });
        }, 250)).trigger('resize');
    }

    loadGoogleMap() {
        var script = document.createElement('script'),
            scriptStr = 'https://maps.googleapis.com/maps/api/js?key=' + GMAP_API_KEY + '&callback=II.googleMap.loadData',
            clusterScript = document.createElement('script'),
            clusterScriptStr = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';

        script.type = 'text/javascript';
        script.src = scriptStr;
        document.body.appendChild(clusterScript);

        clusterScript.type = 'text/javascript';
        clusterScript.src = clusterScriptStr;

        setTimeout(function () {
            document.body.appendChild(script);
        }, 2500);
    }

    loadData() {
        let that = this;

        $.ajax({
            url: '/assets/btt/api/services.json',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                that.initMap(data);
            },
            error: function (error) {
                console.log(error);
                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });
    }

    initMap(json) {
        let that = this,
            center = {
                lat: that.mapSettings.lat,
                lng: that.mapSettings.long
            },
            busStopCenter =  $.map(json, function (n) {
                if (n.data == getQueryVariable('busStopId')) {
                    return {
                        lat: n.lat,
                        lng: n.long
                    };
                }
            }),
            currentIcon = {
                url: that.mapSettings.marker,
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(32, 32)
            },
            busStopIcon = {
                url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png',
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(32, 32)
            },
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: that.mapSettings.zoom,
                center: center,
                streetViewControl: false,
                mapTypeControl: false
            }),
            stopMarker;

        that.map = map;

        that.currentMarker = new google.maps.Marker({
            icon: currentIcon,
            position: center,
            map: map
        });

        that.busStopMarker = new google.maps.Marker({
            icon: busStopIcon,
            position: busStopCenter[0],
            map: map
        })

        $.each(json, function (i, v) {
            stopMarker = new google.maps.Marker({
                id: v.data,
                position: {
                    lat: v.lat,
                    lng: v.long
                },
                icon: {
                    url: '/assets/btt/images/busMarker.png'
                },
                map: map,
                zIndex: 1
            });

            markers.push(stopMarker);

            google.maps.event.addListener(stopMarker, 'click', function (e) {
                if (isNotificationGranted) {
                    let busStopId = $(this)[0].id;
                    that.notifyMe(busStopId);

                    toaster('You will be notified when your stop is approaching. ' + busStopId);
                } else {
                    toaster('Please enable your notifications to know if your bus is approaching.');
                }
            });
        });

        // Add a marker clusterer to manage the markers.
        let clusterStyles = [
            {
                url: '/assets/btt/images/cluster.png',
                height: 40,
                width: 40,
                textColor: '#ffffff'
            }
        ],
        markerCluster = new MarkerClusterer(map, markers, {
            styles: clusterStyles,
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            maxZoom: 15,
            averageCenter: true
        });

        that.callApi();
    }

    notifyMe(id) {
        var that = this;

        // console.log('endpoint:  ' + window.II.pushData.endpoint)

        fetch('//' + BASE_URL + '/sendNotification', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: window.II.pushData.endpoint,
                key: window.II.pushData.key,
                authSecret: window.II.pushData.authSecret,
                busId: getQueryVariable('busId'),
                busStopId: id,
                vehicleRef: getQueryVariable('vehicleRef')
            })
        });
    }

    processData(xml) {
        let that = this,
            xmlDoc = $.parseXML(xml),
            $xml = $(xmlDoc),
            $status = $xml.find('Status')[0].innerHTML == 'true' ? true : false,
            $monitoringRef = $xml.find('MonitoringRef'),
            isVehicleFound = false;

        if (!$status) {
            toaster('Whoops! Something went wrong! Error (' + $xml.find('ErrorText')[0].innerHTML + ')');
            return false;
        }

        console.log(xmlDoc);

        if (isIntervalInit) {
            $.each(markers, function (i, v) {
                markers[i].setMap(null);
            });
        } else {
            isIntervalInit = true;
            refreshInterval = setInterval(function () {
                that.callApi();
            }, 10000);
        }

        let $vehicleRefQuery = getQueryVariable('vehicleRef'),
            $vehicleActivity = $xml.find('VehicleActivity'),
            $vehicleLocation,
            $vehicleLat,
            $vehicleLng,
            vehicleRef,
            onwardCall,
            monitoredCall,
            stopPointRef,
            directionRef,
            busMarker,
            $v;

        $.each($vehicleActivity, function (i, v) {
            $v = $(v);
            $vehicleLocation = $v.find('VehicleLocation');
            $vehicleLat = $vehicleLocation.find('Latitude');
            $vehicleLng = $vehicleLocation.find('Longitude');
            vehicleRef = $v.find('VehicleRef');
            onwardCall = $v.find('OnwardCall');
            stopPointRef = $(onwardCall).find('StopPointRef');
            directionRef = $v.find('DirectionRef');

            if ($vehicleLat[0] != undefined && $vehicleLng[0] != undefined && vehicleRef[0] != undefined) {
                if (vehicleRef[0].innerHTML == $vehicleRefQuery) {
                    busMarker = new google.maps.Marker({
                        icon: 'https://maps.google.com/mapfiles/kml/paddle/' + directionRef[0].innerHTML + '_maps.png',     // small
                        // icon: 'https://maps.google.com/mapfiles/kml/paddle/' + directionRef[0].innerHTML + '.png',  // large
                        position: {
                            lat: Number($vehicleLat[0].innerHTML),
                            lng: Number($vehicleLng[0].innerHTML)
                        },
                        map: that.map
                    });

                    // var pt1 = new google.maps.LatLng($vehicleLat[0].innerHTML, $vehicleLng[0].innerHTML),
                    //     pt2 = new google.maps.LatLng(that.mapSettings.lat, that.mapSettings.long),
                    //     bounds = new google.maps.LatLngBounds();

                    // bounds.extend(pt1);
                    // bounds.extend(pt2);
                    // that.map.fitBounds(bounds);

                    markers.push(busMarker);

                    isVehicleFound = true;
                    // return false;
                }
            }

            // if (stopPointRef[0] != undefined && stopPointRef[0] != '' && vehicleRef[0] != undefined) {
            //     // console.log('onwardcall:: ' + stopPointRef[0].innerHTML + ' == ' +  busId);
            //     if (Number(stopPointRef[0].innerHTML) == Number(busId)) {
            //         clearInterval(refreshInterval);
            //     }
            // } else {
            //     monitoredCall = $v.find('MonitoredCall');
            //     stopPointRef = $(monitoredCall).find('StopPointRef');
            //     // console.log('no onwardcall:: ' + stopPointRef[0].innerHTML + ' == ' +  busId);
            //     if (Number(stopPointRef[0].innerHTML) == Number(busId)) {
            //         clearInterval(refreshInterval);
            //     }
            // }
        });

        if (!isVehicleFound) {
            toaster('Whoops! Sorry the vehicle you are tracking can not be found. Try again later.');
            clearInterval(refreshInterval);
        }
    }

    callApi() {
        let that = this,
            busId = getQueryVariable('busId'),
            $xml = '';

        if (busId < 10) {
            busId = '000' + busId.toString();
        } else if (busId < 100) {
            busId = '00' + busId.toString();
        } else if (busId < 1000) {
            busId = '0' + busId.toString();
        }

        $xml = '<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>';
        $xml += '<Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt">';

        $xml += '<ServiceRequest>';
        $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        $xml += '<RequestorRef>' + API_KEY + '</RequestorRef>';
        $xml += '<VehicleMonitoringRequest version="2.0">';
        $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
        $xml += '<VehicleMonitoringRef>VM_ACT_' + busId + '</VehicleMonitoringRef>';
        $xml += '</VehicleMonitoringRequest>';
        $xml += '</ServiceRequest>';

        $xml += '</Siri>';

        $.ajax({
            url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY + '/vm/service.xml',
            data: $xml,
            type: 'POST',
            contentType: "text/xml",
            dataType: "text",
            success: function (xml) {
                that.processData(xml);
            },
            error: function (error) {
                console.log(error);

                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });
    }
}
