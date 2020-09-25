import {SinModuleConfig, WhenObject} from './interfaces'
import {ModuleWithProviders, NgModule} from '@angular/core'
import {CommonModule} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'
import {SinDirective} from './sin.directive'
import {SinsDirective} from './sins.directive'
import {FormWithSinsDirective} from './form-with-sins.directive'
import {SIN_CONFIG, SIN_FULL_CONFIG} from './config'

export function when ({dirty, touched}: Partial<WhenObject>): boolean {
  return dirty && touched
}

export const defaultConfig = {
  when,
}

export function factory (config?: Partial<SinModuleConfig>): SinModuleConfig {
  return Object.assign({}, defaultConfig, config || {})
}

export const DIRECTIVES = [
  SinDirective,
  SinsDirective,
  FormWithSinsDirective,
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class SinModule {
  public static forRoot (config?: Partial<SinModuleConfig>): ModuleWithProviders<SinModule> {
    return {
      ngModule: SinModule,
      providers: [
        {
          provide: SIN_CONFIG,
          useValue: config,
        },
        {
          provide: SIN_FULL_CONFIG,
          useFactory: factory,
          deps: [SIN_CONFIG],
        },
      ],
    }
  }
}
