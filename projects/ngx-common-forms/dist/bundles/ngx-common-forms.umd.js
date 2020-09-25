(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('@angular/common'), require('@angular/forms'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('ngx-common-forms', ['exports', '@angular/core', 'rxjs', '@angular/common', '@angular/forms', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-common-forms'] = {}, global.ng.core, global.rxjs, global.ng.common, global.ng.forms, global.rxjs.operators));
}(this, (function (exports, core, rx, common, forms, rxop) { 'use strict';

    var COMMON_FORM_CONFIG = new core.InjectionToken('COMMON_FORM_CONFIG');
    var COMMON_FORM_FULL_CONFIG = new core.InjectionToken('COMMON_FORM_FULL_CONFIG');
    var COMMON_FORM_CONTROL = new core.InjectionToken('COMMON_FORM_CONTROL');
    var SIN_CONFIG = new core.InjectionToken('SIN_CONFIG');
    var SIN_FULL_CONFIG = new core.InjectionToken('SIN_FULL_CONFIG');

    function isEmpty(x) {
        return x == null || x == '';
    }
    function providerFactory(klass) {
        return {
            provide: COMMON_FORM_CONTROL,
            useExisting: core.forwardRef(function () { return klass; }),
        };
    }
    var DefaultCommonFormControlDirective = /** @class */ (function () {
        function DefaultCommonFormControlDirective(renderer, elRef) {
            this.renderer = renderer;
            this.elRef = elRef;
        }
        Object.defineProperty(DefaultCommonFormControlDirective.prototype, "name", {
            set: function (name) {
                this.setName(name);
            },
            enumerable: false,
            configurable: true
        });
        DefaultCommonFormControlDirective.prototype.setName = function (name) {
            this._name = name;
            this.renderer.setAttribute(this.elRef.nativeElement, 'name', name);
        };
        DefaultCommonFormControlDirective.prototype.getName = function () {
            return this._name;
        };
        DefaultCommonFormControlDirective.prototype.focus = function () {
            this.elRef.nativeElement.focus();
        };
        return DefaultCommonFormControlDirective;
    }());
    DefaultCommonFormControlDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: 'input:not([notCommonControl]),select:not([notCommonControl]),textarea:not([notCommonControl])',
                    providers: [providerFactory(DefaultCommonFormControlDirective)],
                },] }
    ];
    DefaultCommonFormControlDirective.ctorParameters = function () { return [
        { type: core.Renderer2 },
        { type: core.ElementRef }
    ]; };
    DefaultCommonFormControlDirective.propDecorators = {
        name: [{ type: core.Input }]
    };
    var uniqueId = 0;
    var CommonFormControlDirective = /** @class */ (function () {
        function CommonFormControlDirective(ngControl, commonFormControl) {
            this.ngControl = ngControl;
            this.commonFormControl = commonFormControl;
        }
        CommonFormControlDirective.prototype.ngOnInit = function () {
            if (!this.commonFormControl) {
                console.warn("A control inside a Common Form does not provide COMMON_FORM_CONTROL token. " +
                    "It will be ignored. If you do not wish Common Form to be aware of this control, add " +
                    ("[notCommonControl] selector. Path to control: \"" + this.ngControl.path.join('.') + "\"."));
                return;
            }
            if (isEmpty(this.commonFormControl.getName())) {
                var newName = this.ngControl.name.toString() || "common-form-control-name-" + ++uniqueId;
                this.commonFormControl.setName(newName);
            }
        };
        return CommonFormControlDirective;
    }());
    CommonFormControlDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: '[formControlName]:not([notCommonControl]),[formControl]:not([notCommonControl])',
                },] }
    ];
    CommonFormControlDirective.ctorParameters = function () { return [
        { type: forms.NgControl, decorators: [{ type: core.Self }] },
        { type: undefined, decorators: [{ type: core.Self }, { type: core.Optional }, { type: core.Inject, args: [COMMON_FORM_CONTROL,] }] }
    ]; };

    function markControlsAsDirtyAndTouched(controls) {
        controls.forEach(function (control) {
            control.markAsDirty();
            control.markAsTouched();
        });
    }
    function markControlsAsDirtyAndTouchedByPath(form, controlNames) {
        controlNames.forEach(function (controlName) {
            var control = form.get(controlName);
            if (control != null) {
                control.markAsTouched();
                control.markAsDirty();
            }
            else {
                console.error("Attempted to set control with name " + controlName + " as dirty and touched, " +
                    "but it was not found.");
            }
        });
    }
    var CommonFormDirective = /** @class */ (function () {
        function CommonFormDirective(container, config) {
            this.container = container;
            this.config = config;
            this.submit$ = new rx.Subject();
            this.isLoading = new core.EventEmitter();
            this.commonFormSubmit = new core.EventEmitter();
        }
        Object.defineProperty(CommonFormDirective.prototype, "isLoading$", {
            get: function () {
                return this.isLoading.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonFormDirective.prototype, "commonForm", {
            /**
             * An alias for "request", purposely named the same as the directive so it can
             * be used in a less verbose fashion..
             */
            set: function (request) {
                this.request = request;
            },
            enumerable: false,
            configurable: true
        });
        CommonFormDirective.prototype.ngOnInit = function () {
            var _this = this;
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
            this.container.ngSubmit.pipe(rxop.tap(function (event) {
                event.preventDefault();
                if (_this.preSubmit != null) {
                    _this.preSubmit();
                }
            }), rxop.map(function () { return _this.container.control; }), rxop.filter(function (form) {
                if (form.valid) {
                    return true;
                }
                else {
                    var abstractControls = _this.controls.map(function (ctrl) { return ctrl.ngControl.control; });
                    markControlsAsDirtyAndTouched(abstractControls);
                    var firstInvalidControl = _this.controls.find(function (ctrl) { return ctrl.ngControl.invalid; });
                    if (firstInvalidControl != null) {
                        firstInvalidControl.commonFormControl.focus();
                    }
                    return false;
                }
            }), rxop.map(function (form) { return _this.transform(form.value); }), rxop.tap(function () { return _this.isLoading.emit(true); }), rxop.exhaustMap(function (value) { return _this.request(value).pipe(rxop.catchError(function (httpErrorResponse) {
                if (_this.isValidationError(httpErrorResponse)) {
                    var flatErrors = _this.transformError(httpErrorResponse);
                    var controlsWithErrors_1 = _this.setErrors(flatErrors);
                    var firstInvalidControl = _this.controls
                        .find(function (ctrl) { return controlsWithErrors_1.indexOf(ctrl.ngControl.control) > -1; });
                    if (firstInvalidControl != null) {
                        firstInvalidControl.commonFormControl.focus();
                    }
                }
                if (_this.propagateErrors) {
                    _this.commonFormSubmit.emit(rx.throwError(httpErrorResponse));
                }
                return rx.EMPTY;
            }), rxop.finalize(function () { return _this.isLoading.emit(false); })); }), rxop.finalize(function () { return _this.isLoading.emit(false); }), rxop.catchError(function (err, caught) {
                console.error("Error while handling form submission inside Common Form", err);
                return caught;
            })).subscribe(function (response) {
                _this.commonFormSubmit.emit(rx.of(response));
            });
        };
        CommonFormDirective.prototype.setErrors = function (errors) {
            var form = this.container.form;
            Object.keys(errors).forEach(function (path) {
                var control = form.get(path);
                if (control == null) {
                    console.error("API claims that a afield with path " + path + " is invalid, " +
                        "but no such field was found on the form.");
                }
                else {
                    markControlsAsDirtyAndTouchedByPath(form, [path]);
                    form.get(path).setErrors({ serverError: errors[path] });
                }
            });
            return Object.keys(errors).map(function (path) { return form.get(path); });
        };
        return CommonFormDirective;
    }());
    CommonFormDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: '[commonForm]',
                },] }
    ];
    CommonFormDirective.ctorParameters = function () { return [
        { type: forms.FormGroupDirective, decorators: [{ type: core.Self }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [COMMON_FORM_FULL_CONFIG,] }] }
    ]; };
    CommonFormDirective.propDecorators = {
        isLoading: [{ type: core.Output }],
        commonFormSubmit: [{ type: core.Output }],
        propagateErrors: [{ type: core.Input }],
        preSubmit: [{ type: core.Input }],
        transform: [{ type: core.Input }],
        isValidationError: [{ type: core.Input }],
        transformError: [{ type: core.Input }],
        request: [{ type: core.Input }],
        commonForm: [{ type: core.Input }],
        controls: [{ type: core.ContentChildren, args: [CommonFormControlDirective, { descendants: true },] }]
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
        return rx.of(formValue);
    }
    function commonConfigFactory(partialCommonFormConfig) {
        return Object.assign({
            propagateErrors: false,
            transform: transform,
            isValidationError: isValidationError,
            transformError: transformError,
            request: request,
        }, (partialCommonFormConfig || {}));
    }
    var DIRECTIVES = [
        CommonFormDirective,
        CommonFormControlDirective,
        DefaultCommonFormControlDirective,
    ];
    var CommonFormsModule = /** @class */ (function () {
        function CommonFormsModule() {
        }
        CommonFormsModule.forRoot = function (config) {
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
        };
        return CommonFormsModule;
    }());
    CommonFormsModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                    ],
                    declarations: DIRECTIVES,
                    exports: DIRECTIVES,
                },] }
    ];

    var SinsDirective = /** @class */ (function () {
        function SinsDirective(container) {
            this.container = container;
        }
        SinsDirective.prototype.ngOnInit = function () {
            this.control = typeof this.nameOrControl == 'string'
                ? this.container.control.get(this.nameOrControl)
                : this.nameOrControl;
        };
        return SinsDirective;
    }());
    SinsDirective.decorators = [
        { type: core.Directive, args: [{
                    selector: '[sins]',
                },] }
    ];
    SinsDirective.ctorParameters = function () { return [
        { type: forms.ControlContainer }
    ]; };
    SinsDirective.propDecorators = {
        nameOrControl: [{ type: core.Input, args: ['sins',] }]
    };

    var SinDirective = /** @class */ (function () {
        function SinDirective(templateRef, viewContainerRef, config, sinsDirective, controlContainer) {
            this.templateRef = templateRef;
            this.viewContainerRef = viewContainerRef;
            this.config = config;
            this.sinsDirective = sinsDirective;
            this.controlContainer = controlContainer;
            this.visible$ = new rx.BehaviorSubject(null);
            this.initialized = false;
        }
        Object.defineProperty(SinDirective.prototype, "control", {
            get: function () {
                return this._control;
            },
            set: function (control) {
                this._control = control;
                this.initialize();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SinDirective.prototype, "controlWithErrors", {
            get: function () {
                return this._controlWithErrors || this.control;
            },
            set: function (control) {
                this._controlWithErrors = control;
            },
            enumerable: false,
            configurable: true
        });
        SinDirective.prototype.ngOnInit = function () {
            if (this.sinsDirective) {
                // If we're inside a sins group, use the form control specified there
                this.control = this.sinsDirective.control;
            }
            else {
                if (this.name != null) {
                    // If nameOrControl is given instead of a control
                    if (this.controlContainer == null) {
                        // Name is useless if we're not inside a container such as FormGroup.
                        throw new Error("You cannot register sinName \"" + this.name + "\" outside of a control " +
                            "container. You can use the sinControl input to pass in the control directly.");
                    }
                    else {
                        // We grab the control with such nameOrControl
                        var control = this.controlContainer.control.get(this.name);
                        if (control == null) {
                            // There's no control with such nameOrControl, probably a typo.
                            throw new Error("Cannot find control \"" + name + "\" to bind to sin.");
                        }
                        else {
                            // We use this control. It's important we trigger the setter here.
                            this.control = control;
                        }
                    }
                }
            }
            if (core.isDevMode() && this.control == null) {
                // Control has not been specified directly (sinControl),
                // cannot be determined by the given nameOrControl (sinName),
                // and there is no enclosing sins.
                throw new Error("No control specified for sin.");
            }
        };
        SinDirective.prototype.ngDoCheck = function () {
            if (!this.initialized) {
                return;
            }
            this.evaluate();
        };
        SinDirective.prototype.initialize = function () {
            if (this.when == null) {
                this.when = this.config.when;
            }
            this.initialized = true;
        };
        SinDirective.prototype.evaluate = function () {
            var whenControl = this.control;
            var whenObj = {
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
            var hasError = this.controlWithErrors.hasError(this.error);
            var shouldDisplay = this.when(whenObj);
            if (hasError && shouldDisplay) {
                this.create();
            }
            else {
                this.destroy();
            }
        };
        SinDirective.prototype.create = function () {
            if (this.embeddedViewRef == null) {
                this.visible$.next(this.control);
                var error = this.controlWithErrors.errors[this.error];
                this.embeddedViewRef = this.viewContainerRef
                    .createEmbeddedView(this.templateRef, { $implicit: error });
            }
        };
        SinDirective.prototype.destroy = function () {
            if (this.embeddedViewRef != null) {
                this.visible$.next(null);
                this.embeddedViewRef.destroy();
                this.embeddedViewRef = null;
            }
        };
        return SinDirective;
    }());
    SinDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[sin]' },] }
    ];
    SinDirective.ctorParameters = function () { return [
        { type: core.TemplateRef },
        { type: core.ViewContainerRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [SIN_FULL_CONFIG,] }] },
        { type: SinsDirective, decorators: [{ type: core.Optional }] },
        { type: forms.ControlContainer, decorators: [{ type: core.Optional }] }
    ]; };
    SinDirective.propDecorators = {
        error: [{ type: core.Input, args: ['sin',] }],
        control: [{ type: core.Input, args: ['sinControl',] }],
        name: [{ type: core.Input, args: ['sinName',] }],
        controlWithErrors: [{ type: core.Input, args: ['sinErrorFromControl',] }],
        when: [{ type: core.Input, args: ['sinWhen',] }]
    };

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    function findAdded(_a) {
        var _b = __read(_a, 2), olders = _b[0], newers = _b[1];
        return newers.filter(function (newer) { return olders.indexOf(newer) == -1; });
    }
    function findRemoved(_a) {
        var _b = __read(_a, 2), olders = _b[0], newers = _b[1];
        return findAdded([newers, olders]);
    }
    var FormWithSinsDirective = /** @class */ (function () {
        function FormWithSinsDirective(controlContainer, renderer, elementRef) {
            this.controlContainer = controlContainer;
            this.renderer = renderer;
            this.elementRef = elementRef;
            this.destroy$ = new rx.Subject();
            this.classNameForInvalidControl = 'ngx-sin-invalid';
        }
        FormWithSinsDirective.prototype.markValidityFor = function (control, addClass) {
            var index = this.formControlNames.toArray()
                .findIndex(function (formControlName) {
                return control == formControlName.control;
            });
            var elRef;
            if (index == -1) {
                var formGroup = this.controlContainer.control;
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
        };
        FormWithSinsDirective.prototype.markValidityForAll = function (controls, addClass) {
            var _this = this;
            controls.forEach(function (control) { return _this.markValidityFor(control, addClass); });
        };
        FormWithSinsDirective.prototype.markAllAsValid = function () {
            var _this = this;
            this.formControlElRefs.forEach(function (elRef) {
                _this.renderer.removeClass(elRef.nativeElement, _this.classNameForInvalidControl);
            });
        };
        FormWithSinsDirective.prototype.ngAfterContentInit = function () {
            var _this = this;
            if (this.sinDirectives == null) {
                // This form does not have any sins
                return;
            }
            this.formControls = rx.zip(this.formControlNames.changes.pipe(rxop.startWith(this.formControlNames)), this.formControlElRefs.changes.pipe(rxop.startWith(this.formControlElRefs))).pipe(rxop.map(function (_a) {
                var _b = __read(_a, 2), name = _b[0], elRef = _b[1];
                return ({ name: name, elRef: elRef });
            }));
            var visibleSins$ = this.sinDirectives.changes.pipe(rxop.startWith(this.sinDirectives), rxop.map(function (list) { return list.toArray(); }), rxop.switchMap(function (sins) { return rx.combineLatest(sins.map(function (sin) { return sin.visible$; })); }), rxop.map(function (controls) { return controls.filter(function (control) { return control != null; }); }));
            this.formControls.pipe(rxop.withLatestFrom(this.sinDirectives.changes.pipe(rxop.startWith(this.sinDirectives)), function (fc, s) { return s; }), rxop.map(function (list) { return list.toArray().map(function (sin) { return sin.visible$.getValue(); }); }), rxop.map(function (controls) { return controls.filter(function (control) { return control != null; }); }), rxop.withLatestFrom(visibleSins$, function (_, sins) { return sins; }))
                .subscribe(function (controls) {
                // When form controls on the page change, we grab the last info about
                // visible sins and use that. We have to be destructive here
                _this.markAllAsValid();
                _this.markValidityForAll(controls, true);
            });
            visibleSins$.pipe(rxop.pairwise())
                .subscribe(function (_a) {
                var _b = __read(_a, 2), oldControls = _b[0], newControls = _b[1];
                // We can calculate diff instead of removing and setting everything.
                var added = findAdded([oldControls, newControls]);
                var removed = findRemoved([oldControls, newControls]);
                _this.markValidityForAll(added, true);
                _this.markValidityForAll(removed, false);
            });
        };
        FormWithSinsDirective.prototype.ngOnDestroy = function () {
            this.destroy$.next();
        };
        return FormWithSinsDirective;
    }());
    FormWithSinsDirective.decorators = [
        { type: core.Directive, args: [{ selector: 'form' },] }
    ];
    FormWithSinsDirective.ctorParameters = function () { return [
        { type: forms.ControlContainer, decorators: [{ type: core.Optional }, { type: core.Self }] },
        { type: core.Renderer2 },
        { type: core.ElementRef }
    ]; };
    FormWithSinsDirective.propDecorators = {
        sinDirectives: [{ type: core.ContentChildren, args: [SinDirective, { descendants: true },] }],
        formControlNames: [{ type: core.ContentChildren, args: [forms.FormControlName, { descendants: true },] }],
        formControlElRefs: [{ type: core.ContentChildren, args: [forms.FormControlName, { descendants: true, read: core.ElementRef },] }]
    };

    function when(_a) {
        var dirty = _a.dirty, touched = _a.touched;
        return dirty && touched;
    }
    var defaultConfig = {
        when: when,
    };
    function factory(config) {
        return Object.assign({}, defaultConfig, config || {});
    }
    var DIRECTIVES$1 = [
        SinDirective,
        SinsDirective,
        FormWithSinsDirective,
    ];
    var SinModule = /** @class */ (function () {
        function SinModule() {
        }
        SinModule.forRoot = function (config) {
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
        };
        return SinModule;
    }());
    SinModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                        forms.ReactiveFormsModule,
                    ],
                    declarations: DIRECTIVES$1,
                    exports: DIRECTIVES$1,
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.COMMON_FORM_CONTROL = COMMON_FORM_CONTROL;
    exports.CommonFormDirective = CommonFormDirective;
    exports.CommonFormsModule = CommonFormsModule;
    exports.FormWithSinsDirective = FormWithSinsDirective;
    exports.SinDirective = SinDirective;
    exports.SinModule = SinModule;
    exports.SinsDirective = SinsDirective;
    exports.ɵa = transform;
    exports.ɵb = isValidationError;
    exports.ɵc = transformError;
    exports.ɵd = request;
    exports.ɵe = commonConfigFactory;
    exports.ɵf = DIRECTIVES;
    exports.ɵg = COMMON_FORM_CONFIG;
    exports.ɵh = COMMON_FORM_FULL_CONFIG;
    exports.ɵi = SIN_CONFIG;
    exports.ɵj = SIN_FULL_CONFIG;
    exports.ɵk = when;
    exports.ɵl = defaultConfig;
    exports.ɵm = factory;
    exports.ɵn = DIRECTIVES$1;
    exports.ɵo = providerFactory;
    exports.ɵp = DefaultCommonFormControlDirective;
    exports.ɵq = CommonFormControlDirective;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-common-forms.umd.js.map
