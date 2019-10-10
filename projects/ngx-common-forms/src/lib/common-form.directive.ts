import {AbstractControl, FormGroup, FormGroupDirective} from '@angular/forms'
import {ContentChildren, Directive, EventEmitter, Inject, Input, OnInit, Output, QueryList, Self} from '@angular/core'
import * as rx from 'rxjs'
import * as rxop from 'rxjs/operators'
import {
  CommonFormConfig,
  CommonFormIsValidationError,
  CommonFormRequest,
  CommonFormTransform,
  CommonFormTransformError,
  FlatServerErrors,
} from './interfaces'
import {COMMON_FORM_FULL_CONFIG} from './config'
import {CommonFormControlDirective} from './common-form-control.directive'
import {HttpErrorResponse} from '@angular/common/http'

function markControlsAsDirtyAndTouched (controls: AbstractControl[]) {
  controls.forEach(control => {
    control.markAsDirty()
    control.markAsTouched()
  })
}

export function markControlsAsDirtyAndTouchedByPath (form: FormGroup, controlNames: string[]) {
  controlNames.forEach(controlName => {
    const control = form.get(controlName)
    if (control != null) {
      control.markAsTouched()
      control.markAsDirty()
    } else {
      console.error(
        `Attempted to set control with name ${controlName} as dirty and touched, ` +
        `but it was not found.`,
      )
    }
  })
}

@Directive({
  selector: '[commonForm]',
})
export class CommonFormDirective implements OnInit, CommonFormConfig {

  private submit$ = new rx.Subject<any>()

  @Output() public isLoading = new EventEmitter<boolean>()

  public get isLoading$ (): rx.Observable<boolean> {
    return this.isLoading.asObservable()
  }

  @Output() public commonFormSubmit = new EventEmitter<rx.Observable<any>>()

  /**
   * Set to true if you want to propagate errors to the consumer component.
   */
  @Input() public propagateErrors: boolean

  /**
   * Right after the form's submit event and before ngx-common-forms does anything,
   * this function will be run if given.
   */
  @Input() public preSubmit?: () => void

  /**
   * Set this input to override the provided transform function.
   */
  @Input() public transform: CommonFormTransform

  /**
   * A predicate to determine if the error is supposed to be treated as a validation
   * error from the server response.
   */
  @Input() public isValidationError: CommonFormIsValidationError

  /**
   * Set this input to override the provided transform error function.
   */
  @Input() public transformError: CommonFormTransformError

  /**
   * A function returning an observable, probably doing a request to the network.
   * Does nothing by default and can be omitted. This is useful for less typical
   * use-cases when the request should be sent from the consumer side for finer
   * control.
   */
  @Input() public request: CommonFormRequest

  /**
   * An alias for "request", purposely named the same as the directive so it can
   * be used in a less verbose fashion..
   */
  @Input()
  public set commonForm (request: (x: any) => rx.Observable<any>) {
    this.request = request
  }

  /**
   * @internal
   *
   * Used internally to kep track of form controls within the common form.
   */
  @ContentChildren(CommonFormControlDirective, {descendants: true})
  public controls: QueryList<CommonFormControlDirective>

  constructor (@Self() private container: FormGroupDirective,
               @Inject(COMMON_FORM_FULL_CONFIG) private config: CommonFormConfig) {
  }

  public ngOnInit (): void {
    if (this.propagateErrors == null) {
      this.propagateErrors = this.config.propagateErrors
    }

    if (this.transform == null) {
      this.transform = this.config.transform
    }

    if (this.isValidationError == null) {
      this.isValidationError = this.config.isValidationError
    }

    if (this.transformError == null) {
      this.transformError = this.config.transformError
    }

    if (this.request == null) {
      this.request = this.config.request
    }

    this.container.ngSubmit.pipe(
      rxop.tap((event: Event) => {
        event.preventDefault()
        if (this.preSubmit != null) {
          this.preSubmit()
        }
      }),
      rxop.map(() => this.container.control),
      rxop.filter(form => {
        if (form.valid) {
          return true
        } else {
          const abstractControls = this.controls.map(ctrl => ctrl.ngControl.control)
          markControlsAsDirtyAndTouched(abstractControls)
          const firstInvalidControl = this.controls.find(ctrl => ctrl.ngControl.invalid)
          if (firstInvalidControl != null) {
            firstInvalidControl.commonFormControl.focus()
          }
          return false
        }
      }),
      rxop.map(form => this.transform(form.value)),
      rxop.tap(() => this.isLoading.emit(true)),
      rxop.exhaustMap(value => this.request(value).pipe(
        rxop.catchError((httpErrorResponse: HttpErrorResponse) => {
          if (this.isValidationError(httpErrorResponse)) {
            const flatErrors = this.transformError(httpErrorResponse)
            const controlsWithErrors = this.setErrors(flatErrors)
            const firstInvalidControl = this.controls
              .find(ctrl => controlsWithErrors.indexOf(ctrl.ngControl.control) > -1)
            if (firstInvalidControl != null) {
              firstInvalidControl.commonFormControl.focus()
            }
          }
          if (this.propagateErrors) {
            this.commonFormSubmit.emit(rx.throwError(httpErrorResponse))
          }
          return rx.EMPTY
        }),
        rxop.finalize(() => this.isLoading.emit(false)),
        ),
      ),
      rxop.finalize(() => this.isLoading.emit(false)),
      rxop.catchError((err, caught) => {
        console.error(`Error while handling form submission inside Common Form`, err)
        return caught
      }),
    ).subscribe(response => {
      this.commonFormSubmit.emit(rx.of(response))
    })

  }

  private setErrors (errors: FlatServerErrors): AbstractControl[] {
    const form = this.container.form as FormGroup

    Object.keys(errors).forEach(path => {
      const control = form.get(path)
      if (control == null) {
        console.error(
          `API claims that a afield with path ${path} is invalid, ` +
          `but no such field was found on the form.`,
        )
      } else {
        markControlsAsDirtyAndTouchedByPath(form, [path])
        form.get(path).setErrors({serverError: errors[path]})
      }
    })

    return Object.keys(errors).map(path => form.get(path))
  }

}
