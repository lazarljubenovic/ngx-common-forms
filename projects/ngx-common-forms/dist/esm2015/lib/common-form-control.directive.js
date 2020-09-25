import { COMMON_FORM_CONTROL } from './config';
import { Directive, ElementRef, forwardRef, Inject, Input, Optional, Renderer2, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
function isEmpty(x) {
    return x == null || x == '';
}
export function providerFactory(klass) {
    return {
        provide: COMMON_FORM_CONTROL,
        useExisting: forwardRef(() => klass),
    };
}
export class DefaultCommonFormControlDirective {
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
export class CommonFormControlDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLWZvcm0tY29udHJvbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvbW1vbi1mb3JtLWNvbnRyb2wuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQTtBQUM1QyxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBVSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQTtBQUVqSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUE7QUFFeEMsU0FBUyxPQUFPLENBQUUsQ0FBUztJQUN6QixPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUM3QixDQUFDO0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBRSxLQUFVO0lBQ3pDLE9BQU87UUFDTCxPQUFPLEVBQUUsbUJBQW1CO1FBQzVCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0tBQ3JDLENBQUE7QUFDSCxDQUFDO0FBTUQsTUFBTSxPQUFPLGlDQUFpQztJQVM1QyxZQUFxQixRQUFtQixFQUFVLEtBQTZFO1FBQTFHLGFBQVEsR0FBUixRQUFRLENBQVc7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUF3RTtJQUMvSCxDQUFDO0lBTkQsSUFDVyxJQUFJLENBQUUsSUFBWTtRQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3BCLENBQUM7SUFLTSxPQUFPLENBQUUsSUFBWTtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQTtRQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDcEUsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUVNLEtBQUs7UUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNsQyxDQUFDOzs7WUEzQkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSwrRkFBK0Y7Z0JBQ3pHLFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2FBQ2hFOzs7WUFsQjJFLFNBQVM7WUFBbEUsVUFBVTs7O21CQXVCMUIsS0FBSzs7QUF1QlIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFBO0FBS2hCLE1BQU0sT0FBTywwQkFBMEI7SUFFckMsWUFBNEIsU0FBb0IsRUFDcUIsaUJBQW9DO1FBRDdFLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDcUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtJQUN6RyxDQUFDO0lBRU0sUUFBUTtRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDM0IsT0FBTyxDQUFDLElBQUksQ0FDViw2RUFBNkU7Z0JBQzdFLHNGQUFzRjtnQkFDdEYsa0RBQWtELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUNwRixDQUFBO1lBQ0QsT0FBTTtTQUNQO1FBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7WUFDN0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksNEJBQTRCLEVBQUUsUUFBUSxFQUFFLENBQUE7WUFDMUYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUN4QztJQUNILENBQUM7OztZQXZCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGlGQUFpRjthQUM1Rjs7O1lBaERPLFNBQVMsdUJBbURELElBQUk7NENBQ0osSUFBSSxZQUFJLFFBQVEsWUFBSSxNQUFNLFNBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT01NT05fRk9STV9DT05UUk9MfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBmb3J3YXJkUmVmLCBJbmplY3QsIElucHV0LCBPbkluaXQsIE9wdGlvbmFsLCBSZW5kZXJlcjIsIFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnXG5pbXBvcnQge0NvbW1vbkZvcm1Db250cm9sfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQge05nQ29udHJvbH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnXG5cbmZ1bmN0aW9uIGlzRW1wdHkgKHg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4geCA9PSBudWxsIHx8IHggPT0gJydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVyRmFjdG9yeSAoa2xhc3M6IGFueSkge1xuICByZXR1cm4ge1xuICAgIHByb3ZpZGU6IENPTU1PTl9GT1JNX0NPTlRST0wsXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4ga2xhc3MpLFxuICB9XG59XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2lucHV0Om5vdChbbm90Q29tbW9uQ29udHJvbF0pLHNlbGVjdDpub3QoW25vdENvbW1vbkNvbnRyb2xdKSx0ZXh0YXJlYTpub3QoW25vdENvbW1vbkNvbnRyb2xdKScsXG4gIHByb3ZpZGVyczogW3Byb3ZpZGVyRmFjdG9yeShEZWZhdWx0Q29tbW9uRm9ybUNvbnRyb2xEaXJlY3RpdmUpXSxcbn0pXG5leHBvcnQgY2xhc3MgRGVmYXVsdENvbW1vbkZvcm1Db250cm9sRGlyZWN0aXZlIGltcGxlbWVudHMgQ29tbW9uRm9ybUNvbnRyb2wge1xuXG4gIHByaXZhdGUgX25hbWU6IHN0cmluZ1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzZXQgbmFtZSAobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zZXROYW1lKG5hbWUpXG4gIH1cblxuICBjb25zdHJ1Y3RvciAocHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLCBwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQgfCBIVE1MU2VsZWN0RWxlbWVudCB8IEhUTUxUZXh0QXJlYUVsZW1lbnQ+KSB7XG4gIH1cblxuICBwdWJsaWMgc2V0TmFtZSAobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWVcbiAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICduYW1lJywgbmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBnZXROYW1lICgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9uYW1lXG4gIH1cblxuICBwdWJsaWMgZm9jdXMgKCk6IHZvaWQge1xuICAgIHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpXG4gIH1cblxufVxuXG5sZXQgdW5pcXVlSWQgPSAwXG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tmb3JtQ29udHJvbE5hbWVdOm5vdChbbm90Q29tbW9uQ29udHJvbF0pLFtmb3JtQ29udHJvbF06bm90KFtub3RDb21tb25Db250cm9sXSknLFxufSlcbmV4cG9ydCBjbGFzcyBDb21tb25Gb3JtQ29udHJvbERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgY29uc3RydWN0b3IgKEBTZWxmKCkgcHVibGljIG5nQ29udHJvbDogTmdDb250cm9sLFxuICAgICAgICAgICAgICAgQFNlbGYoKSBAT3B0aW9uYWwoKSBASW5qZWN0KENPTU1PTl9GT1JNX0NPTlRST0wpIHB1YmxpYyBjb21tb25Gb3JtQ29udHJvbDogQ29tbW9uRm9ybUNvbnRyb2wpIHtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uSW5pdCAoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNvbW1vbkZvcm1Db250cm9sKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGBBIGNvbnRyb2wgaW5zaWRlIGEgQ29tbW9uIEZvcm0gZG9lcyBub3QgcHJvdmlkZSBDT01NT05fRk9STV9DT05UUk9MIHRva2VuLiBgICtcbiAgICAgICAgYEl0IHdpbGwgYmUgaWdub3JlZC4gSWYgeW91IGRvIG5vdCB3aXNoIENvbW1vbiBGb3JtIHRvIGJlIGF3YXJlIG9mIHRoaXMgY29udHJvbCwgYWRkIGAgK1xuICAgICAgICBgW25vdENvbW1vbkNvbnRyb2xdIHNlbGVjdG9yLiBQYXRoIHRvIGNvbnRyb2w6IFwiJHt0aGlzLm5nQ29udHJvbC5wYXRoLmpvaW4oJy4nKX1cIi5gLFxuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGlzRW1wdHkodGhpcy5jb21tb25Gb3JtQ29udHJvbC5nZXROYW1lKCkpKSB7XG4gICAgICBjb25zdCBuZXdOYW1lID0gdGhpcy5uZ0NvbnRyb2wubmFtZS50b1N0cmluZygpIHx8IGBjb21tb24tZm9ybS1jb250cm9sLW5hbWUtJHsrK3VuaXF1ZUlkfWBcbiAgICAgIHRoaXMuY29tbW9uRm9ybUNvbnRyb2wuc2V0TmFtZShuZXdOYW1lKVxuICAgIH1cbiAgfVxuXG59XG4iXX0=