import {ModuleWithProviders, NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {CommonFormDirective} from './common-form.directive'
import {Observable} from 'rxjs/Observable'
import {COMMON_FORM_CONFIG, COMMON_FORM_FULL_CONFIG} from './config'
import {FormControlNameDirective} from './form-control-name.directive'
import {CommonFormConfig, FlatServerErrors} from './interfaces'
import {HttpErrorResponse} from '@angular/common/http'

export function transform(formValue: any): any {
  return formValue
}

export function isValidationError(response: HttpErrorResponse): boolean {
  return response.status == 422
}

export function transformError(serverError: any): FlatServerErrors {
  return serverError
}

export function request<T = any>(formValue: T): Observable<T> {
  return Observable.of(formValue)
}

export function commonConfigFactory(partialCommonFormConfig: Partial<CommonFormConfig>) {
  return Object.assign({
    propagateErrors: false,
    transform,
    isValidationError,
    transformError,
    request,
  }, (partialCommonFormConfig || {}))
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
  public static forRoot(config?: Partial<CommonFormConfig>): ModuleWithProviders {
    return {
      ngModule: CommonFormsModule,
      providers: [
        {
          provide: COMMON_FORM_CONFIG,
          useValue: config,
        },
        {
          provide: COMMON_FORM_FULL_CONFIG,
          useFactory: commonConfigFactory,
          deps: [COMMON_FORM_CONFIG],
        },
      ],
    }
  }
}
