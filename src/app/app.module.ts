import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './/app-routing.module';


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
import { BusstopComponent } from './busstop/busstop.component';
import { Helpers } from './__shared/helpers';

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
        BusstopComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule
    ],
    providers: [
        DomService,
        GlobalVariable,
        Helpers
    ],
    bootstrap: [AppComponent],
    entryComponents: [ToasterComponent]
})
export class AppModule { }
