import {BrowserModule} from '@angular/platform-browser'
import {NgModule} from '@angular/core'

import {AppComponent} from './app.component'
import {ReactiveFormsModule} from '@angular/forms'
import {CommonFormsModule, FlatServerErrors, SinModule} from 'ngx-common-forms'
import {ApiServerError, AppService} from './app.service'
import {ButtonComponent} from './button.component'


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CommonFormsModule.forRoot({
      transformError: (apiServerError: ApiServerError): FlatServerErrors => {
        return apiServerError.errors
          .reduce((acc, curr) => ({...acc, [curr.field]: `Server error: ${curr.message}`}), {})
      },
    }),
    SinModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    ButtonComponent,
  ],
  bootstrap: [AppComponent],
  providers: [AppService],
})
export class AppModule {
}
