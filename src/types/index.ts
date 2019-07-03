import { FormField } from './fields/FormField';
import { FormFieldText } from './fields/FormFieldText';
import { FormFieldLookup } from './fields/FormFieldLookup';
import { SPClientRequestError } from './SPClientRequestError';

export {
    FormFieldLookup,
    FormFieldText,
    FormField,
    SPClientRequestError,
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

export interface Project {
    id: number;
    title: string;
    buildObject?: SelectLookupValue;
    builder?: SelectLookupValue[];
    designer?: SelectLookupValue[];
    jobTypes?: SelectLookupValue[];
    contracts?: SelectLookupValue[];
    createdDate?: Date;
}

// State
export interface RootState {
    loading: boolean;
    setting?: ProjectMainSettings;
    cardSettings?: ProjectCardSettings;
    project?: Project;
}
