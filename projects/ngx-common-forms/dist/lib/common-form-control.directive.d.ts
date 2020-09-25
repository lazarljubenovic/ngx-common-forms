import { ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CommonFormControl } from './interfaces';
import { NgControl } from '@angular/forms';
export declare function providerFactory(klass: any): {
    provide: import("@angular/core").InjectionToken<any>;
    useExisting: import("@angular/core").Type<any>;
};
export declare class DefaultCommonFormControlDirective implements CommonFormControl {
    private renderer;
    private elRef;
    private _name;
    set name(name: string);
    constructor(renderer: Renderer2, elRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>);
    setName(name: string): void;
    getName(): string;
    focus(): void;
}
export declare class CommonFormControlDirective implements OnInit {
    ngControl: NgControl;
    commonFormControl: CommonFormControl;
    constructor(ngControl: NgControl, commonFormControl: CommonFormControl);
    ngOnInit(): void;
}
