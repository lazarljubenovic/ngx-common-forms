import {Injectable} from '@angular/core'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/never'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/timeoutWith'

/**
 * This is a fake service which mimics the same kind of API you'd
 * get from a service which communicates with a backend.
 *
 * Note how the service accepts username and password, but the form
 * has a value of type {email: string, password: string}.
 *
 * Also notice that the error is not returned in the format which
 * Common Forms expect.
 */

export interface Credentials {
  username: string;
  password: string;
}

export interface Response {
  accessToken: string;
}

export type ApiServerError = {
  errors: {
    field: string,
    message: string,
  }[],
}

@Injectable()
export class AppService {

  login({username, password}: Credentials): Observable<Response> {
    console.log(`Mocking an API request. Credentials: ${username}/${password}`)
    if (password == '123456') {
      return Observable.of({accessToken: 'abcd1234'}).delay(1000)
    } else {
      return Observable.never().timeoutWith(1000, Observable.throw({
        status: 422,
        errors: [
          {
            field: 'password',
            message: 'Your password is not valid!',
          },
        ],
      }))
    }
  }

}
