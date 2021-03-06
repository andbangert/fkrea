
export const FieldNames = {
    FieldBuildObj: 'BuildObj',
    FieldTitle: 'Title',
    FieldBuildingAddress: 'BuildingAddress',
    FieldBuilder: 'Builder',
    FieldContractor: 'Contractor',
    FieldContracts: 'Contracts',
    FieldTypeOfJobs: 'TypeOfJobs',
    FieldDownloaded: 'Downloaded',

    FieldProject: 'Project',
    FieldScanLink: 'ScanLink',
    FieldScanFileSize: 'ScanFileSize',
    FieldScanModified: 'ScanModified',
    FieldJobType: 'JobType',
    FieldDocumentType: 'DocumentType',
    FieldRequired: 'Required',
    FieldDocForm: 'DocForm',
    FieldHasRemarks: 'HasRemarks',
    FieldRemarks: 'Remarks',
    FieldComment: 'Comment',
    FieldStorage: 'Storage',
    FieldReadyToArchive: 'ReadyToArchive',
    FieldArchived: 'Archived',
    FieldArchivedDate: 'ArchivedDate',
    FieldReadyToArchiveDate: 'ReadyToArchiveDate',
    FieldBarCode: 'BarCode',
    FieldDesigner: 'Designer',
    FieldObligatory: 'Obligatory',
    FieldGroupsOfJob: 'GroupsOfJob',
    FieldFileLeafRef: 'FileLeafRef',
    FieldFileDirRef: 'FileDirRef',
    FieldCreated: 'Created',
    FieldModified: 'Modified',
    FieldExecutiveDocsArchived: 'ExecutiveDocsArchived',
    FieldExecutiveDocsArchivedDate: 'ExecutiveDocsArchivedDate',
    FieldExecutiveDocsReadyToArchive: 'ExecutiveDocsReadyToArchive',
    FieldExecutiveDocsReadyToArchiveDate: 'ExecutiveDocsReadyToArchiveDate',
    FieldFileSize: 'File_x0020_Size',
    FieldSortOrder: 'SortOrder',
    FieldNumber: 'Number',
    FieldQueued: 'Queued',
    FieldHasError: 'HasError',

    TypeOfJobs: 'TypeOfJobs',
    BuildObj: 'BuildObj',
    Path: 'Path',
    FieldProjectCardID: 'ProjectCardID',
    FieldPartName: 'PartName',
    Comment: 'Comment',
    FieldBuildObjForFile: 'BuildObjForFile',
    Modified: 'Modified',
    FileSize: 'File_x0020_Size',
};

export namespace Fkrea {
    export namespace Fields {
        export const FieldTitle: string = 'Title';
        export const FieldStroiAddress: string = 'StroiAddress';
        export const FieldBuildObj: string = 'BuildObj';
        export const FieldDesigner: string = 'Designer';
        export const FieldProjDate: string = 'ProjDate';
        export const FieldRegion: string = 'Region';
        export const FieldRoomNum: string = 'RoomNum';
        export const FieldLockerNum: string = 'LockerNum';
        export const FieldRackNum: string = 'RackNum';
        export const FieldPath: string = 'Path';
        export const FieldTypeOfJobs: string = 'TypeOfJobs';
        export const FieldBuildingAddress: string = 'BuildingAddress';
        export const FieldContentTypeId: string = 'ContentTypeId';
        export const FieldBuilder: string = 'Builder';
        export const FieldExternalId: string = 'externalID';
        export const FieldUOPDID: string = 'UOPD_ID';
        export const FieldContractor: string = 'Contractor';
        export const FieldDesignerContracts: string = 'DesignerContracts';
        export const FieldContracts: string = 'Contracts';
        //
        export const FieldExtIdOCounterpartiesListProjSite: string = 'extrenalID'; // Wrong named
    }

    export const SPScripts = {
        Reputation: {
            Script: 'reputation.js',
            ReputationType: 'Microsoft.Office.Server.ReputationModel.Reputation',
            LayoutPath: '/_layouts/15/reputation.js',
        },
        SP: {
            Script: 'sp.js',
            ClientContextType: 'SP.ClientContext',
            UI: {
                Status: 'SP.UI.Status',
                Notify: 'SP.UI.Notify',
                Dialog: {
                    Script: 'sp.ui.dialog.js',
                    ModalDialog: 'SP.UI.ModalDialog',
                    ShowModalDialog: 'SP.UI.ModalDialog.showModalDialog',
                },
            },
        },
        DragDrop: {
            Script: 'dragdrop.js',
        },
        SP_UI_Dialog: {
            Script: 'sp.ui.dialog.js',
            ShowModalDialog: 'SP.UI.ModalDialog.showModalDialog',
        },
    };
}
