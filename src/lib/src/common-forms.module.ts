import {ModuleWithProviders, NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {CommonFormDirective} from './common-form.directive'
import {Observable} from 'rxjs/Observable'
import {COMMON_FORM_CONFIG} from './config'
import {FormControlNameDirective} from './form-control-name.directive'
import {CommonFormConfig, CommonFormConfigObject} from './interfaces'

export const DEFAULT_CONFIG: CommonFormConfig = {
  propagateErrors: false,
  transform: x => x,
  isValidationError: response => response.status == 422,
  transformError: x => x,
  request: x => Observable.of(x),
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CommonFormDirective,
    FormControlNameDirective,
  ],
  exports: [
    CommonFormDirective,
    FormControlNameDirective,
  ],
})
export class CommonFormsModule {
  public static forRoot(config?: CommonFormConfigObject): ModuleWithProviders {
    return {
      ngModule: CommonFormsModule,
      providers: [
        {
          provide: COMMON_FORM_CONFIG,
          useValue: {...DEFAULT_CONFIG, ...(config || {})},
        },
      ],
    }
  }
}
