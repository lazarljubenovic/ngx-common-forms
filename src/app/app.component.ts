import {Component} from '@angular/core'
import {FormBuilder, Validators} from '@angular/forms'
import {AppService, Credentials} from './app.service'
import * as rx from 'rxjs'

export interface FormValue {
  email: string
  password: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  })

  constructor (private fb: FormBuilder,
               public api: AppService) {
  }

  transform (formValue: FormValue): Credentials {
    return {
      username: formValue.email,
      password: formValue.password,
    }
  }

  onSubmit (response$: rx.Observable<Response>) {
    response$.subscribe(response => {
      alert(JSON.stringify(response, null, 2))
    })
  }

}
