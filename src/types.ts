
export interface ProjectCardSettings {
    siteUrl: string;
    docListId: string;
    contractorListId: string;
    designerListId: string;
    contractContentTypeId: string;
    scanLib: string;
    BuildingsListId: string;
}

export interface SelectLookupValue {
    LookupId: number;
    LookupValue: string;
    externalID?: string;
    url?: string;
}

export class SPClientRequestError extends Error {
    private spError: SP.ClientRequestFailedEventArgs;
    private errorType: string;
    constructor(spError: SP.ClientRequestFailedEventArgs, message?: string | undefined) {
        super(message);
        this.spError = spError;
        this.errorType = spError.get_errorTypeName();
    }

    get errorTypeName(): string {
        return this.errorType;
    }

    get error() {
        return this.spError;
    }
}

// State
export interface StateObject {
    loading: boolean;
}

// export interface ProjectFormStateObject {
//     Title: string;
//     Path: string;
//     Designer: SelectLookupValue;
//     DesignerContracts: SelectLookupValue[];
//     Contractor: SelectLookupValue[];
//     Contracts: SelectLookupValue[];
//     TypeOfJobs: SelectLookupValue[];
// }

export interface SelectOptions {
    fieldName: string;
    options: SelectLookupValue[];
}

export enum FormMode {
    Unknown = -1,
    New,
    Edit,
    Display,
}

export interface ProjectFormStateObject {
    itemID: number;
    listId: string;
    fields: FormField[];
    mode: FormMode;
    settings: ProjectCardSettings | null;
}

export class FormField {
    private dname: string;
    private internalName: string;
    private ftype: string;

    get displayName() {
        return this.dname;
    }

    get name() {
        return this.internalName;
    }

    get type() {
        return this.ftype;
    }

    constructor(name: string, displayName: string, type: string) {
        this.dname = displayName;
        this.internalName = name;
        this.ftype = type;
    }
    public getValueAsString(): string {
        return '';
    }
}

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

export interface ProjectItem {
    ID: number;
    Title: string;
    CreatedDate: Date;
    BuildObject: SelectLookupValue;
    Designer: SelectLookupValue[];
}
