import {NgModule} from '@angular/core'
import {ReactiveFormsModule} from '@angular/forms'
import {BrowserModule} from '@angular/platform-browser'
import {AppComponent} from './app.component'
import {CommonFormsModule, FlatServerErrors} from 'ngx-common-forms'
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
  ],
  declarations: [
    AppComponent,
    ButtonComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {
}
