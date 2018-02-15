import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-bookmarks',
    templateUrl: './bookmarks.component.html',
    styleUrls: ['./bookmarks.component.scss']
})
export class BookmarksComponent implements OnInit {

    obj: object = {};
    services: object = {};
    tmpArr: Array<any> = [];
    tmpArrInd: number = 0;
    busStopName: string = '';
    strArr: string = '';

    constructor() { }

    ngOnInit() {
    }

    checkBookmark(id): boolean {
        const self = this;

        if (localStorage.bookmarks) {
            self.tmpArr = JSON.parse(localStorage.bookmarks);

            if (self.tmpArr.indexOf(Number(id)) > -1) {
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
