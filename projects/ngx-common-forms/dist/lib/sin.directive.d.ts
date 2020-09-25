import { AbstractControl, ControlContainer } from '@angular/forms';
import { DoCheck, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { SinModuleConfig, WhenFunction } from './interfaces';
import * as rx from 'rxjs';
import { SinsDirective } from './sins.directive';
export interface SinNotification {
    type: 'add';
    control: AbstractControl;
    error: any;
}
export declare class SinDirective implements OnInit, DoCheck, SinModuleConfig {
    private templateRef;
    private viewContainerRef;
    private config;
    private sinsDirective;
    private controlContainer;
    visible$: rx.BehaviorSubject<AbstractControl>;
    private _control;
    private _controlWithErrors;
    error: string;
    set control(control: AbstractControl);
    get control(): AbstractControl;
    name: string;
    set controlWithErrors(control: AbstractControl);
    get controlWithErrors(): AbstractControl;
    when: WhenFunction;
    private embeddedViewRef;
    private initialized;
    constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef, config: SinModuleConfig, sinsDirective: SinsDirective, controlContainer: ControlContainer);
    ngOnInit(): void;
    ngDoCheck(): void;
    private initialize;
    private evaluate;
    private create;
    private destroy;
}
