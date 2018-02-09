
// import 'devbridge-autocomplete';
import { Component, OnInit } from '@angular/core';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: [
        './search.component.scss',
        '../btn/btn.component.scss'
    ]
})
export class SearchComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        const search = document.querySelector('.search input[type="text"]');

        console.log(search)

        // search.autocomplete();
    }

}
