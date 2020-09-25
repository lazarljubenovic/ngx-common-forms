import { InjectionToken, forwardRef, Directive, Renderer2, ElementRef, Input, Self, Optional, Inject, EventEmitter, Output, ContentChildren, NgModule, isDevMode, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, throwError, EMPTY, of, BehaviorSubject, zip, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgControl, FormGroupDirective, ControlContainer, FormControlName, ReactiveFormsModule } from '@angular/forms';
import { tap, map, filter, exhaustMap, catchError, finalize, startWith, switchMap, withLatestFrom, pairwise } from 'rxjs/operators';

const COMMON_FORM_CONFIG = new InjectionToken('COMMON_FORM_CONFIG');
const COMMON_FORM_FULL_CONFIG = new InjectionToken('COMMON_FORM_FULL_CONFIG');
const COMMON_FORM_CONTROL = new InjectionToken('COMMON_FORM_CONTROL');
const SIN_CONFIG = new InjectionToken('SIN_CONFIG');
const SIN_FULL_CONFIG = new InjectionToken('SIN_FULL_CONFIG');

function isEmpty(x) {
    return x == null || x == '';
}
function providerFactory(klass) {
    return {
        provide: COMMON_FORM_CONTROL,
        useExisting: forwardRef(() => klass),
    };
}
class DefaultCommonFormControlDirective {
    constructor(renderer, elRef) {
        this.renderer = renderer;
        this.elRef = elRef;
    }
    set name(name) {
        this.setName(name);
    }
    setName(name) {
        this._name = name;
        this.renderer.setAttribute(this.elRef.nativeElement, 'name', name);
    }
    getName() {
        return this._name;
    }
    focus() {
        this.elRef.nativeElement.focus();
    }
}
DefaultCommonFormControlDirective.decorators = [
    { type: Directive, args: [{
                selector: 'input:not([notCommonControl]),select:not([notCommonControl]),textarea:not([notCommonControl])',
                providers: [providerFactory(DefaultCommonFormControlDirective)],
            },] }
];
DefaultCommonFormControlDirective.ctorParameters = () => [
    { type: Renderer2 },
    { type: ElementRef }
];
DefaultCommonFormControlDirective.propDecorators = {
    name: [{ type: Input }]
};
let uniqueId = 0;
class CommonFormControlDirective {
    constructor(ngControl, commonFormControl) {
        this.ngControl = ngControl;
        this.commonFormControl = commonFormControl;
    }
    ngOnInit() {
        if (!this.commonFormControl) {
            console.warn(`A control inside a Common Form does not provide COMMON_FORM_CONTROL token. ` +
                `It will be ignored. If you do not wish Common Form to be aware of this control, add ` +
                `[notCommonControl] selector. Path to control: "${this.ngControl.path.join('.')}".`);
            return;
        }
        if (isEmpty(this.commonFormControl.getName())) {
            const newName = this.ngControl.name.toString() || `common-form-control-name-${++uniqueId}`;
            this.commonFormControl.setName(newName);
        }
    }
}
CommonFormControlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[formControlName]:not([notCommonControl]),[formControl]:not([notCommonControl])',
            },] }
];
CommonFormControlDirective.ctorParameters = () => [
    { type: NgControl, decorators: [{ type: Self }] },
    { type: undefined, decorators: [{ type: Self }, { type: Optional }, { type: Inject, args: [COMMON_FORM_CONTROL,] }] }
];

function markControlsAsDirtyAndTouched(controls) {
    controls.forEach(control => {
        control.markAsDirty();
        control.markAsTouched();
    });
}
function markControlsAsDirtyAndTouchedByPath(form, controlNames) {
    controlNames.forEach(controlName => {
        const control = form.get(controlName);
        if (control != null) {
            control.markAsTouched();
            control.markAsDirty();
        }
        else {
            console.error(`Attempted to set control with name ${controlName} as dirty and touched, ` +
                `but it was not found.`);
        }
    });
}
class CommonFormDirective {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.submit$ = new Subject();
        this.isLoading = new EventEmitter();
        this.commonFormSubmit = new EventEmitter();
    }
    get isLoading$() {
        return this.isLoading.asObservable();
    }
    /**
     * An alias for "request", purposely named the same as the directive so it can
     * be used in a less verbose fashion..
     */
    set commonForm(request) {
        this.request = request;
    }
    ngOnInit() {
        if (this.propagateErrors == null) {
            this.propagateErrors = this.config.propagateErrors;
        }
        if (this.transform == null) {
            this.transform = this.config.transform;
        }
        if (this.isValidationError == null) {
            this.isValidationError = this.config.isValidationError;
        }
        if (this.transformError == null) {
            this.transformError = this.config.transformError;
        }
        if (this.request == null) {
            this.request = this.config.request;
        }
        this.container.ngSubmit.pipe(tap((event) => {
            event.preventDefault();
            if (this.preSubmit != null) {
                this.preSubmit();
            }
        }), map(() => this.container.control), filter(form => {
            if (form.valid) {
                return true;
            }
            else {
                const abstractControls = this.controls.map(ctrl => ctrl.ngControl.control);
                markControlsAsDirtyAndTouched(abstractControls);
                const firstInvalidControl = this.controls.find(ctrl => ctrl.ngControl.invalid);
                if (firstInvalidControl != null) {
                    firstInvalidControl.commonFormControl.focus();
                }
                return false;
            }
        }), map(form => this.transform(form.value)), tap(() => this.isLoading.emit(true)), exhaustMap(value => this.request(value).pipe(catchError((httpErrorResponse) => {
            if (this.isValidationError(httpErrorResponse)) {
                const flatErrors = this.transformError(httpErrorResponse);
                const controlsWithErrors = this.setErrors(flatErrors);
                const firstInvalidControl = this.controls
                    .find(ctrl => controlsWithErrors.indexOf(ctrl.ngControl.control) > -1);
                if (firstInvalidControl != null) {
                    firstInvalidControl.commonFormControl.focus();
                }
            }
            if (this.propagateErrors) {
                this.commonFormSubmit.emit(throwError(httpErrorResponse));
            }
            return EMPTY;
        }), finalize(() => this.isLoading.emit(false)))), finalize(() => this.isLoading.emit(false)), catchError((err, caught) => {
            console.error(`Error while handling form submission inside Common Form`, err);
            return caught;
        })).subscribe(response => {
            this.commonFormSubmit.emit(of(response));
        });
    }
    setErrors(errors) {
        const form = this.container.form;
        Object.keys(errors).forEach(path => {
            const control = form.get(path);
            if (control == null) {
                console.error(`API claims that a afield with path ${path} is invalid, ` +
                    `but no such field was found on the form.`);
            }
            else {
                markControlsAsDirtyAndTouchedByPath(form, [path]);
                form.get(path).setErrors({ serverError: errors[path] });
            }
        });
        return Object.keys(errors).map(path => form.get(path));
    }
}
CommonFormDirective.decorators = [
    { type: Directive, args: [{
                selector: '[commonForm]',
            },] }
];
CommonFormDirective.ctorParameters = () => [
    { type: FormGroupDirective, decorators: [{ type: Self }] },
    { type: undefined, decorators: [{ type: Inject, args: [COMMON_FORM_FULL_CONFIG,] }] }
];
CommonFormDirective.propDecorators = {
    isLoading: [{ type: Output }],
    commonFormSubmit: [{ type: Output }],
    propagateErrors: [{ type: Input }],
    preSubmit: [{ type: Input }],
    transform: [{ type: Input }],
    isValidationError: [{ type: Input }],
    transformError: [{ type: Input }],
    request: [{ type: Input }],
    commonForm: [{ type: Input }],
    controls: [{ type: ContentChildren, args: [CommonFormControlDirective, { descendants: true },] }]
};

/**
 * A function which takes the form value object and returns
 * a "transformed" version. By default, it's an identity.
 */
function transform(formValue) {
    return formValue;
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
function isValidationError(response) {
    return response.status == 422;
}
/**
 * The error returned from the server doesn't have to
 * match the "flat server error" format which the library
 * expects. See docs for `FlatServerErrors` for more about
 * the format, and override this function to specify your
 * own transformation.
 */
function transformError(serverError) {
    return serverError;
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
function request(formValue) {
    return of(formValue);
}
function commonConfigFactory(partialCommonFormConfig) {
    return Object.assign({
        propagateErrors: false,
        transform,
        isValidationError,
        transformError,
        request,
    }, (partialCommonFormConfig || {}));
}
const DIRECTIVES = [
    CommonFormDirective,
    CommonFormControlDirective,
    DefaultCommonFormControlDirective,
];
class CommonFormsModule {
    static forRoot(config) {
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
        };
    }
}
CommonFormsModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                ],
                declarations: DIRECTIVES,
                exports: DIRECTIVES,
            },] }
];

class SinsDirective {
    constructor(container) {
        this.container = container;
    }
    ngOnInit() {
        this.control = typeof this.nameOrControl == 'string'
            ? this.container.control.get(this.nameOrControl)
            : this.nameOrControl;
    }
}
SinsDirective.decorators = [
    { type: Directive, args: [{
                selector: '[sins]',
            },] }
];
SinsDirective.ctorParameters = () => [
    { type: ControlContainer }
];
SinsDirective.propDecorators = {
    nameOrControl: [{ type: Input, args: ['sins',] }]
};

class SinDirective {
    constructor(templateRef, viewContainerRef, config, sinsDirective, controlContainer) {
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.config = config;
        this.sinsDirective = sinsDirective;
        this.controlContainer = controlContainer;
        this.visible$ = new BehaviorSubject(null);
        this.initialized = false;
    }
    set control(control) {
        this._control = control;
        this.initialize();
    }
    get control() {
        return this._control;
    }
    set controlWithErrors(control) {
        this._controlWithErrors = control;
    }
    get controlWithErrors() {
        return this._controlWithErrors || this.control;
    }
    ngOnInit() {
        if (this.sinsDirective) {
            // If we're inside a sins group, use the form control specified there
            this.control = this.sinsDirective.control;
        }
        else {
            if (this.name != null) {
                // If nameOrControl is given instead of a control
                if (this.controlContainer == null) {
                    // Name is useless if we're not inside a container such as FormGroup.
                    throw new Error(`You cannot register sinName "${this.name}" outside of a control ` +
                        `container. You can use the sinControl input to pass in the control directly.`);
                }
                else {
                    // We grab the control with such nameOrControl
                    const control = this.controlContainer.control.get(this.name);
                    if (control == null) {
                        // There's no control with such nameOrControl, probably a typo.
                        throw new Error(`Cannot find control "${name}" to bind to sin.`);
                    }
                    else {
                        // We use this control. It's important we trigger the setter here.
                        this.control = control;
                    }
                }
            }
        }
        if (isDevMode() && this.control == null) {
            // Control has not been specified directly (sinControl),
            // cannot be determined by the given nameOrControl (sinName),
            // and there is no enclosing sins.
            throw new Error(`No control specified for sin.`);
        }
    }
    ngDoCheck() {
        if (!this.initialized) {
            return;
        }
        this.evaluate();
    }
    initialize() {
        if (this.when == null) {
            this.when = this.config.when;
        }
        this.initialized = true;
    }
    evaluate() {
        const whenControl = this.control;
        const whenObj = {
            disabled: whenControl.disabled,
            dirty: whenControl.dirty,
            enabled: whenControl.enabled,
            invalid: whenControl.invalid,
            pending: whenControl.pending,
            pristine: whenControl.pristine,
            touched: whenControl.touched,
            untouched: whenControl.untouched,
            valid: whenControl.valid,
        };
        const hasError = this.controlWithErrors.hasError(this.error);
        const shouldDisplay = this.when(whenObj);
        if (hasError && shouldDisplay) {
            this.create();
        }
        else {
            this.destroy();
        }
    }
    create() {
        if (this.embeddedViewRef == null) {
            this.visible$.next(this.control);
            const error = this.controlWithErrors.errors[this.error];
            this.embeddedViewRef = this.viewContainerRef
                .createEmbeddedView(this.templateRef, { $implicit: error });
        }
    }
    destroy() {
        if (this.embeddedViewRef != null) {
            this.visible$.next(null);
            this.embeddedViewRef.destroy();
            this.embeddedViewRef = null;
        }
    }
}
SinDirective.decorators = [
    { type: Directive, args: [{ selector: '[sin]' },] }
];
SinDirective.ctorParameters = () => [
    { type: TemplateRef },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [SIN_FULL_CONFIG,] }] },
    { type: SinsDirective, decorators: [{ type: Optional }] },
    { type: ControlContainer, decorators: [{ type: Optional }] }
];
SinDirective.propDecorators = {
    error: [{ type: Input, args: ['sin',] }],
    control: [{ type: Input, args: ['sinControl',] }],
    name: [{ type: Input, args: ['sinName',] }],
    controlWithErrors: [{ type: Input, args: ['sinErrorFromControl',] }],
    when: [{ type: Input, args: ['sinWhen',] }]
};

function findAdded([olders, newers]) {
    return newers.filter(newer => olders.indexOf(newer) == -1);
}
function findRemoved([olders, newers]) {
    return findAdded([newers, olders]);
}
class FormWithSinsDirective {
    constructor(controlContainer, renderer, elementRef) {
        this.controlContainer = controlContainer;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.destroy$ = new Subject();
        this.classNameForInvalidControl = 'ngx-sin-invalid';
    }
    markValidityFor(control, addClass) {
        const index = this.formControlNames.toArray()
            .findIndex(formControlName => {
            return control == formControlName.control;
        });
        let elRef;
        if (index == -1) {
            const formGroup = this.controlContainer.control;
            if (formGroup == control) {
                elRef = this.elementRef;
            }
            else {
                // Could not find the FormControl in the view, do nothing
                return;
            }
        }
        else {
            elRef = this.formControlElRefs.toArray()[index];
        }
        if (addClass) {
            this.renderer.addClass(elRef.nativeElement, this.classNameForInvalidControl);
        }
        else {
            this.renderer.removeClass(elRef.nativeElement, this.classNameForInvalidControl);
        }
    }
    markValidityForAll(controls, addClass) {
        controls.forEach(control => this.markValidityFor(control, addClass));
    }
    markAllAsValid() {
        this.formControlElRefs.forEach(elRef => {
            this.renderer.removeClass(elRef.nativeElement, this.classNameForInvalidControl);
        });
    }
    ngAfterContentInit() {
        if (this.sinDirectives == null) {
            // This form does not have any sins
            return;
        }
        this.formControls = zip(this.formControlNames.changes.pipe(startWith(this.formControlNames)), this.formControlElRefs.changes.pipe(startWith(this.formControlElRefs))).pipe(map(([name, elRef]) => ({ name, elRef })));
        const visibleSins$ = this.sinDirectives.changes.pipe(startWith(this.sinDirectives), map((list) => list.toArray()), switchMap((sins) => combineLatest(sins.map(sin => sin.visible$))), map((controls) => controls.filter(control => control != null)));
        this.formControls.pipe(withLatestFrom(this.sinDirectives.changes.pipe(startWith(this.sinDirectives)), (fc, s) => s), map((list) => list.toArray().map(sin => sin.visible$.getValue())), map((controls) => controls.filter(control => control != null)), withLatestFrom(visibleSins$, (_, sins) => sins))
            .subscribe((controls) => {
            // When form controls on the page change, we grab the last info about
            // visible sins and use that. We have to be destructive here
            this.markAllAsValid();
            this.markValidityForAll(controls, true);
        });
        visibleSins$.pipe(pairwise())
            .subscribe(([oldControls, newControls]) => {
            // We can calculate diff instead of removing and setting everything.
            const added = findAdded([oldControls, newControls]);
            const removed = findRemoved([oldControls, newControls]);
            this.markValidityForAll(added, true);
            this.markValidityForAll(removed, false);
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
    }
}
FormWithSinsDirective.decorators = [
    { type: Directive, args: [{ selector: 'form' },] }
];
FormWithSinsDirective.ctorParameters = () => [
    { type: ControlContainer, decorators: [{ type: Optional }, { type: Self }] },
    { type: Renderer2 },
    { type: ElementRef }
];
FormWithSinsDirective.propDecorators = {
    sinDirectives: [{ type: ContentChildren, args: [SinDirective, { descendants: true },] }],
    formControlNames: [{ type: ContentChildren, args: [FormControlName, { descendants: true },] }],
    formControlElRefs: [{ type: ContentChildren, args: [FormControlName, { descendants: true, read: ElementRef },] }]
};

function when({ dirty, touched }) {
    return dirty && touched;
}
const defaultConfig = {
    when,
};
function factory(config) {
    return Object.assign({}, defaultConfig, config || {});
}
const DIRECTIVES$1 = [
    SinDirective,
    SinsDirective,
    FormWithSinsDirective,
];
class SinModule {
    static forRoot(config) {
        return {
            ngModule: SinModule,
            providers: [
                {
                    provide: SIN_CONFIG,
                    useValue: config,
                },
                {
                    provide: SIN_FULL_CONFIG,
                    useFactory: factory,
                    deps: [SIN_CONFIG],
                },
            ],
        };
    }
}
SinModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    ReactiveFormsModule,
                ],
                declarations: DIRECTIVES$1,
                exports: DIRECTIVES$1,
            },] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { COMMON_FORM_CONTROL, CommonFormDirective, CommonFormsModule, FormWithSinsDirective, SinDirective, SinModule, SinsDirective, transform as ɵa, isValidationError as ɵb, transformError as ɵc, request as ɵd, commonConfigFactory as ɵe, DIRECTIVES as ɵf, COMMON_FORM_CONFIG as ɵg, COMMON_FORM_FULL_CONFIG as ɵh, SIN_CONFIG as ɵi, SIN_FULL_CONFIG as ɵj, when as ɵk, defaultConfig as ɵl, factory as ɵm, DIRECTIVES$1 as ɵn, providerFactory as ɵo, DefaultCommonFormControlDirective as ɵp, CommonFormControlDirective as ɵq };
//# sourceMappingURL=ngx-common-forms.js.map
