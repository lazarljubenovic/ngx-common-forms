# Common Forms

`ngx-common-forms` attempts to clear the clutter and boilerplate around your Angular forms by allowing you to configure your own typical form flow and only one place.

## Highlighted features

- Attempts to submit invalid form will mark all controls as dirty and touched automatically, thus triggering **displaying errors based on Angular validators**. Works good with [`ngx-sin`](https://github.com/lazarljubenovic/ngx-sin).
- If the **server returns a response with errors**, it will automatically insert those errors into validators and mark those controls as dirty and touched.
- Exposes a **loading observable** so you can call your loading bar or display spinner in the button.
- Pass the **API call** function your service as an **input** to the directive.
- Disallows sending requests while waiting for the response.

## Installation and usage

### Install via package manager

```
# with npm
npm i ngx-common-forms
 
# with yarn
yarn ngx-common-forms
```

### Import the module

```
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

### Bind the API call to `ngxCommonForm`

```typescript
@Injectable()
export class ApiService {
  public logIn({username, passowrd}): Observable<any> {
    return this.http.post(
      `https://api.example/log-in`,
      {username, password}
    );
  }
}
```

```typescript
@Component({ /* ... */ })
export class MyComponent {
  constructor(private fb: FormBuilder,
              public api: ApiService) {
  }
  
  public form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public onSubmit(response$: Observable<any>) {
    response$.subscribe(response => {
      console.log(response);
    });
  }
}
```

```html
<form [formGroup]="form"
      [ngxCommonForm]="api.logIn.bind(api)"
      (ngxSubmit)="onSubmit($event)"
>

  <label>
    <span>Username</span>
    <input type="text" formControlName="username">
  </label>
  
  <label>
    <span>Password</span>
    <input type="password" formControlName="password">
  </label>

  <button type="submit">Log in</button>

</form>
```

### Fine configuration

You can define a set of **default configuration** values by passing in an object to the `.forRoot` static method when importing the module. You can see its type from the last interface below.

```typescript
export interface FlatServerErrors {
  [path: string]: string;
}

export type CommonFormTransform = (formValue: any) => any;
export type CommonFormIsValidationError = (response: HttpErrorResponse) => boolean
export type CommonFormTransformError = (formValue: any) => FlatServerErrors;
export type CommonFormRequest<T = any> = (formValue: T) => Observable<T>;

export interface CommonFormConfigObject {
  propagateErrors?: boolean;
  transform?: CommonFormTransform;
  isValidationError?: CommonFormIsValidationError;
  transformError?: CommonFormTransformError;
  request?: CommonFormRequest;
}
```

The default configuration object is given below.

```typescript
export const DEFAULT_CONFIG: CommonFormConfig = {
  propagateErrors: false,
  transform: x => x,
  isValidationError: response => response.status == 422,
  transformError: x => x,
  request: x => Observable.of(x),
};
```

Each of the keys can also be provided as inputs to each separate instance of the `CommonFormDirective`, which allows you to overwrite the configuration.

#### Request

The `request` option doesn't make much sense to be configured globally. For providing it as an input, you can use `[transform]` or its alias `[ngxCommonForm]` so you can combine the directive and input in one line, for brevity.


#### Transform

Use `transform` to transform form's value before feeding it to the `request` function.

#### Is validation error

Use `isValidationError` to pass in a predicate used to determine if the error which occured during the request is supposed to be queried for validation errors inside. By default this checks for the `422` status in HTTP response.
 
#### Transform error

Use `transformError` to transform the error response received from the API to an object obeying the `FlatServerErrors` interface. The resulting flat errors object is traversed and used to mark the fields as invalid.

An example of flat errors is the following object.

```js
{
  'username': 'Username must not contain spaces',
  'location': 'Invalid location, see details below',
  'location.zip': 'This field must contain a valid zip code',
}
```

It's up to you how will you _display_ these errors and will you display all of them, some of them or none. [Check out `ngx-sin`](https://github.com/lazarljubenovic/ngx-sin) for some util directives regarding this.

#### Propagate errors

The `propagateErrors` is a boolean flag determining whether received error will be propagated, ie. if the observable you receive from `(ngxSubmit)` will throw with your server error. 

This is useful to override to `true` in cases where a single API endpoint has a bit different rules for error handling, so you can separately handle errors inside the `onSubmit` callback.

---

For more examples, check out the example demo app my cloning this repo and running `npm start`.

---

Special thanks to [**@ghetolay**](https://github.com/ghetolay) for helping me shape up the API!
