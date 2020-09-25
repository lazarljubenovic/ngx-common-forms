import {COMMON_FORM_CONTROL} from './config'
import {Directive, ElementRef, forwardRef, Inject, Input, OnInit, Optional, Renderer2, Self} from '@angular/core'
import {CommonFormControl} from './interfaces'
import {NgControl} from '@angular/forms'

function isEmpty (x: string): boolean {
  return x == null || x == ''
}

export function providerFactory (klass: any) {
  return {
    provide: COMMON_FORM_CONTROL,
    useExisting: forwardRef(() => klass),
  }
}

@Directive({
  selector: 'input:not([notCommonControl]),select:not([notCommonControl]),textarea:not([notCommonControl])',
  providers: [providerFactory(DefaultCommonFormControlDirective)],
})
export class DefaultCommonFormControlDirective implements CommonFormControl {

  private _name: string

  @Input()
  public set name (name: string) {
    this.setName(name)
  }

  constructor (private renderer: Renderer2, private elRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  }

  public setName (name: string): void {
    this._name = name
    this.renderer.setAttribute(this.elRef.nativeElement, 'name', name)
  }

  public getName (): string {
    return this._name
  }

  public focus (): void {
    this.elRef.nativeElement.focus()
  }

}

let uniqueId = 0

@Directive({
  selector: '[formControlName]:not([notCommonControl]),[formControl]:not([notCommonControl])',
})
export class CommonFormControlDirective implements OnInit {

  constructor (@Self() public ngControl: NgControl,
               @Self() @Optional() @Inject(COMMON_FORM_CONTROL) public commonFormControl: CommonFormControl) {
  }

  public ngOnInit (): void {
    if (!this.commonFormControl) {
      console.warn(
        `A control inside a Common Form does not provide COMMON_FORM_CONTROL token. ` +
        `It will be ignored. If you do not wish Common Form to be aware of this control, add ` +
        `[notCommonControl] selector. Path to control: "${this.ngControl.path.join('.')}".`,
      )
      return
    }

    if (isEmpty(this.commonFormControl.getName())) {
      const newName = this.ngControl.name.toString() || `common-form-control-name-${++uniqueId}`
      this.commonFormControl.setName(newName)
    }
  }

}
