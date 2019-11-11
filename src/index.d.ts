/* Namespaces for using in item field script */
declare namespace fkrea {
    function ConfigureProjectCard(settings: ProjectCardSettings): void;
    function InitProjectNewForm(ctx: SPClientTemplates.RenderContext_Form, settings: ProjectCardSettings): void;
    function InitProjectViewForm(projSiteSettings?: any, archSiteSettings?:any, storageSettings?: any): void;
    interface ProjectCardSettings {
        siteUrl: string;
        docListId: string;
        contractorListId: string;
        designerListId: string;
        contractContentTypeId: string;
        scanLib: string;
        BuildingsListId: string;
    }
    let projectCardSettings: ProjectCardSettings;
}
/**********************************************/

// Save Button click validation
declare function PreSaveItem(): boolean;
declare function STSNavigate(url: string): void;
declare function NotifyScriptLoadedAndExecuteWaitingJobs(scriptFileName: string): any;

declare interface ResultTableCollection {
    ElapsedTime: number;
    Properties: ResultTableCollectionProperties;
    QueryErrors: [] | null;
    QueryId: string;
    ResultTables: Array<ResultTable>;
    SpellingSuggestion: string
    TriggeredRules: [];
}

declare interface ResultTableCollectionProperties {
    RowLimit: number;
    SourceId: SP.Guid;
    WasGroupRestricted: boolean;
    IsPartial: boolean;
    EnableInterleaving: boolean;
    piPageImpression: string;
}

declare function GipSplit(val: string): string[];

declare interface ResultTable {
    GroupTemplateId: string | null;
    ItemTemplateId: string | null;
    Properties: ResultTableProperties;
    QueryId: string;
    QueryRuleId: string;
    ResultRows: Array<SearchResult>;
    ResultTitle: string | null;
    ResultTitleUrl: string | null;
    RowCount: number;
    TableType: string;
    TotalRows: number;
    TotalRowsIncludingDuplicates: number;
}

declare interface ResultTableProperties {
    GenerationId: number;
    ExecutionTimeMs: number;
    QueryModification: string | null;
    RenderTemplateId: string;
    piPageImpressionBlockType: number;
}

declare interface SearchResult {
    Rank: number;
    RenderTemplateId: string;
    ResultTypeId: number;
    ResultTypeIdList: string;
    CollapsingStatus: 1;
    DocId: number;
    IsContainer: boolean;
    IsDocument: boolean;
    OriginalPath: string;
    ParentLink: string;
    PartitionId: SP.Guid;
    Path: string;
    SectionIndexes: string;
    SectionNames: string;
    ServerRedirectedEmbedURL: string | null;
    ServerRedirectedPreviewURL: string | null;
    ServerRedirectedURL: string | null;
    SiteName: string;
    UrlZone: number;
    contentclass: string;//"STS_ListItem_GenericList"
    importance: number;
    piSearchResultId: string;
    [name: string]: any;
}

interface Window {
    [key: string]: any; // Add index signature
}

declare interface SPGlobalFormContext {
    CSRCustomLayout: boolean;
    FieldControlModes: Object;
    FormControlMode: number;
    InitialFocus: string;
    ItemAttributes: Object;
    ItemContentTypeId: string;
    ItemContentTypeName: string;
    ListAttributes: Object;
    ListData: Object;
    ListSchema: Object;
    NewItemRootFolder: string;
    PostBackRequired: boolean;
    PreviousPostBackHandled: boolean;
    RedirectInfo: {
        popUI: boolean;
        redirectUrl: string;
        listRootFolderUrl: string;
    };
    SubmitButtonID: string | null;
    UploadMode: boolean;
    WebAttributes:
    {
        WebUrl: string; EffectivePresenceEnabled: boolean;
        AllowScriptableWebParts: boolean;
        PermissionCustomizePages: boolean; LCID: string; CurrentUserId: number;
    },
}
