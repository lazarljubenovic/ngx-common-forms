import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
/**
 * The library matches the field to the error which needs
 * to be displayed based on key-value paris, expressed as
 * a simple JavaScript object. For example, for a form
 * value with a shape `{a: 1, b: { c: 2 }}`, the flat server
 * error object for both of these fields would be:
 *
 * ```
 * {
 *     'a': 'error',
 *     'b.c': 'error',
 * }
 * ```
 *
 * Even when there's an array, the dot accessor should still
 * be used (e.g. `a.0.b.2` instead of `a[0].b[2]`).
 */
export interface FlatServerErrors {
    [path: string]: string;
}
export declare type CommonFormTransform = (formValue: any) => any;
export declare type CommonFormIsValidationError = (response: HttpErrorResponse) => boolean;
export declare type CommonFormTransformError = (formValue: any) => FlatServerErrors;
export declare type CommonFormRequest<T = any> = (formValue: T) => Observable<T>;
export interface CommonFormConfig {
    propagateErrors: boolean;
    transform: CommonFormTransform;
    isValidationError: CommonFormIsValidationError;
    transformError: CommonFormTransformError;
    request: CommonFormRequest;
}
export interface CommonFormControl {
    setName(name: string): void;
    getName(): string;
    focus(): void;
}
export interface WhenObject {
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    enabled: boolean;
    disabled: boolean;
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    untouched: boolean;
}
export declare type WhenFunction = (whenObj: Partial<WhenObject>) => boolean;
export interface SinModuleConfig {
    when: WhenFunction;
}
