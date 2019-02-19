import {Directive, Input, OnInit} from '@angular/core'
import {AbstractControl, ControlContainer} from '@angular/forms'

@Directive({
  selector: '[sins]',
})
export class SinsDirective implements OnInit {

  @Input('sins') public name: string

  public control: AbstractControl

  constructor (private container: ControlContainer) {
  }

  public ngOnInit (): void {
    this.control = this.container.control.get(this.name)
  }

}
