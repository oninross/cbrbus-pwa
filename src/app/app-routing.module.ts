import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { ShareComponent } from './share/share.component';


const routes: Routes = [
    {
        path: 'search',
        component: SearchComponent
    },
    {
        path: 'share',
        component: ShareComponent
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
