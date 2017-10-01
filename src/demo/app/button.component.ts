import {Component, OnDestroy, Optional} from '@angular/core'
import {CommonFormDirective} from 'ngx-common-forms'
import {Subscription} from 'rxjs/Subscription'

/**
 * A button component which makes use of the Common Form directive to display a
 * loading indicator while request is being made.
 */

@Component({
  selector: 'button',
  template: `
    <span *ngIf="!isLoading"><ng-content></ng-content></span>
    <span *ngIf="isLoading">...</span>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 5rem;
    }
  `],
})
export class ButtonComponent implements OnDestroy {

  isLoading: boolean

  private subscription: Subscription

  // Use optional so your buttons can still work when not used with Common Forms.
  constructor(@Optional() commonForm: CommonFormDirective) {
    commonForm.isLoading$.subscribe(isLoading => this.isLoading = isLoading)
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
