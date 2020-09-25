import { Directive, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
export class SinsDirective {
    constructor(container) {
        this.container = container;
    }
    ngOnInit() {
        this.control = typeof this.nameOrControl == 'string'
            ? this.container.control.get(this.nameOrControl)
            : this.nameOrControl;
    }
}
SinsDirective.decorators = [
    { type: Directive, args: [{
                selector: '[sins]',
            },] }
];
SinsDirective.ctorParameters = () => [
    { type: ControlContainer }
];
SinsDirective.propDecorators = {
    nameOrControl: [{ type: Input, args: ['sins',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lucy5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3NpbnMuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFTLE1BQU0sZUFBZSxDQUFBO0FBQ3RELE9BQU8sRUFBa0IsZ0JBQWdCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQTtBQUtoRSxNQUFNLE9BQU8sYUFBYTtJQU14QixZQUFxQixTQUEyQjtRQUEzQixjQUFTLEdBQVQsU0FBUyxDQUFrQjtJQUNoRCxDQUFDO0lBRU0sUUFBUTtRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLENBQUMsYUFBYSxJQUFJLFFBQVE7WUFDbEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2hELENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQ3hCLENBQUM7OztZQWhCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLFFBQVE7YUFDbkI7OztZQUp3QixnQkFBZ0I7Ozs0QkFPdEMsS0FBSyxTQUFDLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXQsIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcbmltcG9ydCB7QWJzdHJhY3RDb250cm9sLCBDb250cm9sQ29udGFpbmVyfSBmcm9tICdAYW5ndWxhci9mb3JtcydcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3NpbnNdJyxcbn0pXG5leHBvcnQgY2xhc3MgU2luc0RpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgQElucHV0KCdzaW5zJykgcHVibGljIG5hbWVPckNvbnRyb2w6IHN0cmluZyB8IEFic3RyYWN0Q29udHJvbFxuXG4gIHB1YmxpYyBjb250cm9sOiBBYnN0cmFjdENvbnRyb2xcblxuICBjb25zdHJ1Y3RvciAocHJpdmF0ZSBjb250YWluZXI6IENvbnRyb2xDb250YWluZXIpIHtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uSW5pdCAoKTogdm9pZCB7XG4gICAgdGhpcy5jb250cm9sID0gdHlwZW9mIHRoaXMubmFtZU9yQ29udHJvbCA9PSAnc3RyaW5nJ1xuICAgICAgPyB0aGlzLmNvbnRhaW5lci5jb250cm9sLmdldCh0aGlzLm5hbWVPckNvbnRyb2wpXG4gICAgICA6IHRoaXMubmFtZU9yQ29udHJvbFxuICB9XG5cbn1cbiJdfQ==