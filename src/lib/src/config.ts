import {InjectionToken} from '@angular/core';
import {CommonFormConfig} from './interfaces';

export const COMMON_FORM_CONFIG =
  new InjectionToken<Partial<CommonFormConfig>>('COMMON_FORM_CONFIG');

export const COMMON_FORM_FULL_CONFIG =
  new InjectionToken<CommonFormConfig>('COMMON_FORM_FULL_CONFIG')
