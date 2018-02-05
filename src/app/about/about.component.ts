import { Component, OnInit } from '@angular/core';
import { slideInOutAnimation } from '../__shared/animations';
import { AccordionComponent } from '../accordion/accordion.component';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: [
        './about.component.scss',
        '../btn/btn.component.scss',
        '../accordion/accordion.component.scss'
    ],
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' }
})
export class AboutComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        let accordion = new AccordionComponent();

        accordion.ngOnInit();
    }

}
