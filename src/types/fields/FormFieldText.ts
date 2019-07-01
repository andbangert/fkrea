import { FormField } from './FormField';

export class FormFieldText extends FormField {
    private val: string | undefined;
    get value() {
        return this.val;
    }
    set value(value) {
        this.val = value;
    }
    constructor(name: string, displayName: string, value?: string) {
        super(name, displayName, 'FieldText');
        this.val = value;
    }
    public getValueAsString(): string {
        return this.val + '';
    }
}
