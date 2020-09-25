import { OnInit } from '@angular/core';
import { AbstractControl, ControlContainer } from '@angular/forms';
export declare class SinsDirective implements OnInit {
    private container;
    nameOrControl: string | AbstractControl;
    control: AbstractControl;
    constructor(container: ControlContainer);
    ngOnInit(): void;
}
