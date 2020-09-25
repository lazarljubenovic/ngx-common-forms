import { NgModule } from '@angular/core';
import * as rx from 'rxjs';
import { CommonModule } from '@angular/common';
import { COMMON_FORM_CONFIG, COMMON_FORM_FULL_CONFIG } from './config';
import { CommonFormDirective } from './common-form.directive';
import { DefaultCommonFormControlDirective, CommonFormControlDirective } from './common-form-control.directive';
/**
 * A function which takes the form value object and returns
 * a "transformed" version. By default, it's an identity.
 */
export function transform(formValue) {
    return formValue;
}
/**
 * Forms are usually submitted to the server, and there's a
 * loading spinner going on somewhere while waiting for the
 * response from the server to arrive. The response could
 * be a success, which is usually the simplest thing that
 * could happen in the app. However, in case of an error,
 * we need to show some validation messages in the fields
 * where the user needs to check his input. This is where
 * the problems begin, and this is what the library solves.
 * This function checks if the error returned from the
 * server is a validation error. I have a habit of marking
 * those with a status 422 (UNPROCESSABLE ENTITY), but in
 * case your code does something else, this is the
 * function you override in order to change how the lib
 * figures out that the response from the server contains
 * a validation error.
 */
export function isValidationError(response) {
    return response.status == 422;
}
/**
 * The error returned from the server doesn't have to
 * match the "flat server error" format which the library
 * expects. See docs for `FlatServerErrors` for more about
 * the format, and override this function to specify your
 * own transformation.
 */
export function transformError(serverError) {
    return serverError;
}
/**
 * This one might seem a bit weird, but there's actually a
 * default function which transforms the form value into an
 * observable that's responsible for sending the request.
 * The default value is a mocked observable which just emits
 * what's given to it, but this is almost always overridden
 * per form, by giving it a function which performs an HTTP
 * request, returning the observable.
 */
export function request(formValue) {
    return rx.of(formValue);
}
export function commonConfigFactory(partialCommonFormConfig) {
    return Object.assign({
        propagateErrors: false,
        transform,
        isValidationError,
        transformError,
        request,
    }, (partialCommonFormConfig || {}));
}
export const DIRECTIVES = [
    CommonFormDirective,
    CommonFormControlDirective,
    DefaultCommonFormControlDirective,
];
export class CommonFormsModule {
    static forRoot(config) {
        return {
            ngModule: CommonFormsModule,
            providers: [
                {
                    provide: COMMON_FORM_CONFIG,
                    useValue: config,
                },
                {
                    provide: COMMON_FORM_FULL_CONFIG,
                    useFactory: commonConfigFactory,
                    deps: [COMMON_FORM_CONFIG],
                },
            ],
        };
    }
}
CommonFormsModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                ],
                declarations: DIRECTIVES,
                exports: DIRECTIVES,
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLWZvcm1zLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbW9uLWZvcm1zLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXNCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQTtBQUUzRCxPQUFPLEtBQUssRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUMxQixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUE7QUFFNUMsT0FBTyxFQUFDLGtCQUFrQixFQUFFLHVCQUF1QixFQUFDLE1BQU0sVUFBVSxDQUFBO0FBQ3BFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFBO0FBQzNELE9BQU8sRUFBQyxpQ0FBaUMsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLGlDQUFpQyxDQUFBO0FBRTdHOzs7R0FHRztBQUNILE1BQU0sVUFBVSxTQUFTLENBQUUsU0FBYztJQUN2QyxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUUsUUFBMkI7SUFDNUQsT0FBTyxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQTtBQUMvQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBRSxXQUFnQjtJQUM5QyxPQUFPLFdBQVcsQ0FBQTtBQUNwQixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsT0FBTyxDQUFXLFNBQVk7SUFDNUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3pCLENBQUM7QUFFRCxNQUFNLFVBQVUsbUJBQW1CLENBQUUsdUJBQW1EO0lBQ3RGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNuQixlQUFlLEVBQUUsS0FBSztRQUN0QixTQUFTO1FBQ1QsaUJBQWlCO1FBQ2pCLGNBQWM7UUFDZCxPQUFPO0tBQ1IsRUFBRSxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDckMsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRztJQUN4QixtQkFBbUI7SUFDbkIsMEJBQTBCO0lBQzFCLGlDQUFpQztDQUNsQyxDQUFBO0FBU0QsTUFBTSxPQUFPLGlCQUFpQjtJQUNyQixNQUFNLENBQUMsT0FBTyxDQUFFLE1BQWtDO1FBQ3ZELE9BQU87WUFDTCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxPQUFPLEVBQUUsa0JBQWtCO29CQUMzQixRQUFRLEVBQUUsTUFBTTtpQkFDakI7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLHVCQUF1QjtvQkFDaEMsVUFBVSxFQUFFLG1CQUFtQjtvQkFDL0IsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUM7aUJBQzNCO2FBQ0Y7U0FDRixDQUFBO0lBQ0gsQ0FBQzs7O1lBdkJGLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWTtpQkFDYjtnQkFDRCxZQUFZLEVBQUUsVUFBVTtnQkFDeEIsT0FBTyxFQUFFLFVBQVU7YUFDcEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHtIdHRwRXJyb3JSZXNwb25zZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnXG5pbXBvcnQgKiBhcyByeCBmcm9tICdyeGpzJ1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbidcbmltcG9ydCB7Q29tbW9uRm9ybUNvbmZpZywgRmxhdFNlcnZlckVycm9yc30gZnJvbSAnLi9pbnRlcmZhY2VzJ1xuaW1wb3J0IHtDT01NT05fRk9STV9DT05GSUcsIENPTU1PTl9GT1JNX0ZVTExfQ09ORklHfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7Q29tbW9uRm9ybURpcmVjdGl2ZX0gZnJvbSAnLi9jb21tb24tZm9ybS5kaXJlY3RpdmUnXG5pbXBvcnQge0RlZmF1bHRDb21tb25Gb3JtQ29udHJvbERpcmVjdGl2ZSwgQ29tbW9uRm9ybUNvbnRyb2xEaXJlY3RpdmV9IGZyb20gJy4vY29tbW9uLWZvcm0tY29udHJvbC5kaXJlY3RpdmUnXG5cbi8qKlxuICogQSBmdW5jdGlvbiB3aGljaCB0YWtlcyB0aGUgZm9ybSB2YWx1ZSBvYmplY3QgYW5kIHJldHVybnNcbiAqIGEgXCJ0cmFuc2Zvcm1lZFwiIHZlcnNpb24uIEJ5IGRlZmF1bHQsIGl0J3MgYW4gaWRlbnRpdHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm0gKGZvcm1WYWx1ZTogYW55KTogYW55IHtcbiAgcmV0dXJuIGZvcm1WYWx1ZVxufVxuXG4vKipcbiAqIEZvcm1zIGFyZSB1c3VhbGx5IHN1Ym1pdHRlZCB0byB0aGUgc2VydmVyLCBhbmQgdGhlcmUncyBhXG4gKiBsb2FkaW5nIHNwaW5uZXIgZ29pbmcgb24gc29tZXdoZXJlIHdoaWxlIHdhaXRpbmcgZm9yIHRoZVxuICogcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyIHRvIGFycml2ZS4gVGhlIHJlc3BvbnNlIGNvdWxkXG4gKiBiZSBhIHN1Y2Nlc3MsIHdoaWNoIGlzIHVzdWFsbHkgdGhlIHNpbXBsZXN0IHRoaW5nIHRoYXRcbiAqIGNvdWxkIGhhcHBlbiBpbiB0aGUgYXBwLiBIb3dldmVyLCBpbiBjYXNlIG9mIGFuIGVycm9yLFxuICogd2UgbmVlZCB0byBzaG93IHNvbWUgdmFsaWRhdGlvbiBtZXNzYWdlcyBpbiB0aGUgZmllbGRzXG4gKiB3aGVyZSB0aGUgdXNlciBuZWVkcyB0byBjaGVjayBoaXMgaW5wdXQuIFRoaXMgaXMgd2hlcmVcbiAqIHRoZSBwcm9ibGVtcyBiZWdpbiwgYW5kIHRoaXMgaXMgd2hhdCB0aGUgbGlicmFyeSBzb2x2ZXMuXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiB0aGUgZXJyb3IgcmV0dXJuZWQgZnJvbSB0aGVcbiAqIHNlcnZlciBpcyBhIHZhbGlkYXRpb24gZXJyb3IuIEkgaGF2ZSBhIGhhYml0IG9mIG1hcmtpbmdcbiAqIHRob3NlIHdpdGggYSBzdGF0dXMgNDIyIChVTlBST0NFU1NBQkxFIEVOVElUWSksIGJ1dCBpblxuICogY2FzZSB5b3VyIGNvZGUgZG9lcyBzb21ldGhpbmcgZWxzZSwgdGhpcyBpcyB0aGVcbiAqIGZ1bmN0aW9uIHlvdSBvdmVycmlkZSBpbiBvcmRlciB0byBjaGFuZ2UgaG93IHRoZSBsaWJcbiAqIGZpZ3VyZXMgb3V0IHRoYXQgdGhlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciBjb250YWluc1xuICogYSB2YWxpZGF0aW9uIGVycm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZGF0aW9uRXJyb3IgKHJlc3BvbnNlOiBIdHRwRXJyb3JSZXNwb25zZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gcmVzcG9uc2Uuc3RhdHVzID09IDQyMlxufVxuXG4vKipcbiAqIFRoZSBlcnJvciByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgZG9lc24ndCBoYXZlIHRvXG4gKiBtYXRjaCB0aGUgXCJmbGF0IHNlcnZlciBlcnJvclwiIGZvcm1hdCB3aGljaCB0aGUgbGlicmFyeVxuICogZXhwZWN0cy4gU2VlIGRvY3MgZm9yIGBGbGF0U2VydmVyRXJyb3JzYCBmb3IgbW9yZSBhYm91dFxuICogdGhlIGZvcm1hdCwgYW5kIG92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gdG8gc3BlY2lmeSB5b3VyXG4gKiBvd24gdHJhbnNmb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1FcnJvciAoc2VydmVyRXJyb3I6IGFueSk6IEZsYXRTZXJ2ZXJFcnJvcnMge1xuICByZXR1cm4gc2VydmVyRXJyb3Jcbn1cblxuLyoqXG4gKiBUaGlzIG9uZSBtaWdodCBzZWVtIGEgYml0IHdlaXJkLCBidXQgdGhlcmUncyBhY3R1YWxseSBhXG4gKiBkZWZhdWx0IGZ1bmN0aW9uIHdoaWNoIHRyYW5zZm9ybXMgdGhlIGZvcm0gdmFsdWUgaW50byBhblxuICogb2JzZXJ2YWJsZSB0aGF0J3MgcmVzcG9uc2libGUgZm9yIHNlbmRpbmcgdGhlIHJlcXVlc3QuXG4gKiBUaGUgZGVmYXVsdCB2YWx1ZSBpcyBhIG1vY2tlZCBvYnNlcnZhYmxlIHdoaWNoIGp1c3QgZW1pdHNcbiAqIHdoYXQncyBnaXZlbiB0byBpdCwgYnV0IHRoaXMgaXMgYWxtb3N0IGFsd2F5cyBvdmVycmlkZGVuXG4gKiBwZXIgZm9ybSwgYnkgZ2l2aW5nIGl0IGEgZnVuY3Rpb24gd2hpY2ggcGVyZm9ybXMgYW4gSFRUUFxuICogcmVxdWVzdCwgcmV0dXJuaW5nIHRoZSBvYnNlcnZhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdDxUID0gYW55PiAoZm9ybVZhbHVlOiBUKTogcnguT2JzZXJ2YWJsZTxUPiB7XG4gIHJldHVybiByeC5vZihmb3JtVmFsdWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21tb25Db25maWdGYWN0b3J5IChwYXJ0aWFsQ29tbW9uRm9ybUNvbmZpZz86IFBhcnRpYWw8Q29tbW9uRm9ybUNvbmZpZz4pIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe1xuICAgIHByb3BhZ2F0ZUVycm9yczogZmFsc2UsXG4gICAgdHJhbnNmb3JtLFxuICAgIGlzVmFsaWRhdGlvbkVycm9yLFxuICAgIHRyYW5zZm9ybUVycm9yLFxuICAgIHJlcXVlc3QsXG4gIH0sIChwYXJ0aWFsQ29tbW9uRm9ybUNvbmZpZyB8fCB7fSkpXG59XG5cbmV4cG9ydCBjb25zdCBESVJFQ1RJVkVTID0gW1xuICBDb21tb25Gb3JtRGlyZWN0aXZlLFxuICBDb21tb25Gb3JtQ29udHJvbERpcmVjdGl2ZSxcbiAgRGVmYXVsdENvbW1vbkZvcm1Db250cm9sRGlyZWN0aXZlLFxuXVxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICBdLFxuICBkZWNsYXJhdGlvbnM6IERJUkVDVElWRVMsXG4gIGV4cG9ydHM6IERJUkVDVElWRVMsXG59KVxuZXhwb3J0IGNsYXNzIENvbW1vbkZvcm1zTW9kdWxlIHtcbiAgcHVibGljIHN0YXRpYyBmb3JSb290IChjb25maWc/OiBQYXJ0aWFsPENvbW1vbkZvcm1Db25maWc+KTogTW9kdWxlV2l0aFByb3ZpZGVyczxDb21tb25Gb3Jtc01vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQ29tbW9uRm9ybXNNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IENPTU1PTl9GT1JNX0NPTkZJRyxcbiAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogQ09NTU9OX0ZPUk1fRlVMTF9DT05GSUcsXG4gICAgICAgICAgdXNlRmFjdG9yeTogY29tbW9uQ29uZmlnRmFjdG9yeSxcbiAgICAgICAgICBkZXBzOiBbQ09NTU9OX0ZPUk1fQ09ORklHXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfVxuICB9XG59XG4iXX0=