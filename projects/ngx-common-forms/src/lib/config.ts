import {InjectionToken} from '@angular/core'
import {CommonFormConfig, SinModuleConfig} from './interfaces'

export const COMMON_FORM_CONFIG =
  new InjectionToken<Partial<CommonFormConfig>>('COMMON_FORM_CONFIG')

export const COMMON_FORM_FULL_CONFIG =
  new InjectionToken<CommonFormConfig>('COMMON_FORM_FULL_CONFIG')

export const COMMON_FORM_CONTROL =
  new InjectionToken<any>('COMMON_FORM_CONTROL')

export const SIN_CONFIG =
  new InjectionToken<Partial<SinModuleConfig>>('SIN_CONFIG')

export const SIN_FULL_CONFIG
  = new InjectionToken<SinModuleConfig>('SIN_FULL_CONFIG')
