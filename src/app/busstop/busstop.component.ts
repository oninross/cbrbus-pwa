import { Component, OnInit, Input } from '@angular/core';
import { Helpers } from '../__shared/helpers';
import { GlobalVariable } from '../__shared/globals';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { DomService } from '../__shared/dom-service';
import { ToasterComponent } from '../toaster/toaster.component';

import { parseString } from 'xml2js/lib/xml2js';
import { CardEmptyComponent } from '../card-empty/card-empty.component';
import { CardHeaderComponent } from '../card-header/card-header.component';
import { BookmarksComponent } from '../bookmarks/bookmarks.component';

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
    @Input() index: number = 0;
    @Input() text: string = '';
    @Input() buses: Array<any> = [];

    busStopId: number;
    busStopName: string;
    isBookmarked: boolean;

    constructor(
        private globalVariable: GlobalVariable,
        private helpers: Helpers,
        private domService: DomService,
        private bookmarks: BookmarksComponent
    ) { }

    ngOnInit() {
        const self = this;

        if (this.helpers.getQueryVariable('busStopId')) {
            this.busStopId = this.helpers.getQueryVariable('busStopId');
            this.busStopName = this.getBusStopName();
            this.isBookmarked = this.bookmarks.checkBookmark(self.busStopId);
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
                text: request.responseText
            });
        };

        request.send(xml);
    }

    processData(json) {
        const self = this,
            serviceDelivery = json.Siri.ServiceDelivery[0],
            status = (serviceDelivery.Status[0] === 'true'),
            cardHeader = new CardHeaderComponent();

        if (!status) {
            self.domService.appendComponentToBody(ToasterComponent, {
                text: 'Whoops! Something went wrong!'
            });
            return false;
        }

        let isBusPresent: boolean = false,
            now = new Date(),
            obj: object = {},
            stopMonitoringDelivery: Array<any> = serviceDelivery.StopMonitoringDelivery,
            busArr: Array<any> = [],
            vehicleFeatureArr: Array<any> = [],
            tempArr: Array<number> = [],
            etaMinArr: Array<number> = [],
            vehicleRefNumArr: Array<number> = [],
            vehicleRefNum: number = 0,
            serviceNum: number = 0,
            eta: number = 0,
            etaMin: number = 0,
            icon: string = '',
            vehicleFeatureRef: string = '',
            arr: Date;

        if (stopMonitoringDelivery == undefined) {
            self.domService.appendComponentToBody(CardEmptyComponent, {});
        } else {
            // Display Bus Stop Name if Available
            if (self.busStopName !== undefined) {
                cardHeader.setCardHeader(self.busStopId, self.busStopName, self.isBookmarked);
            }

            let monitoredStopVisit = stopMonitoringDelivery[0].MonitoredStopVisit;
            if (monitoredStopVisit.length) {
                console.log('A')
                for (let i = 0, l = monitoredStopVisit.length; i < l; i++) {
                    isBusPresent = false;

                    // Get vehicle reference number
                    vehicleRefNumArr = [];
                    vehicleRefNum = monitoredStopVisit[i].MonitoredVehicleJourney[0].VehicleRef;
                    vehicleRefNumArr.push(vehicleRefNum);

                    // Check for Arrival time
                    let monitoredCall = monitoredStopVisit[i].MonitoredVehicleJourney[0].MonitoredCall[0];

                    if (monitoredCall.ExpectedArrivalTime == undefined) {
                        if (monitoredCall.AimedArrivalTime == undefined) {
                            arr = new Date(monitoredCall.AimedDepartureTime);
                        } else {
                            arr = new Date(monitoredCall.AimedArrivalTime);
                        }
                    } else {
                        arr = new Date(monitoredCall.ExpectedArrivalTime);
                    }


                    // Calculate ETA
                    eta = arr.getTime() - now.getTime();
                    etaMin = Math.round(eta / 60000);
                    etaMinArr = [];
                    etaMinArr.push(etaMin);


                    // Check for Vehicle Features (Wheelchair or Bike Rack)
                    vehicleFeatureArr = [];
                    vehicleFeatureRef = monitoredStopVisit[i].MonitoredVehicleJourney[0].VehicleFeatureRef;
                    if (Array.isArray(vehicleFeatureRef)) {
                        for (let j = 0, m = vehicleFeatureRef.length; j < m; j++) {
                            icon = vehicleFeatureRef[j];
                            icon = icon.replace(' ', '-').toLowerCase();
                            vehicleFeatureArr.push(icon);
                        }
                    } else {
                        if (vehicleFeatureRef !== undefined) {
                            icon = vehicleFeatureRef;
                            icon = icon.replace(' ', '-').toLowerCase();
                            vehicleFeatureArr.push(icon);
                        }
                    }

                    serviceNum = monitoredStopVisit[i].MonitoredVehicleJourney[0].PublishedLineName[0];

                    obj = {
                        busStopId: self.busStopId,
                        vehicleRefNum: vehicleRefNumArr,
                        serviceNum: serviceNum,
                        feature: vehicleFeatureArr,
                        estimatedArrival: etaMinArr
                    };

                    for (let j = 0, m = busArr.length; j < m; j++) {
                        if (busArr[j].serviceNum == serviceNum) {
                            isBusPresent = true;

                            // Bus Service is present
                            if (busArr[j].estimatedArrival.length < 2) {
                                // Estimated Arrival per service is less than 3
                                tempArr = [];
                                tempArr.push(etaMin);
                                busArr[j].estimatedArrival = busArr[j].estimatedArrival.concat(tempArr);

                                tempArr = [];
                                tempArr.push(vehicleRefNum);
                                busArr[j].vehicleRefNum = busArr[j].vehicleRefNum.concat(tempArr);
                            } else {
                                // Replace timing that has earlier arrival
                                for (let k = 0, m = busArr[j].estimatedArrival.length; k < m; k++) {
                                    if (busArr[j].estimatedArrival[k] > etaMin && busArr[j].estimatedArrival[k] != etaMin) {
                                        busArr[j].estimatedArrival[k] = etaMin;
                                        busArr[j].vehicleRefNum[k] = vehicleRefNum;
                                        // return false;
                                    }
                                }
                            }
                        }
                    }

                    if (!isBusPresent) {
                        busArr.push(obj);
                    }
                }
            } else {

            }

            for (let i = 0, l = busArr.length; i < l; i++) {
                if ((busArr[i].estimatedArrival.length > 1) && (busArr[i].estimatedArrival[0] > busArr[i].estimatedArrival[1])) {
                    [busArr[i].estimatedArrival[0], busArr[i].estimatedArrival[1]] = [busArr[i].estimatedArrival[1], busArr[i].estimatedArrival[0]];
                    tempArr = busArr[i].vehicleRefNum;
                    [tempArr[0], tempArr[1]] = [tempArr[1], tempArr[0]];
                    busArr[i].vehicleRefNum = tempArr;
                }
            }

            self.buses = busArr.slice(0);
        }

        setTimeout(() => {
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
        }, 0);

        document.getElementsByClassName('card__header')[0].addEventListener('click', function (e) {
            self.bookmarks.setBookmark(this.dataset.id);
        });
    }

    ngAfterContentInit() {

    }

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
