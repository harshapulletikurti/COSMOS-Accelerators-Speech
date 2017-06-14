import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CognitiveApiComponent } from '../cognitive-api.component';
import { SpeechDataService, TTSOptions } from '../services/speech-data.service';

declare var Recorder: any;


export interface ITTSOptions { [name: string]: { display: string, greeting?: string, voices?: string[] } }

@Component({
    selector: 'speech',
    styleUrls: ['./speech.component.css'],
    templateUrl: './speech.component.html'
})
export class SpeechComponent extends CognitiveApiComponent implements OnInit {
    apiTitle = 'Bing Speech Analysis API';
    listening = false;
    apiBackgroundImage = 'https://cosmosstore.blob.core.windows.net/cognitive-creative-content/Page%20Header%20VIdeos/COSMOS-SingleView-NoLoop_828';
    apiDescription = 'Convert audio to text, understand intent, and convert text back to speech for natural responsiveness.';
    apiReferenceUrl = 'https://dev.projectoxford.ai/docs/services/563309b6778daf02acc0a508';
    recognizedText = '';
    audio_context: AudioContext;
    recorder: any;
    RECOGNITION_READY = 'Click on the microphone to start speaking.';
    RECOGNITION_LISTENING = 'Click on the microphone to stop speaking.';
    RECOGNITION_PROCESSING = 'Processing..';
    recognitionLocale: string = 'en-US';
    player: HTMLAudioElement;

    ttsOptions = TTSOptions;
    ttsOptionKeys: string[] = Object.keys(TTSOptions);
    textToSpeechLocale = 'en-US';
    textToSpeechVoice = TTSOptions[this.textToSpeechLocale].voices[0].fullName;
    textToSpeechText = TTSOptions[this.textToSpeechLocale].greeting;
    textToSpeechSSML = '';
    ttsProcessing = false;
    showingSSML = false;
    textToSpeechHelpText = '';

    recognitionHelpText: string = this.RECOGNITION_READY;

    public constructor(private titleService: Title, private speechDataService: SpeechDataService, private changeDetectorRef: ChangeDetectorRef) {
        super();
        this.titleService.setTitle('Speech Analysis API');
        this.player = new Audio();
    }

    ngOnInit() {
        try {
            window['AudioContext'] = <AudioContext>(window['AudioContext'] || window['webkitAudioContext']);
            navigator.getUserMedia = navigator.getUserMedia || navigator['webkitGetUserMedia'];
            window.URL = window.URL || window['webkitURL'];

            this.audio_context = new AudioContext;

        } catch (e) {
            this.errorMessage = 'No web audio support in this browser!';
        }

    }

    downloadTTS() {
        this.ttsProcessing = true;
        let link: HTMLAnchorElement = <HTMLAnchorElement>$('<a></a>')[0];
        let voiceProfile = this.ttsOptions[this.textToSpeechLocale].voices.find(v => v.fullName === this.textToSpeechVoice);
        this.speechDataService
            .getTextAsSpeech(this.textToSpeechText, this.textToSpeechLocale, voiceProfile.fullName, voiceProfile.gender)
            .then(blob => {
                link.href = window.URL.createObjectURL(blob);
                link.download = 'tts-sample.mp3';
                link.click();
                this.ttsProcessing = false;
                this.changeDetectorRef.detectChanges();
            })
            .catch(console.log);
    }

    generateSSML() {
        let voiceProfile = this.ttsOptions[this.textToSpeechLocale].voices.find(v => v.fullName === this.textToSpeechVoice);
        this.textToSpeechSSML = this.speechDataService
            .getSSML(this.textToSpeechText, this.textToSpeechLocale, voiceProfile.fullName, voiceProfile.gender);
    }

    playTTS() {
        this.ttsProcessing = true;
        let voiceProfile = this.ttsOptions[this.textToSpeechLocale].voices.find(v => v.fullName === this.textToSpeechVoice);
        this.speechDataService
            .getTextAsSpeech(this.textToSpeechText, this.textToSpeechLocale, voiceProfile.fullName, voiceProfile.gender)
            .then(blob => {
                this.player.src = window.URL.createObjectURL(blob);
                this.player.play();
                this.ttsProcessing = false;
                this.changeDetectorRef.detectChanges();
            })
            .catch(console.log);
    }

    playSample(num: number) {
        this.recognitionHelpText = this.RECOGNITION_PROCESSING;
        this.speechDataService.getAudioFileAsBlob(`content/speech-sample-0${num}.wav`).then((blob: Blob) => {
            this.player.src = window.URL.createObjectURL(blob);
            this.player.play();
            this.speechDataService.speechToText(blob, this.recognitionLocale).then(data => {
                this.recognizedText = data.results[0].lexical;
                this.recognitionHelpText = this.RECOGNITION_READY;
                this.changeDetectorRef.detectChanges();
            })
            .catch(console.log);
        })
        .catch(console.log);
    }

    startUserMedia(stream: MediaStream) {
        this.recorder = new Recorder(this.audio_context.createMediaStreamSource(stream));
        this.recorder.record();
    }

    stopRecording() {
        this.recorder.stop();
        this.listening = false;
        this.recognitionHelpText = this.RECOGNITION_PROCESSING;
        this.recorder.exportWAV((blob: any) => {
            this.speechDataService.speechToText(blob, this.recognitionLocale).then(data => {
                this.recognizedText = data.results[0].lexical;
                this.recognitionHelpText = this.RECOGNITION_READY;
                this.changeDetectorRef.detectChanges();
            });
        });
    }

    toggleListening() {
        if (this.listening) {
            this.stopRecording();
        } else {
            this.startListening();
        }
    }

    startListening() {
        this.recognitionHelpText = this.RECOGNITION_LISTENING;
        this.listening = !this.listening;
        navigator.getUserMedia({ audio: true }, this.startUserMedia.bind(this), function (e) { });
    }

}

window['AudioContext'] = <AudioContext>(window['AudioContext'] || window['webkitAudioContext']);