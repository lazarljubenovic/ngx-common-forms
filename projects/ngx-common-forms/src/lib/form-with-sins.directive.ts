import {AfterContentInit, ContentChildren, Directive, ElementRef, OnDestroy, Optional, QueryList, Renderer2, Self} from '@angular/core'
import {SinDirective} from './sin.directive'
import {AbstractControl, ControlContainer, FormControlName, FormGroup} from '@angular/forms'
import * as rx from 'rxjs'
import * as rxop from 'rxjs/operators'

export type Pair<T> = [T, T]

export function findAdded<T> ([olders, newers]: Pair<T[]>): T[] {
  return newers.filter(newer => olders.indexOf(newer) == -1)
}

export function findRemoved<T> ([olders, newers]: Pair<T[]>): T[] {
  return findAdded([newers, olders])
}

@Directive({selector: 'form'})
export class FormWithSinsDirective implements AfterContentInit, OnDestroy {

  @ContentChildren(SinDirective, {descendants: true})
  public sinDirectives: QueryList<SinDirective>

  @ContentChildren(FormControlName, {descendants: true})
  public formControlNames: QueryList<FormControlName>

  @ContentChildren(FormControlName, {descendants: true, read: ElementRef})
  public formControlElRefs: QueryList<ElementRef>

  private formControls: rx.Observable<{ name: FormControlName, elRef: ElementRef }>

  private destroy$ = new rx.Subject()

  private classNameForInvalidControl = 'ngx-sin-invalid'

  constructor (@Optional() @Self() private controlContainer: ControlContainer,
               private renderer: Renderer2,
               private elementRef: ElementRef) {
  }

  private markValidityFor (control: AbstractControl, addClass: boolean): void {
    const index = this.formControlNames.toArray()
      .findIndex(formControlName => {
        return control == formControlName.control
      })

    let elRef: ElementRef

    if (index == -1) {
      const formGroup = this.controlContainer.control as FormGroup
      if (formGroup == control) {
        elRef = this.elementRef
      } else {
        // Could not find the FormControl in the view, do nothing
        return
      }
    } else {
      elRef = this.formControlElRefs.toArray()[index]
    }

    if (addClass) {
      this.renderer.addClass(elRef.nativeElement, this.classNameForInvalidControl)
    } else {
      this.renderer.removeClass(elRef.nativeElement, this.classNameForInvalidControl)
    }
  }

  private markValidityForAll (controls: AbstractControl[], addClass: boolean): void {
    controls.forEach(control => this.markValidityFor(control, addClass))
  }

  private markAllAsValid () {
    this.formControlElRefs.forEach(elRef => {
      this.renderer.removeClass(elRef.nativeElement, this.classNameForInvalidControl)
    })
  }

  public ngAfterContentInit (): void {
    if (this.sinDirectives == null) {
      // This form does not have any sins
      return
    }

    this.formControls = rx.zip(
      this.formControlNames.changes.pipe(rxop.startWith(this.formControlNames)),
      this.formControlElRefs.changes.pipe(rxop.startWith(this.formControlElRefs)),
    ).pipe(
      rxop.map(([name, elRef]) => ({name, elRef})),
    )

    const visibleSins$: rx.Observable<AbstractControl[]> = this.sinDirectives.changes.pipe(
      rxop.startWith(this.sinDirectives),
      rxop.map((list: QueryList<SinDirective>) => list.toArray()),
      rxop.switchMap((sins: SinDirective[]) =>
        rx.combineLatest(sins.map(sin => sin.visible$))),
      rxop.map((controls: AbstractControl[]) => controls.filter(control => control != null)),
    )

    this.formControls.pipe(
      rxop.withLatestFrom(this.sinDirectives.changes.pipe(rxop.startWith(this.sinDirectives)), (fc, s) => s),
      rxop.map((list: QueryList<SinDirective>) => list.toArray().map(sin => sin.visible$.getValue())),
      rxop.map((controls: AbstractControl[]) => controls.filter(control => control != null)),
      rxop.withLatestFrom(visibleSins$, (_, sins) => sins),
    )
      .subscribe((controls: AbstractControl[]) => {
        // When form controls on the page change, we grab the last info about
        // visible sins and use that. We have to be destructive here
        this.markAllAsValid()
        this.markValidityForAll(controls, true)
      })

    visibleSins$.pipe(rxop.pairwise())
      .subscribe(([oldControls, newControls]: Pair<AbstractControl[]>) => {
        // We can calculate diff instead of removing and setting everything.
        const added = findAdded([oldControls, newControls])
        const removed = findRemoved([oldControls, newControls])
        this.markValidityForAll(added, true)
        this.markValidityForAll(removed, false)
      })
  }

  public ngOnDestroy () {
    this.destroy$.next()
  }

}
