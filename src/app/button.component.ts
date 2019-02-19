import {Component, OnDestroy, Optional} from '@angular/core'
import {CommonFormDirective} from 'ngx-common-forms'
import * as rx from 'rxjs'

/**
 * A button component which makes use of the Common Form directive to display a
 * loading indicator while request is being made.
 *
 * Basically, your custom button listens to the isLoading$ observable exposed
 * from a Common Form (which you can easily inject), and changes its appearance.
 *
 * You don't have to worry about disabling it, although it would be good user
 * experience to make it obvious that the button doesn't do anything when
 * clicked while the form is loading. However, even if you don't handle this,
 * the library itself will disallow any attempt re-submit while a submission
 * is still in place.
 *
 * Below is a simple example that swaps button contents for "..." during the
 * submission, but you can enhance this with a spinner and an animated swap.
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

  private subscription: rx.Subscription

  // Use optional so your buttons can still work when not used with Common Forms.
  constructor (@Optional() commonForm: CommonFormDirective) {
    commonForm.isLoading$.subscribe(isLoading => this.isLoading = isLoading)
  }

  ngOnDestroy () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
