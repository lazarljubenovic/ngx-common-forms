import { AfterContentInit, ElementRef, OnDestroy, QueryList, Renderer2 } from '@angular/core';
import { SinDirective } from './sin.directive';
import { ControlContainer, FormControlName } from '@angular/forms';
export declare type Pair<T> = [T, T];
export declare function findAdded<T>([olders, newers]: Pair<T[]>): T[];
export declare function findRemoved<T>([olders, newers]: Pair<T[]>): T[];
export declare class FormWithSinsDirective implements AfterContentInit, OnDestroy {
    private controlContainer;
    private renderer;
    private elementRef;
    sinDirectives: QueryList<SinDirective>;
    formControlNames: QueryList<FormControlName>;
    formControlElRefs: QueryList<ElementRef>;
    private formControls;
    private destroy$;
    private classNameForInvalidControl;
    constructor(controlContainer: ControlContainer, renderer: Renderer2, elementRef: ElementRef);
    private markValidityFor;
    private markValidityForAll;
    private markAllAsValid;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}
