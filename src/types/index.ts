import { FormField } from './fields/FormField';
import { FormFieldText } from './fields/FormFieldText';
import { FormFieldLookup } from './fields/FormFieldLookup';
import { SPClientRequestError } from './SPClientRequestError';
import { FieldValidationResult } from './fields/FieldValidationResult';

export {
    FormFieldLookup,
    FormFieldText,
    FormField,
    SPClientRequestError,
    FieldValidationResult,
};

export enum FormMode {
    Unknown = -1,
    New,
    Edit,
    Display,
}

export interface ProjectMainSettings {
    siteUrl: string;
    listId: string;
    itemId: number;
    mode: FormMode;
}

export interface ProjectCardSettings {
    siteUrl: string;
    docListId: string;
    contractorListId: string;
    designerListId: string;
    contractContentTypeId: string;
    scanLib: string;
    buildingsListId: string;
}

export interface SelectLookupValue {
    LookupId: number;
    LookupValue: string;
    externalID?: string;
    url?: string;
}

// State
export interface RootState {
    loading: boolean;
    projectId: number;
    projectListId: string;
}

export interface SelectOptions {
    fieldName: string;
    options: SelectLookupValue[];
}

export interface ProjectItem {
    ID: number;
    Title: string;
    CreatedDate: Date;
    BuildObject: SelectLookupValue;
    Designer: SelectLookupValue[];
}
