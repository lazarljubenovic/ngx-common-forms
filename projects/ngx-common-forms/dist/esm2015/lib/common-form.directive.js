import { FormGroupDirective } from '@angular/forms';
import { ContentChildren, Directive, EventEmitter, Inject, Input, Output, Self } from '@angular/core';
import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';
import { COMMON_FORM_FULL_CONFIG } from './config';
import { CommonFormControlDirective } from './common-form-control.directive';
function markControlsAsDirtyAndTouched(controls) {
    controls.forEach(control => {
        control.markAsDirty();
        control.markAsTouched();
    });
}
export function markControlsAsDirtyAndTouchedByPath(form, controlNames) {
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
export class CommonFormDirective {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.submit$ = new rx.Subject();
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
        this.container.ngSubmit.pipe(rxop.tap((event) => {
            event.preventDefault();
            if (this.preSubmit != null) {
                this.preSubmit();
            }
        }), rxop.map(() => this.container.control), rxop.filter(form => {
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
        }), rxop.map(form => this.transform(form.value)), rxop.tap(() => this.isLoading.emit(true)), rxop.exhaustMap(value => this.request(value).pipe(rxop.catchError((httpErrorResponse) => {
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
                this.commonFormSubmit.emit(rx.throwError(httpErrorResponse));
            }
            return rx.EMPTY;
        }), rxop.finalize(() => this.isLoading.emit(false)))), rxop.finalize(() => this.isLoading.emit(false)), rxop.catchError((err, caught) => {
            console.error(`Error while handling form submission inside Common Form`, err);
            return caught;
        })).subscribe(response => {
            this.commonFormSubmit.emit(rx.of(response));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLWZvcm0uZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jb21tb24tZm9ybS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUE2QixrQkFBa0IsRUFBQyxNQUFNLGdCQUFnQixDQUFBO0FBQzdFLE9BQU8sRUFBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFVLE1BQU0sRUFBYSxJQUFJLEVBQUMsTUFBTSxlQUFlLENBQUE7QUFDdEgsT0FBTyxLQUFLLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDMUIsT0FBTyxLQUFLLElBQUksTUFBTSxnQkFBZ0IsQ0FBQTtBQVN0QyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxVQUFVLENBQUE7QUFDaEQsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0saUNBQWlDLENBQUE7QUFHMUUsU0FBUyw2QkFBNkIsQ0FBRSxRQUEyQjtJQUNqRSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNyQixPQUFPLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDekIsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsTUFBTSxVQUFVLG1DQUFtQyxDQUFFLElBQWUsRUFBRSxZQUFzQjtJQUMxRixZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ2pDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDckMsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQTtZQUN2QixPQUFPLENBQUMsV0FBVyxFQUFFLENBQUE7U0FDdEI7YUFBTTtZQUNMLE9BQU8sQ0FBQyxLQUFLLENBQ1gsc0NBQXNDLFdBQVcseUJBQXlC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QUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ3hELENBQUM7OztZQWxLRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7YUFDekI7OztZQXhDbUMsa0JBQWtCLHVCQXlHdEMsSUFBSTs0Q0FDSixNQUFNLFNBQUMsdUJBQXVCOzs7d0JBN0QzQyxNQUFNOytCQU1OLE1BQU07OEJBS04sS0FBSzt3QkFNTCxLQUFLO3dCQUtMLEtBQUs7Z0NBTUwsS0FBSzs2QkFLTCxLQUFLO3NCQVFMLEtBQUs7eUJBTUwsS0FBSzt1QkFVTCxlQUFlLFNBQUMsMEJBQTBCLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBYnN0cmFjdENvbnRyb2wsIEZvcm1Hcm91cCwgRm9ybUdyb3VwRGlyZWN0aXZlfSBmcm9tICdAYW5ndWxhci9mb3JtcydcbmltcG9ydCB7Q29udGVudENoaWxkcmVuLCBEaXJlY3RpdmUsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbnB1dCwgT25Jbml0LCBPdXRwdXQsIFF1ZXJ5TGlzdCwgU2VsZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcbmltcG9ydCAqIGFzIHJ4IGZyb20gJ3J4anMnXG5pbXBvcnQgKiBhcyByeG9wIGZyb20gJ3J4anMvb3BlcmF0b3JzJ1xuaW1wb3J0IHtcbiAgQ29tbW9uRm9ybUNvbmZpZyxcbiAgQ29tbW9uRm9ybUlzVmFsaWRhdGlvbkVycm9yLFxuICBDb21tb25Gb3JtUmVxdWVzdCxcbiAgQ29tbW9uRm9ybVRyYW5zZm9ybSxcbiAgQ29tbW9uRm9ybVRyYW5zZm9ybUVycm9yLFxuICBGbGF0U2VydmVyRXJyb3JzLFxufSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQge0NPTU1PTl9GT1JNX0ZVTExfQ09ORklHfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7Q29tbW9uRm9ybUNvbnRyb2xEaXJlY3RpdmV9IGZyb20gJy4vY29tbW9uLWZvcm0tY29udHJvbC5kaXJlY3RpdmUnXG5pbXBvcnQge0h0dHBFcnJvclJlc3BvbnNlfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCdcblxuZnVuY3Rpb24gbWFya0NvbnRyb2xzQXNEaXJ0eUFuZFRvdWNoZWQgKGNvbnRyb2xzOiBBYnN0cmFjdENvbnRyb2xbXSkge1xuICBjb250cm9scy5mb3JFYWNoKGNvbnRyb2wgPT4ge1xuICAgIGNvbnRyb2wubWFya0FzRGlydHkoKVxuICAgIGNvbnRyb2wubWFya0FzVG91Y2hlZCgpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrQ29udHJvbHNBc0RpcnR5QW5kVG91Y2hlZEJ5UGF0aCAoZm9ybTogRm9ybUdyb3VwLCBjb250cm9sTmFtZXM6IHN0cmluZ1tdKSB7XG4gIGNvbnRyb2xOYW1lcy5mb3JFYWNoKGNvbnRyb2xOYW1lID0+IHtcbiAgICBjb25zdCBjb250cm9sID0gZm9ybS5nZXQoY29udHJvbE5hbWUpXG4gICAgaWYgKGNvbnRyb2wgIT0gbnVsbCkge1xuICAgICAgY29udHJvbC5tYXJrQXNUb3VjaGVkKClcbiAgICAgIGNvbnRyb2wubWFya0FzRGlydHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBgQXR0ZW1wdGVkIHRvIHNldCBjb250cm9sIHdpdGggbmFtZSAke2NvbnRyb2xOYW1lfSBhcyBkaXJ0eSBhbmQgdG91Y2hlZCwgYCArXG4gICAgICAgIGBidXQgaXQgd2FzIG5vdCBmb3VuZC5gLFxuICAgICAgKVxuICAgIH1cbiAgfSlcbn1cblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2NvbW1vbkZvcm1dJyxcbn0pXG5leHBvcnQgY2xhc3MgQ29tbW9uRm9ybURpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgQ29tbW9uRm9ybUNvbmZpZyB7XG5cbiAgcHJpdmF0ZSBzdWJtaXQkID0gbmV3IHJ4LlN1YmplY3Q8YW55PigpXG5cbiAgQE91dHB1dCgpIHB1YmxpYyBpc0xvYWRpbmcgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KClcblxuICBwdWJsaWMgZ2V0IGlzTG9hZGluZyQgKCk6IHJ4Lk9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmlzTG9hZGluZy5hc09ic2VydmFibGUoKVxuICB9XG5cbiAgQE91dHB1dCgpIHB1YmxpYyBjb21tb25Gb3JtU3VibWl0ID0gbmV3IEV2ZW50RW1pdHRlcjxyeC5PYnNlcnZhYmxlPGFueT4+KClcblxuICAvKipcbiAgICogU2V0IHRvIHRydWUgaWYgeW91IHdhbnQgdG8gcHJvcGFnYXRlIGVycm9ycyB0byB0aGUgY29uc3VtZXIgY29tcG9uZW50LlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIHByb3BhZ2F0ZUVycm9yczogYm9vbGVhblxuXG4gIC8qKlxuICAgKiBSaWdodCBhZnRlciB0aGUgZm9ybSdzIHN1Ym1pdCBldmVudCBhbmQgYmVmb3JlIG5neC1jb21tb24tZm9ybXMgZG9lcyBhbnl0aGluZyxcbiAgICogdGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJ1biBpZiBnaXZlbi5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyBwcmVTdWJtaXQ/OiAoKSA9PiB2b2lkXG5cbiAgLyoqXG4gICAqIFNldCB0aGlzIGlucHV0IHRvIG92ZXJyaWRlIHRoZSBwcm92aWRlZCB0cmFuc2Zvcm0gZnVuY3Rpb24uXG4gICAqL1xuICBASW5wdXQoKSBwdWJsaWMgdHJhbnNmb3JtOiBDb21tb25Gb3JtVHJhbnNmb3JtXG5cbiAgLyoqXG4gICAqIEEgcHJlZGljYXRlIHRvIGRldGVybWluZSBpZiB0aGUgZXJyb3IgaXMgc3VwcG9zZWQgdG8gYmUgdHJlYXRlZCBhcyBhIHZhbGlkYXRpb25cbiAgICogZXJyb3IgZnJvbSB0aGUgc2VydmVyIHJlc3BvbnNlLlxuICAgKi9cbiAgQElucHV0KCkgcHVibGljIGlzVmFsaWRhdGlvbkVycm9yOiBDb21tb25Gb3JtSXNWYWxpZGF0aW9uRXJyb3JcblxuICAvKipcbiAgICogU2V0IHRoaXMgaW5wdXQgdG8gb3ZlcnJpZGUgdGhlIHByb3ZpZGVkIHRyYW5zZm9ybSBlcnJvciBmdW5jdGlvbi5cbiAgICovXG4gIEBJbnB1dCgpIHB1YmxpYyB0cmFuc2Zvcm1FcnJvcjogQ29tbW9uRm9ybVRyYW5zZm9ybUVycm9yXG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIG9ic2VydmFibGUsIHByb2JhYmx5IGRvaW5nIGEgcmVxdWVzdCB0byB0aGUgbmV0d29yay5cbiAgICogRG9lcyBub3RoaW5nIGJ5IGRlZmF1bHQgYW5kIGNhbiBiZSBvbWl0dGVkLiBUaGlzIGlzIHVzZWZ1bCBmb3IgbGVzcyB0eXBpY2FsXG4gICAqIHVzZS1jYXNlcyB3aGVuIHRoZSByZXF1ZXN0IHNob3VsZCBiZSBzZW50IGZyb20gdGhlIGNvbnN1bWVyIHNpZGUgZm9yIGZpbmVyXG4gICAqIGNvbnRyb2wuXG4gICAqL1xuICBASW5wdXQoKSBwdWJsaWMgcmVxdWVzdDogQ29tbW9uRm9ybVJlcXVlc3RcblxuICAvKipcbiAgICogQW4gYWxpYXMgZm9yIFwicmVxdWVzdFwiLCBwdXJwb3NlbHkgbmFtZWQgdGhlIHNhbWUgYXMgdGhlIGRpcmVjdGl2ZSBzbyBpdCBjYW5cbiAgICogYmUgdXNlZCBpbiBhIGxlc3MgdmVyYm9zZSBmYXNoaW9uLi5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzZXQgY29tbW9uRm9ybSAocmVxdWVzdDogKHg6IGFueSkgPT4gcnguT2JzZXJ2YWJsZTxhbnk+KSB7XG4gICAgdGhpcy5yZXF1ZXN0ID0gcmVxdWVzdFxuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKlxuICAgKiBVc2VkIGludGVybmFsbHkgdG8ga2VwIHRyYWNrIG9mIGZvcm0gY29udHJvbHMgd2l0aGluIHRoZSBjb21tb24gZm9ybS5cbiAgICovXG4gIEBDb250ZW50Q2hpbGRyZW4oQ29tbW9uRm9ybUNvbnRyb2xEaXJlY3RpdmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pXG4gIHB1YmxpYyBjb250cm9sczogUXVlcnlMaXN0PENvbW1vbkZvcm1Db250cm9sRGlyZWN0aXZlPlxuXG4gIGNvbnN0cnVjdG9yIChAU2VsZigpIHByaXZhdGUgY29udGFpbmVyOiBGb3JtR3JvdXBEaXJlY3RpdmUsXG4gICAgICAgICAgICAgICBASW5qZWN0KENPTU1PTl9GT1JNX0ZVTExfQ09ORklHKSBwcml2YXRlIGNvbmZpZzogQ29tbW9uRm9ybUNvbmZpZykge1xuICB9XG5cbiAgcHVibGljIG5nT25Jbml0ICgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wYWdhdGVFcnJvcnMgPT0gbnVsbCkge1xuICAgICAgdGhpcy5wcm9wYWdhdGVFcnJvcnMgPSB0aGlzLmNvbmZpZy5wcm9wYWdhdGVFcnJvcnNcbiAgICB9XG5cbiAgICBpZiAodGhpcy50cmFuc2Zvcm0gPT0gbnVsbCkge1xuICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLmNvbmZpZy50cmFuc2Zvcm1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1ZhbGlkYXRpb25FcnJvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmlzVmFsaWRhdGlvbkVycm9yID0gdGhpcy5jb25maWcuaXNWYWxpZGF0aW9uRXJyb3JcbiAgICB9XG5cbiAgICBpZiAodGhpcy50cmFuc2Zvcm1FcnJvciA9PSBudWxsKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybUVycm9yID0gdGhpcy5jb25maWcudHJhbnNmb3JtRXJyb3JcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZXF1ZXN0ID09IG51bGwpIHtcbiAgICAgIHRoaXMucmVxdWVzdCA9IHRoaXMuY29uZmlnLnJlcXVlc3RcbiAgICB9XG5cbiAgICB0aGlzLmNvbnRhaW5lci5uZ1N1Ym1pdC5waXBlKFxuICAgICAgcnhvcC50YXAoKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGlmICh0aGlzLnByZVN1Ym1pdCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5wcmVTdWJtaXQoKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHJ4b3AubWFwKCgpID0+IHRoaXMuY29udGFpbmVyLmNvbnRyb2wpLFxuICAgICAgcnhvcC5maWx0ZXIoZm9ybSA9PiB7XG4gICAgICAgIGlmIChmb3JtLnZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBhYnN0cmFjdENvbnRyb2xzID0gdGhpcy5jb250cm9scy5tYXAoY3RybCA9PiBjdHJsLm5nQ29udHJvbC5jb250cm9sKVxuICAgICAgICAgIG1hcmtDb250cm9sc0FzRGlydHlBbmRUb3VjaGVkKGFic3RyYWN0Q29udHJvbHMpXG4gICAgICAgICAgY29uc3QgZmlyc3RJbnZhbGlkQ29udHJvbCA9IHRoaXMuY29udHJvbHMuZmluZChjdHJsID0+IGN0cmwubmdDb250cm9sLmludmFsaWQpXG4gICAgICAgICAgaWYgKGZpcnN0SW52YWxpZENvbnRyb2wgIT0gbnVsbCkge1xuICAgICAgICAgICAgZmlyc3RJbnZhbGlkQ29udHJvbC5jb21tb25Gb3JtQ29udHJvbC5mb2N1cygpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHJ4b3AubWFwKGZvcm0gPT4gdGhpcy50cmFuc2Zvcm0oZm9ybS52YWx1ZSkpLFxuICAgICAgcnhvcC50YXAoKCkgPT4gdGhpcy5pc0xvYWRpbmcuZW1pdCh0cnVlKSksXG4gICAgICByeG9wLmV4aGF1c3RNYXAodmFsdWUgPT4gdGhpcy5yZXF1ZXN0KHZhbHVlKS5waXBlKFxuICAgICAgICByeG9wLmNhdGNoRXJyb3IoKGh0dHBFcnJvclJlc3BvbnNlOiBIdHRwRXJyb3JSZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmlzVmFsaWRhdGlvbkVycm9yKGh0dHBFcnJvclJlc3BvbnNlKSkge1xuICAgICAgICAgICAgY29uc3QgZmxhdEVycm9ycyA9IHRoaXMudHJhbnNmb3JtRXJyb3IoaHR0cEVycm9yUmVzcG9uc2UpXG4gICAgICAgICAgICBjb25zdCBjb250cm9sc1dpdGhFcnJvcnMgPSB0aGlzLnNldEVycm9ycyhmbGF0RXJyb3JzKVxuICAgICAgICAgICAgY29uc3QgZmlyc3RJbnZhbGlkQ29udHJvbCA9IHRoaXMuY29udHJvbHNcbiAgICAgICAgICAgICAgLmZpbmQoY3RybCA9PiBjb250cm9sc1dpdGhFcnJvcnMuaW5kZXhPZihjdHJsLm5nQ29udHJvbC5jb250cm9sKSA+IC0xKVxuICAgICAgICAgICAgaWYgKGZpcnN0SW52YWxpZENvbnRyb2wgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaXJzdEludmFsaWRDb250cm9sLmNvbW1vbkZvcm1Db250cm9sLmZvY3VzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMucHJvcGFnYXRlRXJyb3JzKSB7XG4gICAgICAgICAgICB0aGlzLmNvbW1vbkZvcm1TdWJtaXQuZW1pdChyeC50aHJvd0Vycm9yKGh0dHBFcnJvclJlc3BvbnNlKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJ4LkVNUFRZXG4gICAgICAgIH0pLFxuICAgICAgICByeG9wLmZpbmFsaXplKCgpID0+IHRoaXMuaXNMb2FkaW5nLmVtaXQoZmFsc2UpKSxcbiAgICAgICAgKSxcbiAgICAgICksXG4gICAgICByeG9wLmZpbmFsaXplKCgpID0+IHRoaXMuaXNMb2FkaW5nLmVtaXQoZmFsc2UpKSxcbiAgICAgIHJ4b3AuY2F0Y2hFcnJvcigoZXJyLCBjYXVnaHQpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3Igd2hpbGUgaGFuZGxpbmcgZm9ybSBzdWJtaXNzaW9uIGluc2lkZSBDb21tb24gRm9ybWAsIGVycilcbiAgICAgICAgcmV0dXJuIGNhdWdodFxuICAgICAgfSksXG4gICAgKS5zdWJzY3JpYmUocmVzcG9uc2UgPT4ge1xuICAgICAgdGhpcy5jb21tb25Gb3JtU3VibWl0LmVtaXQocngub2YocmVzcG9uc2UpKVxuICAgIH0pXG5cbiAgfVxuXG4gIHByaXZhdGUgc2V0RXJyb3JzIChlcnJvcnM6IEZsYXRTZXJ2ZXJFcnJvcnMpOiBBYnN0cmFjdENvbnRyb2xbXSB7XG4gICAgY29uc3QgZm9ybSA9IHRoaXMuY29udGFpbmVyLmZvcm0gYXMgRm9ybUdyb3VwXG5cbiAgICBPYmplY3Qua2V5cyhlcnJvcnMpLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICBjb25zdCBjb250cm9sID0gZm9ybS5nZXQocGF0aClcbiAgICAgIGlmIChjb250cm9sID09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBgQVBJIGNsYWltcyB0aGF0IGEgYWZpZWxkIHdpdGggcGF0aCAke3BhdGh9IGlzIGludmFsaWQsIGAgK1xuICAgICAgICAgIGBidXQgbm8gc3VjaCBmaWVsZCB3YXMgZm91bmQgb24gdGhlIGZvcm0uYCxcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFya0NvbnRyb2xzQXNEaXJ0eUFuZFRvdWNoZWRCeVBhdGgoZm9ybSwgW3BhdGhdKVxuICAgICAgICBmb3JtLmdldChwYXRoKS5zZXRFcnJvcnMoe3NlcnZlckVycm9yOiBlcnJvcnNbcGF0aF19KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZXJyb3JzKS5tYXAocGF0aCA9PiBmb3JtLmdldChwYXRoKSlcbiAgfVxuXG59XG4iXX0=