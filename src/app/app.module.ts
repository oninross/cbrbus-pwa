import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './/app-routing.module';
import { Ng2CompleterModule } from "ng2-completer";


import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { NavigationComponent } from './navigation/navigation.component';
import { ShareComponent } from './share/share.component';
import { BtnComponent } from './btn/btn.component';
import { AboutComponent } from './about/about.component';
import { AccordionComponent } from './accordion/accordion.component';
import { LoaderComponent } from './loader/loader.component';
import { NearbyComponent } from './nearby/nearby.component';
import { DomService } from './__shared/dom-service';
import { ToasterComponent } from './toaster/toaster.component';
import { GlobalVariable } from './__shared/globals';
import { CardBusComponent } from './card-bus/card-bus.component';
import { CardHeaderComponent } from './card-header/card-header.component';
import { BusStopComponent } from './busstop/busstop.component';
import { Helpers } from './__shared/helpers';
import { CardEmptyComponent } from './card-empty/card-empty.component';
import { CardComponent } from './card/card.component';
import { ToggleComponent } from './toggle/toggle.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { TrackMyBusComponent } from './track-my-bus/track-my-bus.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        SearchComponent,
        NavigationComponent,
        ShareComponent,
        BtnComponent,
        AboutComponent,
        AccordionComponent,
        LoaderComponent,
        NearbyComponent,
        ToasterComponent,
        CardBusComponent,
        CardHeaderComponent,
        CardEmptyComponent,
        BusStopComponent,
        CardComponent,
        ToggleComponent,
        BookmarksComponent,
        TrackMyBusComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        Ng2CompleterModule,
        FormsModule
    ],
    providers: [
        DomService,
        GlobalVariable,
        Helpers,
        BookmarksComponent
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        ToasterComponent,
        CardEmptyComponent,
        CardHeaderComponent,
        CardBusComponent
    ]
})
export class AppModule { }
