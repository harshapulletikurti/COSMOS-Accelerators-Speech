import { Component, OnInit, Input, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CognitiveApiComponent } from '../cognitive-api.component';
import { SpeechDataService } from '../services/speech-data.service';
import { CognitiveApiService } from '../services/cognitive-api.service';
import { ISpeakerIdentity } from '../models/speaker-identity.model';
import { ISpeaker } from '../models/speaker.model';

@Component({
    selector: 'speaker-recognition',
    templateUrl: './speaker-recognition.component.html',
    styleUrls: ['./speaker-recognition.component.css']
})
export class SpeakerRecognitionComponent extends CognitiveApiComponent implements OnInit {
    speakerIdentity: ISpeakerIdentity;
    selectedSpeaker: ISpeaker;
    speakerName: string;
    showJSON = false;
    speakers: Array<ISpeaker>;
    audioList: Array<string>;
    apiTitle = 'Speaker Recognition API';
    apiBackgroundImage = 'https://cosmosstore.blob.core.windows.net/cognitive-creative-content/Page%20Header%20VIdeos/COSMOS-SingleView-NoLoop_828';
    apiDescription = 'Identify individual speakers or use speech as a means of authentication with the Speaker Recognition API.';
    apiReferenceUrl = 'https://dev.projectoxford.ai/docs/services/563309b6778daf02acc0a508';

    showCodeButtons=true;

    public constructor(private titleService: Title, private speechDataService: SpeechDataService, private cognitiveApiService: CognitiveApiService) {
        super();
        this.titleService.setTitle('Speaker Recognition API');
    }

    ngOnInit() {
        this.speakers = this.cognitiveApiService.speakers;
    }

    // identifySpeaker(url: string) {
    //     // use url to get WAV file or maybe upload a WAV file
    //     let wavFile: ArrayBuffer;
    //     this.speechDataService.identify(wavFile)
    //         .then(speakerIdentity => {
    //             this.speakerIdentity = speakerIdentity;
    //         })
    //         .catch((error) => {
    //             this.errorMessage = error;
    //         });
    // }

    toggleJSON(b: boolean) {
        this.showJSON = b;
    }

    identificationMessage() {
        return this.speakerName ? this.speakerName + ' is the identified speaker.' : '';
    }

    identifySpeaker(index:number, speaker: ISpeaker) {
        this.isLoading = true;
        this.selectedSpeaker = speaker;
        let audio = document.getElementsByTagName('audio')[index];
        // let audio = <HTMLAudioElement>$(event.target).children('audio')[0];
        let audioTags = document.getElementsByTagName('audio');
        for (let i=0; i < audioTags.length; i++) {
           audioTags[i].pause();
        }
        audio.play();

        // Test data
        window.setTimeout(() => {
            this.speakerIdentity = {
                status: "succeeded",
                createdDateTime: new Date(),
                lastActionDateTime: new Date(),
                processingResult: {
                    identifiedProfileId: speaker.identificationProfileId,
                    confidence: "High"
                }
            };
            this.speakerName = speaker.name;
            this.isLoading = false;
        }, 2000);

        // This operation is currently failing
        // this.speechDataService.identify(speaker.audio + ".wav")
        //     .then(speaker => {
        //         this.speakerIdentity = speaker;
        //         this.isLoading = false;
        //     })
        //     .catch((error) => {
        //         this.errorMessage = error;
        //         this.speakerIdentity = {
        //             status: "succeeded",
        //             createdDateTime: new Date(),
        //             lastActionDateTime: new Date(),
        //             processingResult: {
        //                 identifiedProfileId: speaker.identificationProfileId,
        //                 confidence: "High"
        //             }
        //         };
        //         this.speakerName = speaker.name;
        //         this.isLoading = false;
        //     });
    }
}