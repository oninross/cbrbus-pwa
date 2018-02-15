import { Component, OnInit } from '@angular/core';
import { Helpers } from '../__shared/helpers';
import { GlobalVariable } from '../__shared/globals';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { DomService } from '../__shared/dom-service';
import { ToasterComponent } from '../toaster/toaster.component';

import { parseString } from 'xml2js/lib/xml2js';
import { CardEmptyComponent } from '../card-empty/card-empty.component';
import { CardHeaderComponent } from '../card-header/card-header.component';
@Component({
    selector: 'app-busstop',
    templateUrl: './busstop.component.html',
    styleUrls: [
        './busstop.component.scss',
        '../btn/btn.component.scss',
        '../toggle/toggle.component.scss',
        '../card/card.component.scss',
    ]
})
export class BusStopComponent implements OnInit {

    busStopId: string;
    busStopName: string;

    constructor(
        private globalVariable: GlobalVariable,
        private helpers: Helpers,
        private domService: DomService
    ) { }

    ngOnInit() {
        const self = this;

        if (this.helpers.getQueryVariable('busStopId')) {
            this.busStopId = this.helpers.getQueryVariable('busStopId');
            this.busStopName = this.getBusStopName();
        }

        self.lookupBusId(this.busStopId, this.busStopName);
    }

    lookupBusId(id, name) {
        const self = this,
            loader = document.getElementsByClassName('loader')[0];

        let xml = `<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>
            <Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt">
                <ServiceRequest>
                    <RequestTimestamp>` + new Date().toISOString() + `</RequestTimestamp>
                    <RequestorRef>` + self.globalVariable.API_KEY + `</RequestorRef>
                    <StopMonitoringRequest version="2.0">
                        <PreviewInterval>PT60M</PreviewInterval>
                        <RequestTimestamp>` + new Date().toISOString() + `</RequestTimestamp>
                        <MonitoringRef>` + id + `</MonitoringRef>
                    </StopMonitoringRequest>
                </ServiceRequest>
            </Siri>`;

        var request = new XMLHttpRequest();
        request.open('POST', 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + self.globalVariable.API_KEY + '/sm/service.xml', true);
        request.setRequestHeader('Content-Type', 'text/xml');
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                TweenMax.to(loader, 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        loader.parentNode.removeChild(loader);
                        self.convertXML(request.response);
                    }
                });
            }
        };

        request.onerror = function () {
            console.log(request.responseText);
            self.domService.appendComponentToBody(ToasterComponent, {
                isToaster: true,
                text: request.responseText
            });
        };

        request.send(xml);
    }

    processData(json) {
        const self = this,
            serviceDelivery = json.Siri.ServiceDelivery[0],
            status = (serviceDelivery.Status[0] === 'true');

        if (!status) {
            self.domService.appendComponentToBody(ToasterComponent, {
                isToaster: true,
                text: 'Whoops! Something went wrong!'
            });
            return false;
        }

        let isBusPresent: boolean = false,
            now = new Date(),
            obj: object = {},
            stopMonitoringDelivery: Array<number> = serviceDelivery.StopMonitoringDelivery,
            busArr: Array<number> = [],
            vehicleFeatureArr: Array<number> = [],
            tempArr: Array<number> = [],
            etaMinArr: Array<number> = [],
            vehicleRefNumArr: Array<number> = [],
            vehicleRefNum: number = 0,
            serviceNum: number = 0,
            arr: number = 0,
            eta: number = 0,
            etaMin: number = 0,
            icon = '',
            cardMarkup = '',
            vehicleFeatureRef = '';

        console.log(json);
        console.log(stopMonitoringDelivery)
        if (stopMonitoringDelivery == undefined) {
            self.domService.appendComponentToBody(CardEmptyComponent, {
                isToaster: false
            });
        } else {
            // Display Bus Stop Name if Available
            if (self.busStopName !== undefined) {
                // isBookmarked: self.bookmark.checkBookmark(self.busStopId) == true ? 'active' : ''

                self.domService.appendComponentToBody(CardHeaderComponent, {
                    isToaster: false,
                    text: self.busStopName,
                    id: self.busStopId,
                    isBookmarked: true
                });
            }
        }

        // Render Markup


        TweenMax.to('.btn-refresh', 0.75, {
            autoAlpha: 1,
            top: 0,
            ease: Expo.easeOut
        });

        TweenMax.to('.sort-toggle', 0.75, {
            autoAlpha: 1,
            top: 0,
            ease: Expo.easeOut,
            delay: 0.1
        });

        TweenMax.staggerTo('.card', 0.75, {
            opacity: 1,
            top: 0,
            ease: Expo.easeOut,
            delay: 0.2
        }, 0.1);

        // document.getElementsByClassName('card-wrapper')[0].addEventListener('click', function () {

        // });
    };

    convertXML(xml) {
        const self = this;

        parseString(xml, function (err, result) {
            self.processData(result);
        });
    }

    getBusStopName() {
        const self = this;

        if (self.helpers.getQueryVariable('busStopName')) {
            return decodeURI(self.helpers.getQueryVariable('busStopName'));
            // } else if (self.busStopName == '') {
            //     return _busStopName;
        }
    }
}
