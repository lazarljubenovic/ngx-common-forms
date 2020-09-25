import { SinModuleConfig, WhenObject } from './interfaces';
import { ModuleWithProviders } from '@angular/core';
import { SinDirective } from './sin.directive';
import { SinsDirective } from './sins.directive';
import { FormWithSinsDirective } from './form-with-sins.directive';
export declare function when({ dirty, touched }: Partial<WhenObject>): boolean;
export declare const defaultConfig: {
    when: typeof when;
};
export declare function factory(config?: Partial<SinModuleConfig>): SinModuleConfig;
export declare const DIRECTIVES: (typeof SinsDirective | typeof SinDirective | typeof FormWithSinsDirective)[];
export declare class SinModule {
    static forRoot(config?: Partial<SinModuleConfig>): ModuleWithProviders<SinModule>;
}
