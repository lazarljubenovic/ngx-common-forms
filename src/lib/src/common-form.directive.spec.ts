// tslint:disable:max-line-length
import {CommonFormDirective} from './common-form.directive'
import {Component, DebugElement, forwardRef, Input} from '@angular/core'
import {AbstractControl, ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators} from '@angular/forms'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {CommonFormsModule} from './common-forms.module'
import {Observable} from 'rxjs/Observable'
import {HttpErrorResponse} from '@angular/common/http'
import 'rxjs/add/operator/timeoutWith'
import 'rxjs/add/operator/delay'
import 'rxjs/add/observable/never'
import 'rxjs/add/observable/of'
import {By} from '@angular/platform-browser'
import {CommonFormControl, FlatServerErrors} from './interfaces'
import {COMMON_FORM_CONTROL} from './config'
import {DOCUMENT} from '@angular/common'
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
            <span>Username</span>
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
  const document = () => fixture.debugElement.injector.get<Document>(DOCUMENT)
  const hasFocus = (el: DebugElement) => expect(document().activeElement).toEqual(el.nativeElement)

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
      hasFocus($('[name=username]'))
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
      hasFocus($('[name=email]'))
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
      hasFocus($('[name=username]'))
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

describe(`Settings name properties and attributes`, () => {

  @Component({
    selector: 'custom-control',
    template: `
      <input type="text"
             [value]="value"
             (change)="value = $event.target.value"
             [attr.name]="name"
             [name]="name"
      >
    `,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CustomControlComponent),
        multi: true,
      },
      {
        provide: COMMON_FORM_CONTROL,
        useExisting: forwardRef(() => CustomControlComponent),
      },
    ],
  })
  class CustomControlComponent implements ControlValueAccessor, CommonFormControl {

    public value: string
    @Input() public name: string
    public log: string[] = []

    setName(name: string): void {
      this.log.push(`set name to ${name}`)
      this.name = name
    }

    getName(): string {
      return this.name
    }

    focus(): void {
      this.log.push(`set focus`)
    }

    onChange = (value: string): null => null
    onTouched = (vaule: string): null => null

    writeValue(obj: any): void {
      this.value = obj
    }

    registerOnChange(fn: any): void {
      this.onChange = fn
    }

    registerOnTouched(fn: any): void {
      this.onTouched = fn
    }

  }

  @Component({
    template: `
      <form [formGroup]="form" ngxCommonForm>
        <custom-control [formControl]="form.get('a')"></custom-control>
        <custom-control formControlName="b"></custom-control>
        <custom-control [formControl]="form.get('c')" name="c"></custom-control>

        <input type="text" formControlName="d">
        <input type="text" [formControl]="form.get('e')">
        <input type="text" [formControl]="form.get('f')" name="f">
      </form>
    `,
  })
  class FormWithCustomComponent {
    form = this.fb.group({
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
      e: 'e',
      f: 'f',
    })

    constructor(private fb: FormBuilder) {}
  }

  let fixture: ComponentFixture<FormWithCustomComponent>

  const restart = () => {
    TestBed.configureTestingModule({
      declarations: [CustomControlComponent, FormWithCustomComponent],
      imports: [ReactiveFormsModule, CommonFormsModule.forRoot()],
    }).compileComponents()
    fixture = TestBed.createComponent(FormWithCustomComponent)
    fixture.detectChanges()
  }

  beforeEach(() => {
    restart()
    spyOn(console, 'error')
  })

  const $ = (css: string) => fixture.debugElement.query(By.css(css))
  const $$ = (css: string) => fixture.debugElement.queryAll(By.css(css))

  describe(`a custom component`, () => {
    it(`should set default name if none provided`, () => {
      expect($('input[name=a]')).toBeFalsy()
    })

    it(`should use name from formControlName`, () => {
      expect($('input[name=b]')).not.toBeFalsy()
    })

    it(`should use name attribute`, () => {
      expect($('input[name=c]')).not.toBeFalsy()
    })
  })

  describe(`built-ins`, () => {
    it(`should set default name if none provided`, () => {
      expect($('input[name=e]')).toBeFalsy()
    })

    it(`should use name from formControlName`, () => {
      expect($('input[name=d]')).not.toBeFalsy()
    })

    it(`should use name attribute`, () => {
      expect($('input[name=f]')).not.toBeFalsy()
    })
  })

})
