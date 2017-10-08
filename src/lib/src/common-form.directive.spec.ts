// tslint:disable:max-line-length
import {CommonFormDirective} from './common-form.directive'
import {Component, DebugElement} from '@angular/core'
import {AbstractControl, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {CommonFormsModule} from './common-forms.module'
import {Observable} from 'rxjs/Observable'
import {HttpErrorResponse} from '@angular/common/http'
import 'rxjs/add/operator/timeoutWith'
import 'rxjs/add/operator/delay'
import 'rxjs/add/observable/never'
import 'rxjs/add/observable/of'
import {By} from '@angular/platform-browser'
import {FlatServerErrors} from './interfaces'
// tslint:enable:max-line-length

function emailValidator(control: AbstractControl) {
  const {value} = control
  if (value == null || value == '') {
    return null
  } else {
    return Validators.email(control)
  }
}

describe('CommonFormDirective', () => {

  interface FormValue {
    username: string;
    password: string;
    newsletter: boolean;
    email?: string;
  }

  @Component({
    template: `
      <form [formGroup]="form"
            [ngxCommonForm]="request"
            (ngxSubmit)="onSubmit($event)"
            [propagateErrors]="true"
      >
        <div>
          <label>
            <span>Userame</span>
            <input type="text" [formControl]="form.get('username')" name="username">
          </label>
        </div>
        <div>
          <label>
            <span>Password</span>
            <input type="password" formControlName="password">
          </label>
        </div>
        <div>
          <fieldset>
            <legend>Receive newsletter?</legend>
            <label>
              <input type="radio" formControlName="newsletter" [value]="true">
              <span>Yes</span>
            </label>
            <label>
              <input type="radio" formControlName="newsletter" [value]="false">
              <span>No</span>
            </label>
          </fieldset>
        </div>
        <div *ngIf="form.get('newsletter').value === true">
          <label>
            <span>Email</span>
            <input type="email" formControlName="email">
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>

      <pre class="error">{{ error }}</pre>
    `,
    styles: [`:not(form).ng-dirty.ng-touched.ng-invalid {
      background-color: red
    }`],
  })
  class TestComponent {
    form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      newsletter: [null, Validators.required],
      email: ['', []],
    }, {
      validator: (c: AbstractControl) => {
        if (c.get('newsletter').value) {
          return Validators.compose([Validators.required, emailValidator])(c.get('email'))
        } else {
          return null
        }
      }
    })

    response: any
    error: string

    constructor(private fb: FormBuilder) {}

    request = (formValue: FormValue) => {
      if (formValue.email == 'taken@email.address') {
        return Observable.never()
          .timeoutWith(10, Observable.throw(new HttpErrorResponse({
            status: 422,
            error: {
              message: 'Some fields failed validation',
              fields: {
                email: 'That email had already been taken',
              },
            },
          })))
      } else if (formValue.username == 'username' && formValue.password == 'password') {
        return Observable.of('success').delay(10)
      } else {
        return Observable.never()
          .timeoutWith(10, Observable.throw(new HttpErrorResponse({
            status: 401,
            error: {
              message: 'Incorrect credentials'
            },
          })))
      }
    }

    onSubmit(response$: Observable<any>) {
      response$.subscribe(
        (r) => {
          this.response = r
        },
        (httpErrorResponse: HttpErrorResponse) => {
          this.error = httpErrorResponse.error.message
        }
      )
    }
  }

  let fixture: ComponentFixture<TestComponent>

  const restart = () => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        ReactiveFormsModule,
        CommonFormsModule.forRoot({
          transformError: (res: HttpErrorResponse): FlatServerErrors => {
            return res.error.fields
          },
        }),
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(TestComponent)
    fixture.detectChanges()
  }

  beforeEach(() => {
    restart()
    spyOn(console, 'error')
  })

  const $ = (css: string) => fixture.debugElement.query(By.css(css))
  const $$ = (css: string) => fixture.debugElement.queryAll(By.css(css))

  // Some helpers
  const cmp = () => fixture.componentInstance
  const form = () => cmp().form
  const controlNames: (keyof FormValue)[] = ['username', 'password', 'newsletter', 'email']
  const controls = () => controlNames.map(name => form().get(name))
  const field = (path: keyof FormValue) => form().get(path)
  const setValue = (path: keyof FormValue, value: any) => field(path).setValue(value)
  const response = () => cmp().response
  const submit = () => $('button[type=submit]').nativeElement.click()
  const hasClasses = (debugElement: DebugElement, classNames: string[]) =>
    expect(classNames.every(className => debugElement.classes[className])).toBeTruthy()

  describe(`form submission`, () => {

    it(`should submit the valid form and emit an event`, async () => {
      setValue('username', 'username')
      setValue('password', 'password')
      setValue('newsletter', true)
      setValue('email', 'name@example')
      submit()

      fixture.detectChanges()
      expect(response()).toBe(undefined)

      await fixture.whenStable()
      fixture.detectChanges()
      expect(response()).toBe('success')
      expect(console.error).not.toHaveBeenCalled()
    })

    it(`should submit invalid form and trigger validation`, async () => {
      // we skip username on purpose
      setValue('password', 'password')
      setValue('newsletter', true)
      setValue('email', 'name@example')
      submit()

      fixture.detectChanges()
      expect(response()).toBe(undefined)

      await fixture.whenStable()
      fixture.detectChanges()
      expect(response()).toBe(undefined)

      hasClasses($('[name=username]'), ['ng-dirty', 'ng-touched', 'ng-invalid'])
      hasClasses($('[name=password]'), ['ng-dirty', 'ng-touched', 'ng-valid'])
      hasClasses($('[name=newsletter]'), ['ng-dirty', 'ng-touched', 'ng-valid'])
      expect(console.error).not.toHaveBeenCalled()
    })

    it(`should successfully submit after a failed attempt`, async () => {
      setValue('password', 'password')
      setValue('newsletter', true)
      setValue('email', 'name@example')
      submit()
      fixture.detectChanges()
      // same state as previous test

      setValue('username', 'username')
      submit()
      fixture.detectChanges()

      await fixture.whenStable()
      expect(response()).toBe('success')
      expect(console.error).not.toHaveBeenCalled()
    })

    it(`should correctly interpret server's response as validation`, async () => {
      setValue('username', 'username')
      setValue('password', 'password')
      setValue('newsletter', true)
      setValue('email', 'taken@email.address')
      submit()
      fixture.detectChanges()

      await fixture.whenStable()
      fixture.detectChanges()
      expect(cmp().response).toBe(undefined)
      expect(cmp().error).toBe('Some fields failed validation') // errors are propagated
      hasClasses($('[name=username]'), ['ng-pristine', 'ng-untouched', 'ng-valid'])
      hasClasses($('[name=password]'), ['ng-pristine', 'ng-untouched', 'ng-valid'])
      hasClasses($('[name=newsletter]'), ['ng-pristine', 'ng-untouched', 'ng-valid'])
      hasClasses($('[name=email]'), ['ng-dirty', 'ng-touched', 'ng-invalid'])
      expect(form().get('email').errors['serverError']).toEqual('That email had already been taken')
      expect(console.error).not.toHaveBeenCalled()
    })

    it(`should propagate a 401 error`, async () => {
      setValue('username', 'username')
      setValue('password', 'wrong password')
      setValue('newsletter', true)
      setValue('email', 'name@example')
      submit()
      fixture.detectChanges()

      await fixture.whenStable()
      fixture.detectChanges()
      expect(cmp().response).toBeUndefined()
      expect(cmp().error).toBe('Incorrect credentials')
      expect(console.error).not.toHaveBeenCalled()
    })

  })

  describe(`submission without any filled fields`, () => {

    it(`should mark all fields present in DOM as touched and dirty`, async () => {
      submit()
      fixture.detectChanges()
      await fixture.whenStable()
      fixture.detectChanges()

      expect(cmp().response).toBeUndefined()
      expect(cmp().error).toBeUndefined()
      hasClasses($('[name=username]'), ['ng-dirty', 'ng-touched', 'ng-invalid'])
      hasClasses($('[name=password]'), ['ng-dirty', 'ng-touched', 'ng-invalid'])
      hasClasses($('[name=newsletter]'), ['ng-dirty', 'ng-touched', 'ng-invalid'])
      expect($('[name=email]')).toBeNull() // not in DOM
    })

    it(`should not mark field not in DOM when submit was pressed as touched or dirty`, async () => {
      submit()
      fixture.detectChanges()
      await fixture.whenStable()
      fixture.detectChanges()

      form().get('newsletter').setValue(true)
      fixture.detectChanges()

      hasClasses($('[name=email]'), ['ng-pristine', 'ng-untouched', 'ng-valid'])
    })

  })

})
