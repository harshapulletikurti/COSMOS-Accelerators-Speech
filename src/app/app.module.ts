import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SpeechComponent } from './speech/speech.component';
import * as $ from 'jquery';
import { OutputSectionComponent } from './directives/output-section.component';
import { ApiHeaderComponent } from './directives/api-details-header.component';
import  * as ng2Bootstrap from 'ng2-bootstrap';
import { DataService } from "./services/data.service";
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'rxjs/add/operator/toPromise';
import { SpeechDataService } from "app/services/speech-data.service";
import { CognitiveApiService } from "app/services/cognitive-api.service";
import { FeatureInfoGroupComponent } from "app/directives/feature-info-group.component";
import { FeatureInfoItemComponent } from "app/directives/feature-info-line-item.component";

@NgModule({
  declarations: [
    AppComponent,
    SpeechComponent,
    ApiHeaderComponent,
    OutputSectionComponent,
    FeatureInfoGroupComponent,
    FeatureInfoItemComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ng2Bootstrap.Ng2BootstrapModule
  ],
  providers: [DataService,
              SpeechDataService,
              CognitiveApiService,
              ng2Bootstrap.ComponentLoaderFactory,
              ng2Bootstrap.PositioningService],
  bootstrap: [AppComponent]
})
export class AppModule { }
