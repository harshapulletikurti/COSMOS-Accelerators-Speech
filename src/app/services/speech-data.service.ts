import { Injectable } from '@angular/core';
import { Http, Response, ResponseContentType, RequestMethod, Headers } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { CognitiveApiService } from '../services/cognitive-api.service';
import { DataService } from '../services/data.service';
import { ISpeakerIdentity } from '../models/speaker-identity.model';

@Injectable()
export class SpeechDataService extends DataService {

    constructor(protected http: Http, private cognitiveApiService: CognitiveApiService) {
        super(http)
    }

    identify(audioFileUrl: string): Promise<ISpeakerIdentity> {
        var promise = new Promise<ISpeakerIdentity>((resolve, reject) => {
            this.http.get(audioFileUrl, { responseType: ResponseContentType.ArrayBuffer }).toPromise()
                .then(response => {
                    let audioFile = response.arrayBuffer();
                    let identificationProfileIds = this.cognitiveApiService.speakers.map(value => value.identificationProfileId).join(',');
                    // Identify who is speaking given a group of speakers.
                    let url = this.apiServer + `spid/v1.0/identify?identificationProfileIds=${identificationProfileIds}`;

                    this.postAsPromiseWithMore<ISpeakerIdentity>(url, audioFile, this.cognitiveApiService.subscriptionKeys.speakerRecognition)
                        //this.makeAJAXCall(url, audioFile)
                        //.then(response => {
                        //    this.getLocationFromHeader(response, this.cognitiveApiService.subscriptionKeys.speakerRecognition)
                        .then(speaker => {
                            resolve(speaker);
                        })
                        .catch(error => {
                            reject(error);
                        });
                    //})
                    //.catch(error => {
                    //    reject(error);
                    //});
                });
        });
        return promise;
    }

    getAudioFileAsBlob(url: string): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            this.http.get(url, {
                method: RequestMethod.Get,
                responseType: ResponseContentType.Blob,
                headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' })
            }).subscribe((response) => {
                resolve(new Blob([response.blob()], { type: 'audio/wav' }));
            });
        });
    }

    getSSML(text: string, locale: string, voiceName: string, gender: string): string {
        return `<speak version='1.0' xml:lang='${locale}'>
    <voice xml:lang='${locale}' 
           xml:gender='${gender}' 
           name='${voiceName}'>

           ${text}

    </voice>
</speak>`;
    }

    getTextAsSpeech(text: string, locale: string, voiceName: string, gender: string): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            this.getToken(this.cognitiveApiService.subscriptionKeys.speech)
                .then(token => {
                    this.http.post(`https://speech.platform.bing.com/synthesize`,
                    this.getSSML(text, locale, voiceName, gender)
                    , {
                        method: RequestMethod.Post,
                        responseType: ResponseContentType.Blob,
                        headers: new Headers({
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Bearer ' + token,
                            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
                        })
                    }).subscribe((response) => {
                        resolve(new Blob([response.blob()], { type: 'audio/wav' }));
                    });
                })
        });
    }

    speechToText(blob: Blob, locale: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getToken(this.cognitiveApiService.subscriptionKeys.speech)
                .then(token => {
                    $.ajax({
                        type: 'POST',
                        url: 'https://speech.platform.bing.com/recognize?scenarios=smd&appid=D4D52672-91D7-4C74-8AD8-42B1D98141A5' +
                        '&locale=' + locale + '&device.os=osx&version=3.0&format=json&instanceid=49f5b418-fdf6-4987-9efb-705d9a438771' +
                        '&requestid=888affe7-6e3f-480c-b2a8-4d2fe7989ad2',
                        data: blob,
                        contentType: 'audio/wav; codec="audio/pcm"; samplerate=16000',
                        processData: false,
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    }).then(resolve).fail(reject);
                });
        });
    }

     getToken(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onloadend = () => {
                resolve(xhr.response);
            }
            xhr.open('POST', 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken', true);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.setRequestHeader('Ocp-Apim-Subscription-Key', key);
            xhr.send(null);
        })
    }

    private makeAJAXCall(url: string, body: ArrayBuffer, key?: string): Promise<any> {
        var promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 202) {
                        resolve(xhr.response);
                    }
                }
            }
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.setRequestHeader('Ocp-Apim-Subscription-Key', key || this.cognitiveApiService.subscriptionKeys.speakerRecognition);
            xhr.send(body);
        });
        return promise;
    }
}

export interface ITTSOptions {
    [name: string]: {
        display: string,
        greeting?: string,
        voices?: {
            locale: string,
            gender: string,
            fullName: string,
            name: string
        }[]
    };
}

export var TTSOptions: ITTSOptions = {
    'en-US': {
        'display': 'English - US',
        'greeting': 'Welcome to Text-To-Speech Online Demo.',
        'voices': [
            {
                'locale': 'en-US',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)',
                'name': 'Zira'
            },
            {
                'locale': 'en-US',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)',
                'name': 'Benjamin'
            }
        ]
    },
    'en-AU': {
        'display': 'English - AU',
        'greeting': 'Welcome to Text-To-Speech Online Demo.',
        'voices': [
            {
                'locale': 'en-AU',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)',
                'name': 'Catherine'
            }
        ]
    },
    'en-CA': {
        'display': 'English - CA',
        'greeting': 'Welcome to Text-To-Speech Online Demo.',
        'voices': [
            {
                'locale': 'en-CA',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-CA, Linda)',
                'name': 'Linda'
            }
        ]
    },
    'en-IN': {
        'display': 'English - IN',
        'greeting': 'Welcome to Text-To-Speech Online Demo.',
        'voices': [
            {
                'locale': 'en-IN',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)',
                'name': 'Ravi'
            }
        ]
    },
    'en-GB': {
        'display': 'English - GB',
        'greeting': 'Welcome to Text-To-Speech Online Demo.',
        'voices': [
            {
                'locale': 'en-GB',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)',
                'name': 'Susan'
            },
            {
                'locale': 'en-GB',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)',
                'name': 'George'
            }
        ]
    },
    'zh-CN': {
        'display': 'Chinese - CN',
        'greeting': '欢迎光临语音合成在线演示系统。',
        'voices': [
            {
                'locale': 'zh-CN',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)',
                'name': 'Huihui'
            },
            {
                'locale': 'zh-CN',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Yaoyao, Aollo)',
                'name': 'Yaoyao'
            },
            {
                'locale': 'zh-CN',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)',
                'name': 'Kangkang'
            }
        ]
    },
    'zh-TW': {
        'display': 'Chinese - TW',
        'greeting': '歡迎光臨語音合成在線演示系統。',
        'voices': [
            {
                'locale': 'zh-TW',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)',
                'name': 'Yating'
            },
            {
                'locale': 'zh-TW',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)',
                'name': 'Zhiwei'
            }
        ]
    },
    'zh-HK': {
        'display': 'Chinese - HK',
        'greeting': '歡迎使用香港中文語音合成系統.',
        'voices': [
            {
                'locale': 'zh-HK',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)',
                'name': 'Tracy'
            },
            {
                'locale': 'zh-HK',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)',
                'name': 'Danny'
            }
        ]
    },
    'ja-JP': {
        'display': 'Japanese - JP',
        'greeting': 'マイクロソフト音声合成ウェブデモへようこそ。',
        'voices': [
            {
                'locale': 'ja-JP',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)',
                'name': 'Ayumi'
            },
            {
                'locale': 'ja-JP',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)',
                'name': 'Ichiro'
            }]
    },
    'de-DE': {
        'display': 'German - DE',
        'greeting': 'Willkommen bei Text-To-Speech Web Demo.',
        'voices': [
            {
                'locale': 'de-DE',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)',
                'name': 'Hedda'
            },
            {
                'locale': 'de-DE',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)',
                'name': 'Stefan'
            }
        ]
    },
    'fr-FR': {
        'display': 'French - FR',
        'greeting': 'Bienvenue sur démo en ligne de  Texte à parole.',
        'voices': [
            {
                'locale': 'fr-FR',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)',
                'name': 'Julie'
            },
            {
                'locale': 'fr-FR',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)',
                'name': 'Paul'
            }
        ]
    },
    'fr-CA': {
        'display': 'French - CA',
        'greeting': 'Bienvenue sur démo en ligne de  Texte à parole.',
        'voices': [
            {
                'locale': 'fr-CA',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)',
                'name': 'Caroline'
            }
        ]
    },
    'pt-BR': {
        'display': 'Portuguese - BR',
        'greeting': 'Oi! Seja bem-vindo à demonstração do sistema de síntese de fala para português do Brasil.',
        'voices': [
            {
                'locale': 'pt-BR',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)',
                'name': 'Daniel'
            }
        ]
    },
    'it-IT': {
        'display': 'Italian - IT',
        'greeting': 'Benvenuti alla dimostrazione internet del Testo-da-leggere di Microsoft.',
        'voices': [
            {
                'locale': 'it-IT',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)',
                'name': 'Cosimo'
            }
        ]
    },
    'es-ES': {
        'display': 'Spanish - ES',
        'greeting': 'Estás escuchando una prueba del sistema TTS con la voz de %s como demostración de la gran utilidad de poder convertir un texto en voz real.',
        'voices': [
            {
                'locale': 'es-ES',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
                'name': 'Laura'
            },
            {
                'locale': 'es-ES',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)',
                'name': 'Pablo'
            }
        ]
    },
    'es-MX': {
        'display': 'Spanish - MX',
        'greeting': 'Estás escuchando una prueba del sistema TTS con la voz de %s como demostración de la gran utilidad de poder convertir un texto en voz real.',
        'voices': [
            {
                'locale': 'es-MX',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)',
                'name': 'Raul'
            }
        ]
    },
    'ru-RU': {
        'display': 'Russian - RU',
        'greeting': 'Вас приветствует Екатерина, демонстрационная версия системы автоматического синтеза речи Микрософт.',
        'voices': [
            {
                'locale': 'ru-RU',
                'gender': 'Female',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)',
                'name': 'Irina'
            },
            {
                'locale': 'ru-RU',
                'gender': 'Male',
                'fullName': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)',
                'name': 'Pavel'
            }
        ]
    }
}