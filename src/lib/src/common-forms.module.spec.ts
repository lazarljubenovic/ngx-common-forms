import { CommonFormsModule } from './common-forms.module';

describe('CommonFormModule', () => {
  let commonFormModule: CommonFormsModule;

  beforeEach(() => {
    commonFormModule = new CommonFormsModule();
  });

  it('should create an instance', () => {
    expect(commonFormModule).toBeTruthy();
  });
});
