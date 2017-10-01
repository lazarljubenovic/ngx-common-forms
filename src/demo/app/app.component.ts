import {Component} from '@angular/core'
import {FormBuilder, Validators} from '@angular/forms'
import {AppService, Credentials} from './app.service'
import {Observable} from 'rxjs/Observable'

export interface FormValue {
  email: string;
  password: string;
}

@Component({
  selector: 'demo-app',
  templateUrl: './app.component.html',
})
export class AppComponent {

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  })

  constructor(private fb: FormBuilder,
              public api: AppService) {
  }

  transform(formValue: FormValue): Credentials {
    return {
      username: formValue.email,
      password: formValue.password,
    }
  }

  onSubmit(response$: Observable<Response>) {
    response$.subscribe(response => {
      alert(JSON.stringify(response, null, 2))
    })
  }

}
