import { Component, OnInit, Input } from '@angular/core';
import { BookmarksComponent } from '../bookmarks/bookmarks.component';

@Component({
    selector: 'app-card-header',
    templateUrl: './card-header.component.html',
    styleUrls: [
        './card-header.component.scss',
        '../card/card.component.scss'
    ]
})
export class CardHeaderComponent implements OnInit {

    @Input() busStopId: number;
    @Input() busStopName: string;
    @Input() isBookmarked: string;
    @Input() bookmarkArr: Array<any>;

    constructor() { }

    ngOnInit() {
    }

    setCardHeader(busStopId, busStopName, isBookmarked) {
        this.busStopId = busStopId;
        this.busStopName = busStopName;
        this.isBookmarked = isBookmarked;
    }
}
