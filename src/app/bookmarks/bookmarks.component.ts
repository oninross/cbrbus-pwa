import { Component, OnInit } from '@angular/core';

import { GlobalVariable } from '../__shared/globals';
import { DomService } from '../__shared/dom-service';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { ToasterComponent } from '../toaster/toaster.component';
import { CardHeaderComponent } from '../card-header/card-header.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-bookmarks',
    templateUrl: './bookmarks.component.html',
    styleUrls: ['./bookmarks.component.scss']
})
export class BookmarksComponent implements OnInit {

    obj: object = {};
    tmpArr: Array<any> = [];
    tmpArrInd: number = 0;
    busStopName: string = '';
    strArr: string = '';
    services: Array<any> = [];

    constructor(
        private globalViable: GlobalVariable,
        private domService: DomService,
        private router: Router
    ) { }

    ngOnInit() {
        const self = this;

        self.services = self.globalViable.SERVICES;

        if (JSON.parse(localStorage.bookmarks).length) {
            self.tmpArr = JSON.parse(localStorage.bookmarks);

            for (let i = 0, l = self.tmpArr.length; i < l; i++) {
                let busStopId = 0;

                // iterate over each element in the array
                for (let j = 0, m = self.services.length; j < m; j++) {
                    busStopId = self.tmpArr[i];

                    // look for the entry with a matching `code` value
                    if (self.services[j].data == busStopId) {
                        // we found it
                        // obj[i].name is the matched result
                        self.busStopName = self.services[j].name;
                    }
                }

                // cardMarkup += cardBookmark(self.obj);
                self.domService.appendComponentToBody(CardHeaderComponent, {
                    isToaster: false,
                    text: self.busStopName,
                    id: busStopId,
                    isBookmark: self.checkBookmark(busStopId) == true ? 'active' : ''
                });
            }

            TweenMax.staggerTo('.card', 0.75, {
                opacity: 1,
                top: 1,
                ease: Expo.easeOut
            }, 0.1);

            let jsBookmark = document.getElementsByClassName('js-bookmark');

            for (let i = 0, l = jsBookmark.length; i < l; i++) {
                jsBookmark[i].addEventListener('click', function(e) {
                    e.preventDefault();

                    self.router.navigate(['/busstop/'], {
                        queryParams: {
                            busStopId: this.dataset.id,
                            busStopName: this.querySelector('h2').textContent
                        }
                    });
                });
            }
        } else {
            this.domService.appendComponentToBody(ToasterComponent, {
                isToaster: true,
                text: 'You have not bookmaked any stops yet.'
            });
        }
    }

    checkBookmark(id): boolean {
        const self = this;

        if (localStorage.bookmarks) {
            self.tmpArr = JSON.parse(localStorage.bookmarks);

            if (self.tmpArr.includes(id)) {
                return true;
            } else {
                return false;
            }
        }
    }

    setBookmark(id): void {
        const self = this,
            cardHeaderIcon = document.querySelector('.card__header .icon');

        if (localStorage.bookmarks == undefined) {
            self.tmpArr.push(id);
            self.strArr = JSON.stringify(self.tmpArr);

            localStorage.bookmarks = self.strArr;

            cardHeaderIcon.classList.add('active');
        } else {
            self.tmpArr = JSON.parse(localStorage.bookmarks);

            if (self.tmpArr.indexOf(id) > -1) {
                self.tmpArrInd = self.tmpArr.indexOf('id');
                self.tmpArr.splice(self.tmpArrInd, 1);
                self.strArr = JSON.stringify(self.tmpArr);
                localStorage.bookmarks = self.strArr;

                cardHeaderIcon.classList.remove('active');
            } else {
                self.tmpArr.push(id);
                self.strArr = JSON.stringify(self.tmpArr);
                localStorage.bookmarks = self.strArr;

                cardHeaderIcon.classList.add('active');
            }
        }
    }
}
