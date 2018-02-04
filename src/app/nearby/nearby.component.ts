import { Component, OnInit } from '@angular/core';
import { GlobalVariable } from '../globals';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';

declare const google: any;
declare const MarkerClusterer: any;

@Component({
    selector: 'app-nearby',
    templateUrl: './nearby.component.html',
    styleUrls: ['./nearby.component.scss'],
    providers: [GlobalVariable]
})
export class NearbyComponent implements OnInit {
    markerUrl: String = '/assets/cbrbus/images/currentMarker.svg';
    mapSettings: Object = {
        lat: -35.2823083,
        long: 149.1285561,
        zoom: 15,
        marker: this.markerUrl
    };
    isGeolocationEnabled: Boolean = true;
    zoomLevel: Number = 17;
    markers: Array<Object> = [];
    map;
    currentMarker;

    constructor(public globalVariable: GlobalVariable) { }

    ngOnInit() {
        // Attaching a property in the windows object
        (<any>window).II = {
            googleMap: this
        };

        const script = document.createElement('script'),
            scriptStr = 'https://maps.googleapis.com/maps/api/js?key=' + this.globalVariable.GMAP_API_KEY + '&callback=II.googleMap.initMap',
            clusterScript = document.createElement('script'),
            clusterScriptStr = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';

        clusterScript.type = 'text/javascript';
        clusterScript.src = clusterScriptStr;
        clusterScript.async = true;
        clusterScript.defer = true;
        document.body.appendChild(clusterScript);

        script.type = 'text/javascript';
        script.src = scriptStr;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }

    initMap(): void {
        console.log('initMap');

        let center: Object = center = {
                lat: this.mapSettings.lat,
                lng: this.mapSettings.long
            },
            busMarker;

        const loader = document.getElementsByClassName('loader')[0],
            currentIcon = {
                url: this.mapSettings.marker,
                size: new google.maps.Size(24, 24),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(12, 12)
            },
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: this.mapSettings.zoom,
                center: center,
                streetViewControl: false,
                mapTypeControl: false
            }),
            stopIcon = {
                url: '/assets/cbrbus/images/stopMarker.svg',
                size: new google.maps.Size(40, 48),
                origin: new google.maps.Point(0, -10),
                anchor: new google.maps.Point(20, 48)
            };

        TweenMax.to(loader, 0.75, {
            autoAlpha: 0,
            scale: 0,
            ease: Expo.easeOut,
            onComplete: function () {
                loader.parentNode.removeChild(loader);
            }
        });

        this.map = map;

        this.currentMarker = new google.maps.Marker({
            icon: currentIcon,
            position: center,
            map: map
        });


        for (let i = 0, l = this.globalVariable.services.length; i < l; i++) {
            let v = this.globalVariable.services[i];

            busMarker = new google.maps.Marker({
                icon: stopIcon,
                label: v.data.toString(),
                position: {
                    lat: v.lat,
                    lng: v.long
                },
                map: map
            });
        }


        // Add a marker clusterer to manage the markers.
        this.initClusterMarker();

        if (this.isGeolocationEnabled) {
            // $('.widget-mylocation-button')
            //     .fadeIn()
            //     .on('click', function (e) {
            //         e.preventDefault();

            //         map.setCenter({
            //             lat: self.mapSettings.lat,
            //             lng: self.mapSettings.long
            //         });
            //     });
        }
    }

    updateMarker(): void {
        console.log('updateMarker')

        this.currentMarker.setPosition({
            lat: this.mapSettings.lat,
            lng: this.mapSettings.long
        });
    }

    initClusterMarker(): void {
        console.log('initClusterMarker');

        if (typeof MarkerClusterer == "undefined") {
            setTimeout(function () {
                this.initClusterMarker();
            }, 500);
        } else {
            let clusterStyles = [
                {
                    url: '/assets/cbrbus/images/cluster.svg',
                    height: 40,
                    width: 40,
                    textColor: '#ffffff'
                }
            ],
                markerCluster = new MarkerClusterer(this.map, this.markers, {
                    styles: clusterStyles,
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    maxZoom: 15,
                    averageCenter: true
                });
        }
    }
}
