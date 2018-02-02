import { trigger, state, animate, transition, style } from '@angular/animations';

export const slideInOutAnimation =
    trigger('slideInOutAnimation', [
        state('*', style({
            position: 'absolute',
            opacity: 1
        })),

        transition(':enter', [
            style({
                opacity: 0
            }),

            animate('0.75s cubic-bezier(0.19, 1, 0.22, 1)', style({
                opacity: 1
            }))
        ]),

        transition(':leave', [
            animate('0.75s cubic-bezier(0.19, 1, 0.22, 1)', style({
                opacity: 0
            }))
        ])
    ]);