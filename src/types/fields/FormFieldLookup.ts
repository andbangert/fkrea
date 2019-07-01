import { FormField } from './FormField';
import { SelectLookupValue } from '../';

export class FormFieldLookup extends FormField {
    private lpListId: string;
    private val: SelectLookupValue[] | SelectLookupValue | undefined;
    private multi: boolean = false;

    get lookupListId() {
        return this.lpListId;
    }
    get allowMulti() {
        return this.multi;
    }
    get value() {
        return this.val;
    }
    set value(value) {
        this.val = value;
    }
    constructor(
        name: string,
        displayName: string,
        listId: string,
        value?: SelectLookupValue[] | SelectLookupValue,
        mult?: boolean) {
        super(name, displayName, mult ? 'LookupMulti' : 'Lookup');
        if (value) {
            this.val = value;
        }
        this.lpListId = listId;
        if (mult) {
            this.multi = mult;
        }
    }

    public getValueAsString(): string {
        if (this.val) {
            return this.multi
                ? this.getMultiLookupValueAsString((this.val as SelectLookupValue[]))
                : this.getLookupValueAsString((this.val as SelectLookupValue));
        }
        return '';
    }

    private getMultiLookupValueAsString(values: SelectLookupValue[]): string {
        let value = '';
        values.forEach((val) => {
            value += `${val.LookupId};#${val.LookupValue.replace(/;/g, ';;')};#`;
        });
        return value;
    }

    private getLookupValueAsString(val: SelectLookupValue) {
        return `${val.LookupId};#${val.LookupValue}`;
    }
}
