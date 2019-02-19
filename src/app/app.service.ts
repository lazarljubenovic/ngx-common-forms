import {Injectable} from '@angular/core'
import * as rx from 'rxjs'
import * as rxop from 'rxjs/operators'

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
  username: string
  password: string
}

export interface Response {
  accessToken: string
}

export interface ApiServerError {
  errors: {
    field: string
    message: string
  }[]
}

@Injectable()
export class AppService {

  login ({username, password}: Credentials): rx.Observable<Response> {
    console.log(`Mocking an API request. Credentials: ${username}/${password}`)
    if (password == '123456') {
      return rx.of({accessToken: 'abcd1234'}).pipe(rxop.delay(1000))
    } else {
      return rx.NEVER.pipe(rxop.timeoutWith(1000, rx.throwError({
        status: 422,
        errors: [
          {
            field: 'password',
            message: 'Your password is not valid!',
          },
        ],
      })))
    }
  }

}
