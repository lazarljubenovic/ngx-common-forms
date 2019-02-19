# ngx-common-forms

Forms are straight-forward... if user doesn't make any mistakes. Throw in all (client-side and server-side) the validation messages, the loading spinner, disable submission while the form is already submitting, and you end up with a huge pile of mess... in every. single. form. again. and. again.

If you have a fairy common form, without some extremely crazy stuff, this package will handle all this for you, while still leaving enough room for customization. All while following regular Angular form-related principles.

# Installation

```
# with yarn
yarn add ngx-common-forms

# with npm
npm i ngx-common-forms
```

# Feature highlights

- Submitting an invalid form immediately triggers displaying **declarative client-side validation**.
- If a **server-side error** occurs, the errors are automatically inserted to the form.
- The first field marked as invalid will immediately **receive focus** to aid your users. (Also great for long forms as browsers will automatically scroll to the field.)
- Leverage the "loading" observable to **show a spinner** in the submit button (or some other indicator).
- While in loading state, form **cannot be re-submitted**.
- Your **API call is a simple function** which takes the forum value and returns an observable. You can pass it in directly from your services.

# Basic usage

## Import the module

```typescript
@NgModule({
  // ...
  imports: [
    // ...
    CommonFormModule.forRoot(),
    // ...
  ],
  // ...
})
```

## Bind the API call to `commonForm`

```typescript
// The good old service for trigger an endpoint

@Injectable()
export class ApiService {
  public logIn({ username, passowrd }): Observable<any> {
    return this.http.post(
      `https://api.example/log-in`,
      { username, password },
    );
  }
}
```

```typescript
@Component({ /* ... */ })
export class MyComponent {
  constructor(private fb: FormBuilder,
              public api: ApiService) { // inject the service
  }
  
  // A regular reactive form, with regular validation messages.
  public form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Instead of `(ngSubmit)`, you listen to `(commonFormSubmit)` and react to form submission.
  // For example, you can redirect here or display a snackbar indicating success,
  // or further react to errors in submission.
  public onSubmit(response$: Observable<any>) {
    response$.subscribe(response => {
      console.log(response);
    });
  }
}
```

```html
<form [formGroup]="form"
      [commonForm]="api.logIn.bind(api)"
      (commonFormSubmit)="onSubmit($event)"
>

  <label>
    <span>Username</span>
    <input type="text" formControlName="username">
  </label>
  <div sins="username">
    <!-- The library handles displaying these at the right time. -->
    <!-- All you have to do is type them out (and give them styles, animations, etc). -->
    <span *sin="'required'">Username is required.</span>
    <span *sin="'serverError' let msg">{{ msg }}</span>
  </div>
  
  <label>
    <span>Password</span>
    <input type="password" formControlName="password">
  </label>
  <div sins="password">
    <span *sin="'required'">Password is required.</span>
    <span *sin="'minlength'">Password must have at least 6 characters.</span>
    <span *sin="'serverError' let msg">{{ msg }}</span>
    <!-- If the server responds with an error, it will be added to form's errors under key "serverError". -->
    <!-- The exact message is also available via a simple binding, as above. -->  
  </div>

  <button type="submit">Log in</button>

</form>
```

## Button spinner

See `src/app/button.component.ts`.

# Finer configuration

Different apps will have different kinds of forms, but even more different kinds of APIs. Each team has established habits which they follow across every project. Hence, `ngx-common-forms` offers configuration settings to match your API.

The default configuration is supplied as an object to the `forRoot` method call when importing the module. Here's the typing information for this object.

```typescript
export interface CommonFormConfigObject {
  propagateErrors?: boolean;
  transform?: CommonFormTransform;
  isValidationError?: CommonFormIsValidationError;
  transformError?: CommonFormTransformError;
  request?: CommonFormRequest;
}

export type CommonFormTransform = (formValue: any) => any;
export type CommonFormIsValidationError = (response: HttpErrorResponse) => boolean
export type CommonFormTransformError = (formValue: any) => FlatServerErrors;
export type CommonFormRequest<T = any> = (formValue: T) => Observable<T>;

export interface FlatServerErrors {
  [path: string]: string;
}
```

Each of these keys can also be configured individually on per-form basis, which allows you to overwrite these global settings in case some of the forms is one-of-a-kind.

## Request

The request option doesn't make much sense to be configured globally, since it's the function which takes form value and returns an observable. Typically this is what you already have in your service methods. 
 
For providing it as an input, you can use the `[request]` input. However, since this is the main which you always use, there's an alias `[commonForm]`. Since `commonForm` is also the name of the directive, you write it only once this way, saving keystrokes.

## Transform

Before you send the form value to the server, you might want to transform it a bit. This can be done in the request function itself, but `ngx-common-forms` also allows you to provide a separate transforming function. Basically, this means that instead of `request(formValue)`, the library does `request(transform(formValue))`.

## Is validation error

Use `isValidationError` to pass in a predicate<sup>†</sup> used to determine if the error which occurred during the request is supposed to be queried for validation errors inside. By default this checks for the 422 status in HTTP response.

This is how you tell the lib which type of error responses you consider "validation errors". For example, a 5xx and 4xx error should probably be handled differently.

<sup>†</sup> A predicate is a function which returns boolean value.

## Transform error

When the lib understands which types of errors should be treated as validation errors, it must also know how to interpret the payload from the response and apply it to the form (in order to show validation messages). `transformError` is a function which describes how the server response should be mapped to `FlatServerErrors`, which has a simple signature `{ [path: string]: string }`.

Here's an example of a flat error.

```javascript
{
  'username': 'Username must not contain spaces',
  'location': 'Invalid location, see details below',
  'location.zip': 'This field must contain a valid zip code',
}
```

## Propagate errors

The `propagateErrors` is a boolean flag determining whether received error will be propagated, i.e. if the observable you receive from `(commonFormSubmit)` will throw with your server error. In most cases you do not need this as errors caught with `isValidationError` will be handled by the lib, but sometimes you might want to override it with custom logic tied too closely to the component.

---

> Built with `@angular/cli@7.3.1`.

---
