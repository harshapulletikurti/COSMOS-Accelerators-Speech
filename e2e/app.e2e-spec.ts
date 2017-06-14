import { SpeechSamplePage } from './app.po';

describe('speech-sample App', () => {
  let page: SpeechSamplePage;

  beforeEach(() => {
    page = new SpeechSamplePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
