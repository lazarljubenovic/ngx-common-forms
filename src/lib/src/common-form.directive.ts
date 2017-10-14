// tslint:disable:max-line-length
import {ContentChildren, Directive, EventEmitter, Inject, Input, OnInit, Output, QueryList, Self} from '@angular/core'
import {Observable} from 'rxjs/Observable'
import {AbstractControl, FormGroup, FormGroupDirective} from '@angular/forms'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/exhaustMap'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/empty'
import {Subject} from 'rxjs/Subject'
import {HttpErrorResponse} from '@angular/common/http'
import {CommonFormConfig, CommonFormIsValidationError, CommonFormRequest, CommonFormTransform, CommonFormTransformError, FlatServerErrors} from './interfaces'
import {COMMON_FORM_FULL_CONFIG} from './config'
import {CommonFormControlDirective} from './common-form-control.directive'
// tslint:enable:max-line-length

export function markControlsAsDirtyAndTouched(controls: AbstractControl[]) {
  controls.forEach(control => {
    control.markAsDirty()
    control.markAsTouched()
  })
}

export function markControlsAsDirtyAndTouchedByPath(form: FormGroup, controlNames: string[]) {
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
  selector: '[ngxCommonForm]',
})
export class CommonFormDirective implements OnInit, CommonFormConfig {

  private submit$ = new Subject<any>()

  @Output() public isLoading = new EventEmitter<boolean>()

  public get isLoading$(): Observable<boolean> {
    return this.isLoading
  }

  @Output() public ngxSubmit = new EventEmitter<Observable<any>>()

  /**
   * Set to true if you want the server error to be propagated.
   */
  @Input() public propagateErrors: boolean

  /**
   * A function which transforms form's value before feeding it to request function.
   * Does nothing by default and can be safely omitted.
   */
  @Input() public transform: CommonFormTransform

  /**
   * A predicate to determine if the error is supposed to be treated as a validation
   * error from backend response.
   */
  @Input() public isValidationError: CommonFormIsValidationError

  /**
   * A function to transform errors. The result should be flattened errors string.
   */
  @Input() public transformError: CommonFormTransformError

  /**
   * A function returning an observable, probably doing a request to the network.
   * Does nothing by default and can be safely omitted (just transforms form value
   * to an observable). This is useful if sending the request should be done from
   * the consumer side in case it's not a typical use-case.
   */
  @Input() public request: CommonFormRequest

  /**
   * Alias for request so it can be used in a less verbose way.
   */
  @Input()
  public set ngxCommonForm(request: (x: any) => Observable<any>) {
    this.request = request
  }

  @ContentChildren(CommonFormControlDirective)
  public controls: QueryList<CommonFormControlDirective>

  constructor(@Self() private container: FormGroupDirective,
              @Inject(COMMON_FORM_FULL_CONFIG) private config: CommonFormConfig) {
  }

  ngOnInit() {
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

    this.container.ngSubmit
      .do((event: Event) => event.preventDefault())
      .map(() => this.container.control)
      .filter(form => {
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
      })
      .map(form => this.transform(form.value))
      .do(() => this.isLoading.emit(true))
      .exhaustMap(value => this.request(value)
        .catch((httpErrorResponse: HttpErrorResponse) => {
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
            this.ngxSubmit.emit(Observable.throw(httpErrorResponse))
          }
          return Observable.empty()
        })
        .finally(() => this.isLoading.emit(false)),
      )
      .finally(() => this.isLoading.emit(false))
      .catch((err, caught) => {
        console.error(`Error while handling form submission inside Common Form`, err)
        return caught
      })
      .subscribe(response => {
        this.ngxSubmit.emit(Observable.of(response))
      })
  }

  private setErrors(errors: FlatServerErrors): AbstractControl[] {
    const form = this.container.form as FormGroup

    Object.keys(errors).forEach(path => {
      const control = form.get(path)
      if (control == null) {
        console.error(
          `API claims that a field with path ${path} is invalid, ` +
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
