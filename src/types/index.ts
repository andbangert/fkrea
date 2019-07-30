import { FormField } from './fields/FormField';
import { FormFieldText } from './fields/FormFieldText';
import { FormFieldLookup } from './fields/FormFieldLookup';
import { SPClientRequestError } from './SPClientRequestError';
import { StringifyOptions } from 'querystring';

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
    buildObject?: SelectLookupValue[];
    builder?: SelectLookupValue[];
    designer?: SelectLookupValue[];
    jobTypes?: SelectLookupValue[];
    contracts?: SelectLookupValue[];
    createdDate?: Date;
    executiveDocsArchived: boolean;
    executiveDocsArchivedDate?: Date | null,
    executiveDocsReadyToArchive: boolean,
    executiveDocsReadyToArchiveDate?: Date | null,
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
    executiveDocCardListId: string;
    executiveDocTypeListId: string;
}


// SETTINGS
export interface ItemSettings {
    itemId: number;
    listId: string;
    mode: FormMode;
}

// Archive site
export interface ArchiveSiteSettings {
    siteUrl: string;
    docListId: string;
    scanDocLibListId: string;
}

// ProjectSite
export interface ProjectSiteSettings {
    siteUrl: string;
    buildingsListId?: string;
    contractorsListId?: string;
    executiveDocLibListId?: string;
    executiveDocCardsListId?: string;
    executiveDocTypesListId?: string;
    projectListId?: string;
    typesOfJobsListId?: string;
}

export interface StorageAddressSettings {
    url: string,
    userId: string,
}

// State
export interface RootState {
    loading: boolean;
    storageSvcSettings?: StorageAddressSettings;
    projectSiteSettings?: ProjectSiteSettings;
    archiveSiteSettings?: ArchiveSiteSettings;
    projectItemSettings?: ItemSettings;
    project?: Project;
}

// State
export interface ExecutiveDocsState {
    siteUrl: string;
    docCardListId: string;
    documents: ExecutiveDocument[];
    // groupedDocs: IndexedExecDocs;
    // groupedDocTypes: IndexedExecDocsTypes;
    // docTypes: SelectLookupValue[];
}

export interface FieldValueCollection {
    [fieldName: string]: any;
}

export interface ExecutiveDocument {
    id: number;
    projectId?: number;
    barCode?: string | null;
    docTypeId?: number;
    docTypeName?: string;
    jobTypeId: number;
    hasRemarks: boolean;
    remarks?: string | null;
    comment?: string | null;
    title?: string;
    required: boolean;
    formType?: string | null;
    scanLink?: string | null;
    scanDate?: Date | null;
    scanSize?: number | null;
    changed: boolean;
}

export interface IndexedExecDocs {
    [index: number]: ExecutiveDocument[];
}
export interface IndexedExecDocsTypes {
    [jobTypeId: number]: SelectLookupValue[];
}

export interface FileData {
    url: string;
    name: string;
    size: number;
    created: Date;
    modified: Date;
}
