import {Directive, HostBinding, Input} from '@angular/core';

@Directive({selector: '[formControlName]'})
export class FormControlNameDirective {
  @Input() @HostBinding('name') formControlName: string;
}
