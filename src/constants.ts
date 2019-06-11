// export namespace Fkrea.Project {
//     //export namespace Project {
//     export const FieldTitle: string = 'Title';
//     export const FieldStroiAddress: string = 'StroiAddress';
//     export const FieldBuildObj: string = 'BuildObj';
//     export const FieldDesigner: string = 'Designer';
//     export const FieldProjDate: string = 'ProjDate';
//     export const FieldRegion: string = 'Region';
//     export const FieldRoomNum: string = 'RoomNum';
//     export const FieldLockerNum: string = 'LockerNum';
//     export const FieldRackNum: string = 'RackNum';
//     export const FieldPath: string = 'Path';
//     export const FieldTypeOfJobs: string = 'TypeOfJobs';
//     export const SelectProp_ItemID = 'ItemID';
//     //}
// }

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
        export const FieldUOPD_ID: string = 'UOPD_ID';
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