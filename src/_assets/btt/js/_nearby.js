'use strict';

import L from 'leaflet';
import CartoDB from 'cartodb';
import { ripple, toaster } from './_material';
import { debounce } from './_helper';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    isLoading = true,
    busArr = [],
    busObjArr = [],
    busId,
    busStopName,
    $googleMap = $('.map'),
    GMAP_API_KEY = 'AIzaSyD3jWuvQ-wlm5iSbEg8hvjHy03tyYd8szQ',
    $window = $(window),
    markers = [],
    isMapInit = false,
    isAnimating = false;;

export default class NearBy {
    constructor() {
        var that = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                that.mapSettings = {
                    'lat': position.coords.latitude,
                    'long': position.coords.longitude,
                    'zoom': 17,
                    'marker': '/assets/btt/images/currentMarker.png'
                };
                that.initMap();
            });

        } else {
            toaster('Geolocation is not supported by this browser.');

            that.mapSettings = {
                'lat': -35.2823083,
                'long': 149.1285561,
                'zoom': 15,
                'marker': null
            };

            that.initMap();
        }

        $(window).on('resize', debounce(function () {
            $('#map').css({
                height: $(document).outerHeight() - $('.header').outerHeight()
            });
        }, 250)).trigger('resize');
    }

    initMap() {
        var that = this,
            map = L.map('map', {
                attributionControl: false
            }).setView([that.mapSettings.lat, that.mapSettings.long], that.mapSettings.zoom),
            currentMarker = L.icon({
                iconUrl: that.mapSettings.marker,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }),
            sql = new CartoDB.SQL({
                user: 'oninross'
            });

        sql.execute('SELECT * FROM services s1 WHERE (ST_Distance(the_geom::geography, CDB_LatLng(' + that.mapSettings.lat + ',' + that.mapSettings.long + ')::geography) / 1000) < 0.5')

            //you can listen for 'done' and 'error' promise events
            .done(function (data) {
                var rows = data.rows;

                $.each(rows, function (i, v) {
                    var $marker = L.marker(
                            [rows[i].lat, rows[i].long],
                            { icon: that.createLabelIcon('busMarkerIcon', rows[i].data) }
                        ).addTo(map);

                    $marker.on('click', function (e) {
                        window.location.href = '/busstop/?busStopId=' + this._icon.innerText;
                    })
                });
            })
            .error(function (e) {
                console.log(e);
                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

        L.marker([that.mapSettings.lat, that.mapSettings.long], { icon: currentMarker })
            .addTo(map);
    }

    createLabelIcon(labelClass, labelText) {
        return L.divIcon({
            className: labelClass,
            html: labelText
        })
    }
}
