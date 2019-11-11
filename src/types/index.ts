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
    required?: boolean;
    sortOrder?: number;
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
    Builder: SelectLookupValue[];
    Contracts: SelectLookupValue[];
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
    executiveDocsArchivedDate?: Date | null;
    executiveDocsReadyToArchive: boolean;
    executiveDocsReadyToArchiveDate?: Date | null;
    projectPathFolder?: string;
    designerContracts?: SelectLookupValue[];
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
    serverUrl?: string;
    serverRelativeUrl?: string;
    siteUrl: string;
    buildingsListId?: string;
    contractorsListId?: string;
    executiveDocLibListId?: string;
    executiveDocCardsListId?: string;
    executiveDocTypesListId?: string;
    projectListId?: string;
    typesOfJobsListId?: string;
    projectDocsfolderUrl?: string;
    projectDocsDocPartNameListId?: string;
    projectDocLibListId: string;
    projectExpertCardsListId: string;
}

export interface StorageAddressSettings {
    url: string;
    userId: string;
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

export interface ExpertDocsQueue {
    queued: boolean;
    downloaded: boolean;
    number: string;
    hasError: boolean;
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
    docTypeSortNum?: number;
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

export interface DocReport {
    id: number;
    num?: string | number;
    title?: string;
    system?: string;
    builder?: string;
    date?: string;
    form?: string | null;
    comment?: string | null;
    header: boolean;
}

// Project document types
export interface AppOptions {
    serverUrl: string;
    siteUrl: string;
    listId: string;
    projectListId: string;
    folderUrl: string;
    docPartNameListId: string;
    projectId: number;
    returnUrl?: string;
}

export interface RootState {
    version?: string;
}

export interface DocTypeSearchPattern {
    pattern: string;
    itemId: number;
}

export interface DocType {
    id: number;
    title: string;
    partNum?: string;
    sortNum?: number;
}

export interface FetchedFileData {
    file: SP.File;
    listItem: SP.ListItem;
    iconUrl: string;
}

export interface ItemData {
    id: number;
    [field: string]: any;
}

export interface StateFile {
    id: number;
    fileName: string;
    docType: DocType;
    changedDocType: DocType;
    info?: string;
    changedInfo?: string;
    saved: boolean;
    changed: boolean;
    majorVersion: number;
    minorVersion: number;
    checkinComment?: string;
    changedCheckinComment?: string;
    serverRelativeUrl: string;
    overwriteVersion: boolean;
    item: ItemData;
    iconUrl: string;
    overwrite: boolean;
    lastModified: Date;
    fileSize: number;
}

export type StateFileType = StateFile;

export interface ProjectDocsState {
    mode: UploadMode;
    loading?: boolean;
    files: StateFile[];
    counter: number;
    docTypes: DocType[];
    docTypeSearchPatterns: DocTypeSearchPattern[];
    expertDocsQueue?: ExpertDocsQueue;
}

export interface DialogText {
    instructions: string;
    buttonOk: string;
    subject: string;
}

export enum SaveEditButtonKey {
    Unknown = 0,
    Save = 1,
    Edit = 2,
    Remove = 3,
    Cancel = 4,
}

export enum UploadMode {
    Unknown = 0,
    New = 1,
    Edit = 2,
}
