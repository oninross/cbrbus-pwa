import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { ShareComponent } from './share/share.component';
import { AboutComponent } from './about/about.component';
import { NearbyComponent } from './nearby/nearby.component';
import { BusStopComponent } from './busstop/busstop.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { TrackMyBusComponent } from './track-my-bus/track-my-bus.component';


const routes: Routes = [
    {
        path: 'search',
        component: SearchComponent
    },
    {
        path: 'nearby',
        component: NearbyComponent
    },
    {
        path: 'bookmarks',
        component: BookmarksComponent
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'share',
        component: ShareComponent
    },
    {
        path: 'busstop',
        component: BusStopComponent
    },
    {
        path: 'trackmybus',
        component: TrackMyBusComponent
    },
    {
        path: '',
        redirectTo: '/search',
        pathMatch: 'full'
    }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }
