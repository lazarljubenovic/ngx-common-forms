import {Observable} from 'rxjs/Observable'
import {HttpErrorResponse} from '@angular/common/http'

export interface FlatServerErrors {
  [path: string]: string;
}

export type CommonFormTransform = (formValue: any) => any;
export type CommonFormIsValidationError = (response: HttpErrorResponse) => boolean
export type CommonFormTransformError = (formValue: any) => FlatServerErrors;
export type CommonFormRequest<T = any> = (formValue: T) => Observable<T>;

export interface CommonFormConfigObject {
  propagateErrors?: boolean;
  transform?: CommonFormTransform;
  isValidationError?: CommonFormIsValidationError;
  transformError?: CommonFormTransformError;
  request?: CommonFormRequest;
}

export interface CommonFormConfig {
  propagateErrors: boolean;
  transform: CommonFormTransform;
  isValidationError: CommonFormIsValidationError;
  transformError: CommonFormTransformError;
  request: CommonFormRequest;
}
