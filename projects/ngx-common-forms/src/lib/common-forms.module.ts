import {ModuleWithProviders, NgModule} from '@angular/core'
import {HttpErrorResponse} from '@angular/common/http'
import * as rx from 'rxjs'
import {CommonModule} from '@angular/common'
import {CommonFormConfig, FlatServerErrors} from './interfaces'
import {COMMON_FORM_CONFIG, COMMON_FORM_FULL_CONFIG} from './config'
import {CommonFormDirective} from './common-form.directive'
import {DefaultCommonFormControlDirective, CommonFormControlDirective} from './common-form-control.directive'

/**
 * A function which takes the form value object and returns
 * a "transformed" version. By default, it's an identity.
 */
export function transform (formValue: any): any {
  return formValue
}

/**
 * Forms are usually submitted to the server, and there's a
 * loading spinner going on somewhere while waiting for the
 * response from the server to arrive. The response could
 * be a success, which is usually the simplest thing that
 * could happen in the app. However, in case of an error,
 * we need to show some validation messages in the fields
 * where the user needs to check his input. This is where
 * the problems begin, and this is what the library solves.
 * This function checks if the error returned from the
 * server is a validation error. I have a habit of marking
 * those with a status 422 (UNPROCESSABLE ENTITY), but in
 * case your code does something else, this is the
 * function you override in order to change how the lib
 * figures out that the response from the server contains
 * a validation error.
 */
export function isValidationError (response: HttpErrorResponse): boolean {
  return response.status == 422
}

/**
 * The error returned from the server doesn't have to
 * match the "flat server error" format which the library
 * expects. See docs for `FlatServerErrors` for more about
 * the format, and override this function to specify your
 * own transformation.
 */
export function transformError (serverError: any): FlatServerErrors {
  return serverError
}

/**
 * This one might seem a bit weird, but there's actually a
 * default function which transforms the form value into an
 * observable that's responsible for sending the request.
 * The default value is a mocked observable which just emits
 * what's given to it, but this is almost always overridden
 * per form, by giving it a function which performs an HTTP
 * request, returning the observable.
 */
export function request<T = any> (formValue: T): rx.Observable<T> {
  return rx.of(formValue)
}

export function commonConfigFactory (partialCommonFormConfig?: Partial<CommonFormConfig>) {
  return Object.assign({
    propagateErrors: false,
    transform,
    isValidationError,
    transformError,
    request,
  }, (partialCommonFormConfig || {}))
}

export const DIRECTIVES = [
  CommonFormDirective,
  CommonFormControlDirective,
  DefaultCommonFormControlDirective,
]

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class CommonFormsModule {
  public static forRoot (config?: Partial<CommonFormConfig>): ModuleWithProviders {
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
