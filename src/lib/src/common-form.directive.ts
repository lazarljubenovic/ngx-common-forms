import {Directive, EventEmitter, Inject, Input, OnInit, Output, Self} from '@angular/core'
import {Observable} from 'rxjs/Observable'
import {FormGroup, FormGroupDirective} from '@angular/forms'

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
import {
  CommonFormConfig,
  CommonFormRequest,
  CommonFormTransform,
  CommonFormTransformError,
  FlatServerErrors,
} from './interfaces'
import {COMMON_FORM_CONFIG} from './config'

export function markControlsAsDirtyAndTouched(form: FormGroup, controlNames: string[]) {
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

export function markAllControlsAsDirtyAndTouched(form: FormGroup): void {
  Object.keys(form.controls).forEach(controlName => {
    const control = form.get(controlName)
    if (control instanceof FormGroup) {
      markAllControlsAsDirtyAndTouched(control)
    } else {
      control.markAsTouched()
      control.markAsDirty()
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

  constructor(@Self() private container: FormGroupDirective,
              @Inject(COMMON_FORM_CONFIG) private config: CommonFormConfig) {
  }

  ngOnInit() {
    if (this.propagateErrors == null) {
      this.propagateErrors = this.config.propagateErrors
    }

    if (this.transform == null) {
      this.transform = this.config.transform
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
          markAllControlsAsDirtyAndTouched(form)
          return false
        }
      })
      .map(form => this.transform(form.value))
      .do(() => this.isLoading.emit(true))
      .exhaustMap(value => this.request(value)
        .catch((err: HttpErrorResponse, caught) => {
          const flatErrors = this.transformError(err)
          this.setErrors(flatErrors)
          if (this.propagateErrors) {
            this.ngxSubmit.emit(Observable.throw(err))
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

  private setErrors(errors: FlatServerErrors) {
    const form = this.container.form as FormGroup
    Object.keys(errors).forEach(path => {
      const control = form.get(path)
      if (control == null) {
        console.error(
          `API claims that a field with path ${path} is, ` +
          `but no such field was found on the form.`,
        )
      } else {
        markControlsAsDirtyAndTouched(form, [path])
        form.get(path).setErrors({serverError: errors[path]})
      }
    })
  }

}
