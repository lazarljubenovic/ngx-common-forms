import { FormGroup, FormGroupDirective } from '@angular/forms';
import { EventEmitter, OnInit, QueryList } from '@angular/core';
import * as rx from 'rxjs';
import { CommonFormConfig, CommonFormIsValidationError, CommonFormRequest, CommonFormTransform, CommonFormTransformError } from './interfaces';
import { CommonFormControlDirective } from './common-form-control.directive';
export declare function markControlsAsDirtyAndTouchedByPath(form: FormGroup, controlNames: string[]): void;
export declare class CommonFormDirective implements OnInit, CommonFormConfig {
    private container;
    private config;
    private submit$;
    isLoading: EventEmitter<boolean>;
    get isLoading$(): rx.Observable<boolean>;
    commonFormSubmit: EventEmitter<rx.Observable<any>>;
    /**
     * Set to true if you want to propagate errors to the consumer component.
     */
    propagateErrors: boolean;
    /**
     * Right after the form's submit event and before ngx-common-forms does anything,
     * this function will be run if given.
     */
    preSubmit?: () => void;
    /**
     * Set this input to override the provided transform function.
     */
    transform: CommonFormTransform;
    /**
     * A predicate to determine if the error is supposed to be treated as a validation
     * error from the server response.
     */
    isValidationError: CommonFormIsValidationError;
    /**
     * Set this input to override the provided transform error function.
     */
    transformError: CommonFormTransformError;
    /**
     * A function returning an observable, probably doing a request to the network.
     * Does nothing by default and can be omitted. This is useful for less typical
     * use-cases when the request should be sent from the consumer side for finer
     * control.
     */
    request: CommonFormRequest;
    /**
     * An alias for "request", purposely named the same as the directive so it can
     * be used in a less verbose fashion..
     */
    set commonForm(request: (x: any) => rx.Observable<any>);
    /**
     * @internal
     *
     * Used internally to kep track of form controls within the common form.
     */
    controls: QueryList<CommonFormControlDirective>;
    constructor(container: FormGroupDirective, config: CommonFormConfig);
    ngOnInit(): void;
    private setErrors;
}
