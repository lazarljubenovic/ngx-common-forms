import {Directive, Input, OnInit} from '@angular/core'
import {AbstractControl, ControlContainer} from '@angular/forms'

@Directive({
  selector: '[sins]',
})
export class SinsDirective implements OnInit {

  @Input('sins') public nameOrControl: string | AbstractControl

  public control: AbstractControl

  constructor (private container: ControlContainer) {
  }

  public ngOnInit (): void {
    this.control = typeof this.nameOrControl == 'string'
      ? this.container.control.get(this.nameOrControl)
      : this.nameOrControl
  }

}
