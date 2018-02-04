import { Component, OnInit } from '@angular/core';
import { GlobalVariable } from '../globals';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';

@Component({
    selector: 'app-nearby',
    templateUrl: './nearby.component.html',
    styleUrls: ['./nearby.component.scss'],
    providers: [GlobalVariable]
})
export class NearbyComponent implements OnInit {
    constructor(public globalVariable: GlobalVariable) { }

    ngOnInit() {
        let self = this,
            markers: Array<Object> = [],
            mapSettings: Object = {},
            markerUrl: String = '/assets/btt/images/currentMarker.svg',
            zoomLevel: Number = 17,
            isGeolocationEnabled: Boolean = true;

        // Attaching a property in the windows object
        (<any>window).II = {
            initMap: self.initMap
        };

        mapSettings = {
            'lat': -35.2823083,
            'long': 149.1285561,
            'zoom': 15,
            'marker': markerUrl
        };

        this.loadGoogleMap();

        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(function (position) {
        //         mapSettings = {
        //             'lat': position.coords.latitude,
        //             'long': position.coords.longitude,
        //             'zoom': zoomLevel,
        //             'marker': markerUrl
        //         };

        //         self.loadGoogleMap();
        //     });

        //     setInterval(function () {
        //         navigator.geolocation.getCurrentPosition(function (position) {
        //             mapSettings = {
        //                 'lat': position.coords.latitude,
        //                 'long': position.coords.longitude,
        //                 'zoom': zoomLevel,
        //                 'marker': markerUrl
        //             };
        //         });

        //         self.updateMarker();
        //     }, 5000);
        // } else {
        //     // toaster('Geolocation is not supported or disabled by this browser.');

        //     isGeolocationEnabled = false;

        //     mapSettings = {
        //         'lat': -35.2823083,
        //         'long': 149.1285561,
        //         'zoom': 15,
        //         'marker': markerUrl
        //     };

        //     this.loadGoogleMap();
        // }
    }

    private loadGoogleMap(): void {
        console.log('loadGoogleMap: ' + this.globalVariable.GMAP_API_KEY);
        const script = document.createElement('script'),
            scriptStr = 'https://maps.googleapis.com/maps/api/js?key=' + this.globalVariable.GMAP_API_KEY + '&callback=II.initMap',
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

    private initMap(): void {
        console.log('initMap');

        const self = this,
            loader = document.getElementsByClassName('loader')[0];

        TweenMax.to(loader, 0.75, {
            autoAlpha: 0,
            scale: 0,
            ease: Expo.easeOut,
            onComplete: function () {
                loader.parentNode.removeChild(loader);
            }
        });
    }

    private updateMarker(): void {
        console.log('updateMarker')
    }

    private initClusterMarker(): void {
        console.log('initClusterMarker')
    }
}
