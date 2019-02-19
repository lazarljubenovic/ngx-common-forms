import {AbstractControl, ControlContainer} from '@angular/forms'
import {Directive, DoCheck, EmbeddedViewRef, Inject, Input, isDevMode, OnInit, Optional, TemplateRef, ViewContainerRef} from '@angular/core'
import {SinModuleConfig, WhenFunction, WhenObject} from './interfaces'
import * as rx from 'rxjs'
import {SIN_FULL_CONFIG} from './config'
import {SinsDirective} from './sins.directive'

export interface SinNotification {
  type: 'add'
  control: AbstractControl
  error: any
}

@Directive({selector: '[sin]'})
export class SinDirective implements OnInit, DoCheck, SinModuleConfig {

  public visible$ = new rx.BehaviorSubject<AbstractControl | null>(null)

  private _control: AbstractControl
  private _controlWithErrors: AbstractControl

  @Input('sin') error: string

  @Input('sinControl')
  public set control (control: AbstractControl) {
    this._control = control
    this.initialize()
  }

  public get control (): AbstractControl {
    return this._control
  }

  // A shorter way to provide a control by only specifying the name
  @Input('sinName') public name: string

  @Input('sinErrorFromControl')
  public set controlWithErrors (control: AbstractControl) {
    this._controlWithErrors = control
  }

  public get controlWithErrors (): AbstractControl {
    return this._controlWithErrors || this.control
  }

  @Input('sinWhen') when: WhenFunction

  private embeddedViewRef: EmbeddedViewRef<any>
  private initialized = false

  constructor (private templateRef: TemplateRef<any>,
               private viewContainerRef: ViewContainerRef,
               @Inject(SIN_FULL_CONFIG) private config: SinModuleConfig,
               @Optional() private sinsDirective: SinsDirective,
               @Optional() private controlContainer: ControlContainer) {
  }

  public ngOnInit (): void {
    if (this.sinsDirective) {
      // If we're inside a sins group, use the form control specified there
      this.control = this.sinsDirective.control
    } else {
      if (this.name != null) {
        // If name is given instead of a control
        if (this.controlContainer == null) {
          // Name is useless if we're not inside a container such as FormGroup.
          throw new Error(`You cannot register sinName "${this.name}" outside of a control ` +
            `container. You can use the sinControl input to pass in the control directly.`)
        } else {
          // We grab the control with such name
          const control = this.controlContainer.control.get(this.name)
          if (control == null) {
            // There's no control with such name, probably a typo.
            throw new Error(`Cannot find control "${name}" to bind to sin.`)
          } else {
            // We use this control. It's important we trigger the setter here.
            this.control = control
          }
        }
      }
    }

    if (isDevMode() && this.control == null) {
      // Control has not been specified directly (sinControl),
      // cannot be determined by the given name (sinName),
      // and there is no enclosing sins.
      throw new Error(`No control specified for sin.`)
    }
  }

  public ngDoCheck (): void {
    if (!this.initialized) {
      return
    }
    this.evaluate()
  }

  private initialize () {
    if (this.when == null) {
      this.when = this.config.when
    }

    this.initialized = true
  }

  private evaluate () {
    const whenControl = this.control
    const whenObj: WhenObject = {
      disabled: whenControl.disabled,
      dirty: whenControl.dirty,
      enabled: whenControl.enabled,
      invalid: whenControl.invalid,
      pending: whenControl.pending,
      pristine: whenControl.pristine,
      touched: whenControl.touched,
      untouched: whenControl.untouched,
      valid: whenControl.valid,
    }

    const hasError = this.controlWithErrors.hasError(this.error)
    const shouldDisplay = this.when(whenObj)

    if (hasError && shouldDisplay) {
      this.create()
    } else {
      this.destroy()
    }
  }

  private create () {
    if (this.embeddedViewRef == null) {
      this.visible$.next(this.control)
      const error = this.controlWithErrors.errors[this.error]
      this.embeddedViewRef = this.viewContainerRef
        .createEmbeddedView(this.templateRef, {$implicit: error})
    }
  }

  private destroy () {
    if (this.embeddedViewRef != null) {
      this.visible$.next(null)
      this.embeddedViewRef.destroy()
      this.embeddedViewRef = null
    }
  }

}
