import { ControlContainer } from '@angular/forms';
import { Directive, Inject, Input, isDevMode, Optional, TemplateRef, ViewContainerRef } from '@angular/core';
import * as rx from 'rxjs';
import { SIN_FULL_CONFIG } from './config';
import { SinsDirective } from './sins.directive';
export class SinDirective {
    constructor(templateRef, viewContainerRef, config, sinsDirective, controlContainer) {
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.config = config;
        this.sinsDirective = sinsDirective;
        this.controlContainer = controlContainer;
        this.visible$ = new rx.BehaviorSubject(null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2luLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc2luLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWtCLGdCQUFnQixFQUFDLE1BQU0sZ0JBQWdCLENBQUE7QUFDaEUsT0FBTyxFQUFDLFNBQVMsRUFBNEIsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQVUsUUFBUSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQTtBQUU1SSxPQUFPLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUMxQixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sVUFBVSxDQUFBO0FBQ3hDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQTtBQVM5QyxNQUFNLE9BQU8sWUFBWTtJQW9DdkIsWUFBcUIsV0FBNkIsRUFDN0IsZ0JBQWtDLEVBQ1QsTUFBdUIsRUFDcEMsYUFBNEIsRUFDNUIsZ0JBQWtDO1FBSjlDLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtRQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ1QsV0FBTSxHQUFOLE1BQU0sQ0FBaUI7UUFDcEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQXRDNUQsYUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBeUIsSUFBSSxDQUFDLENBQUE7UUFnQzlELGdCQUFXLEdBQUcsS0FBSyxDQUFBO0lBTzNCLENBQUM7SUFoQ0QsSUFDVyxPQUFPLENBQUUsT0FBd0I7UUFDMUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFDdkIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO0lBQ25CLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFLRCxJQUNXLGlC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LElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3ZELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGdCQUFnQjtpQkFDekMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFBO1NBQzVEO0lBQ0gsQ0FBQztJQUVPLE9BQU87UUFDYixJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUE7U0FDNUI7SUFDSCxDQUFDOzs7WUFuSUYsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQzs7O1lBWjJELFdBQVc7WUFBRSxnQkFBZ0I7NENBbUR0RyxNQUFNLFNBQUMsZUFBZTtZQS9DOUIsYUFBYSx1QkFnREwsUUFBUTtZQXJEQyxnQkFBZ0IsdUJBc0R6QixRQUFROzs7b0JBakNyQixLQUFLLFNBQUMsS0FBSztzQkFFWCxLQUFLLFNBQUMsWUFBWTttQkFXbEIsS0FBSyxTQUFDLFNBQVM7Z0NBRWYsS0FBSyxTQUFDLHFCQUFxQjttQkFTM0IsS0FBSyxTQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Fic3RyYWN0Q29udHJvbCwgQ29udHJvbENvbnRhaW5lcn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRW1iZWRkZWRWaWV3UmVmLCBJbmplY3QsIElucHV0LCBpc0Rldk1vZGUsIE9uSW5pdCwgT3B0aW9uYWwsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHtTaW5Nb2R1bGVDb25maWcsIFdoZW5GdW5jdGlvbiwgV2hlbk9iamVjdH0gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0ICogYXMgcnggZnJvbSAncnhqcydcbmltcG9ydCB7U0lOX0ZVTExfQ09ORklHfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7U2luc0RpcmVjdGl2ZX0gZnJvbSAnLi9zaW5zLmRpcmVjdGl2ZSdcblxuZXhwb3J0IGludGVyZmFjZSBTaW5Ob3RpZmljYXRpb24ge1xuICB0eXBlOiAnYWRkJ1xuICBjb250cm9sOiBBYnN0cmFjdENvbnRyb2xcbiAgZXJyb3I6IGFueVxufVxuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tzaW5dJ30pXG5leHBvcnQgY2xhc3MgU2luRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBEb0NoZWNrLCBTaW5Nb2R1bGVDb25maWcge1xuXG4gIHB1YmxpYyB2aXNpYmxlJCA9IG5ldyByeC5CZWhhdmlvclN1YmplY3Q8QWJzdHJhY3RDb250cm9sIHwgbnVsbD4obnVsbClcblxuICBwcml2YXRlIF9jb250cm9sOiBBYnN0cmFjdENvbnRyb2xcbiAgcHJpdmF0ZSBfY29udHJvbFdpdGhFcnJvcnM6IEFic3RyYWN0Q29udHJvbFxuXG4gIEBJbnB1dCgnc2luJykgZXJyb3I6IHN0cmluZ1xuXG4gIEBJbnB1dCgnc2luQ29udHJvbCcpXG4gIHB1YmxpYyBzZXQgY29udHJvbCAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgdGhpcy5fY29udHJvbCA9IGNvbnRyb2xcbiAgICB0aGlzLmluaXRpYWxpemUoKVxuICB9XG5cbiAgcHVibGljIGdldCBjb250cm9sICgpOiBBYnN0cmFjdENvbnRyb2wge1xuICAgIHJldHVybiB0aGlzLl9jb250cm9sXG4gIH1cblxuICAvLyBBIHNob3J0ZXIgd2F5IHRvIHByb3ZpZGUgYSBjb250cm9sIGJ5IG9ubHkgc3BlY2lmeWluZyB0aGUgbmFtZVxuICBASW5wdXQoJ3Npbk5hbWUnKSBwdWJsaWMgbmFtZTogc3RyaW5nXG5cbiAgQElucHV0KCdzaW5FcnJvckZyb21Db250cm9sJylcbiAgcHVibGljIHNldCBjb250cm9sV2l0aEVycm9ycyAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKSB7XG4gICAgdGhpcy5fY29udHJvbFdpdGhFcnJvcnMgPSBjb250cm9sXG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbnRyb2xXaXRoRXJyb3JzICgpOiBBYnN0cmFjdENvbnRyb2wge1xuICAgIHJldHVybiB0aGlzLl9jb250cm9sV2l0aEVycm9ycyB8fCB0aGlzLmNvbnRyb2xcbiAgfVxuXG4gIEBJbnB1dCgnc2luV2hlbicpIHdoZW46IFdoZW5GdW5jdGlvblxuXG4gIHByaXZhdGUgZW1iZWRkZWRWaWV3UmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PlxuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2VcblxuICBjb25zdHJ1Y3RvciAocHJpdmF0ZSB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PixcbiAgICAgICAgICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgIEBJbmplY3QoU0lOX0ZVTExfQ09ORklHKSBwcml2YXRlIGNvbmZpZzogU2luTW9kdWxlQ29uZmlnLFxuICAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBzaW5zRGlyZWN0aXZlOiBTaW5zRGlyZWN0aXZlLFxuICAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBjb250cm9sQ29udGFpbmVyOiBDb250cm9sQ29udGFpbmVyKSB7XG4gIH1cblxuICBwdWJsaWMgbmdPbkluaXQgKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNpbnNEaXJlY3RpdmUpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGluc2lkZSBhIHNpbnMgZ3JvdXAsIHVzZSB0aGUgZm9ybSBjb250cm9sIHNwZWNpZmllZCB0aGVyZVxuICAgICAgdGhpcy5jb250cm9sID0gdGhpcy5zaW5zRGlyZWN0aXZlLmNvbnRyb2xcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMubmFtZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIElmIG5hbWVPckNvbnRyb2wgaXMgZ2l2ZW4gaW5zdGVhZCBvZiBhIGNvbnRyb2xcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbENvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICAgICAgLy8gTmFtZSBpcyB1c2VsZXNzIGlmIHdlJ3JlIG5vdCBpbnNpZGUgYSBjb250YWluZXIgc3VjaCBhcyBGb3JtR3JvdXAuXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBZb3UgY2Fubm90IHJlZ2lzdGVyIHNpbk5hbWUgXCIke3RoaXMubmFtZX1cIiBvdXRzaWRlIG9mIGEgY29udHJvbCBgICtcbiAgICAgICAgICAgIGBjb250YWluZXIuIFlvdSBjYW4gdXNlIHRoZSBzaW5Db250cm9sIGlucHV0IHRvIHBhc3MgaW4gdGhlIGNvbnRyb2wgZGlyZWN0bHkuYClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBXZSBncmFiIHRoZSBjb250cm9sIHdpdGggc3VjaCBuYW1lT3JDb250cm9sXG4gICAgICAgICAgY29uc3QgY29udHJvbCA9IHRoaXMuY29udHJvbENvbnRhaW5lci5jb250cm9sLmdldCh0aGlzLm5hbWUpXG4gICAgICAgICAgaWYgKGNvbnRyb2wgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gVGhlcmUncyBubyBjb250cm9sIHdpdGggc3VjaCBuYW1lT3JDb250cm9sLCBwcm9iYWJseSBhIHR5cG8uXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGNvbnRyb2wgXCIke25hbWV9XCIgdG8gYmluZCB0byBzaW4uYClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UgdXNlIHRoaXMgY29udHJvbC4gSXQncyBpbXBvcnRhbnQgd2UgdHJpZ2dlciB0aGUgc2V0dGVyIGhlcmUuXG4gICAgICAgICAgICB0aGlzLmNvbnRyb2wgPSBjb250cm9sXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIHRoaXMuY29udHJvbCA9PSBudWxsKSB7XG4gICAgICAvLyBDb250cm9sIGhhcyBub3QgYmVlbiBzcGVjaWZpZWQgZGlyZWN0bHkgKHNpbkNvbnRyb2wpLFxuICAgICAgLy8gY2Fubm90IGJlIGRldGVybWluZWQgYnkgdGhlIGdpdmVuIG5hbWVPckNvbnRyb2wgKHNpbk5hbWUpLFxuICAgICAgLy8gYW5kIHRoZXJlIGlzIG5vIGVuY2xvc2luZyBzaW5zLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBjb250cm9sIHNwZWNpZmllZCBmb3Igc2luLmApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5nRG9DaGVjayAoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5ldmFsdWF0ZSgpXG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemUgKCkge1xuICAgIGlmICh0aGlzLndoZW4gPT0gbnVsbCkge1xuICAgICAgdGhpcy53aGVuID0gdGhpcy5jb25maWcud2hlblxuICAgIH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gIH1cblxuICBwcml2YXRlIGV2YWx1YXRlICgpIHtcbiAgICBjb25zdCB3aGVuQ29udHJvbCA9IHRoaXMuY29udHJvbFxuICAgIGNvbnN0IHdoZW5PYmo6IFdoZW5PYmplY3QgPSB7XG4gICAgICBkaXNhYmxlZDogd2hlbkNvbnRyb2wuZGlzYWJsZWQsXG4gICAgICBkaXJ0eTogd2hlbkNvbnRyb2wuZGlydHksXG4gICAgICBlbmFibGVkOiB3aGVuQ29udHJvbC5lbmFibGVkLFxuICAgICAgaW52YWxpZDogd2hlbkNvbnRyb2wuaW52YWxpZCxcbiAgICAgIHBlbmRpbmc6IHdoZW5Db250cm9sLnBlbmRpbmcsXG4gICAgICBwcmlzdGluZTogd2hlbkNvbnRyb2wucHJpc3RpbmUsXG4gICAgICB0b3VjaGVkOiB3aGVuQ29udHJvbC50b3VjaGVkLFxuICAgICAgdW50b3VjaGVkOiB3aGVuQ29udHJvbC51bnRvdWNoZWQsXG4gICAgICB2YWxpZDogd2hlbkNvbnRyb2wudmFsaWQsXG4gICAgfVxuXG4gICAgY29uc3QgaGFzRXJyb3IgPSB0aGlzLmNvbnRyb2xXaXRoRXJyb3JzLmhhc0Vycm9yKHRoaXMuZXJyb3IpXG4gICAgY29uc3Qgc2hvdWxkRGlzcGxheSA9IHRoaXMud2hlbih3aGVuT2JqKVxuXG4gICAgaWYgKGhhc0Vycm9yICYmIHNob3VsZERpc3BsYXkpIHtcbiAgICAgIHRoaXMuY3JlYXRlKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXN0cm95KClcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuZW1iZWRkZWRWaWV3UmVmID09IG51bGwpIHtcbiAgICAgIHRoaXMudmlzaWJsZSQubmV4dCh0aGlzLmNvbnRyb2wpXG4gICAgICBjb25zdCBlcnJvciA9IHRoaXMuY29udHJvbFdpdGhFcnJvcnMuZXJyb3JzW3RoaXMuZXJyb3JdXG4gICAgICB0aGlzLmVtYmVkZGVkVmlld1JlZiA9IHRoaXMudmlld0NvbnRhaW5lclJlZlxuICAgICAgICAuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMudGVtcGxhdGVSZWYsIHskaW1wbGljaXQ6IGVycm9yfSlcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3kgKCkge1xuICAgIGlmICh0aGlzLmVtYmVkZGVkVmlld1JlZiAhPSBudWxsKSB7XG4gICAgICB0aGlzLnZpc2libGUkLm5leHQobnVsbClcbiAgICAgIHRoaXMuZW1iZWRkZWRWaWV3UmVmLmRlc3Ryb3koKVxuICAgICAgdGhpcy5lbWJlZGRlZFZpZXdSZWYgPSBudWxsXG4gICAgfVxuICB9XG5cbn1cbiJdfQ==