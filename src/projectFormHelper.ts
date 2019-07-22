import '@/scss/v-select.css';
import '@/scss/form.css';

import CamlBuilder from 'camljs';
import * as utils from '@/utilities';
import * as constants from '@/constants';

import proj = constants.Fkrea.Fields;

import {
    SelectLookupValue,
    FormField,
    FormFieldLookup,
    FormFieldText,
    ProjectCardSettings,
    FormMode,
    SPClientRequestError,
    ProjectItem,
} from '@/types';

export interface ProjectResult {
    builders: SelectLookupValue[];
    contracts: SelectLookupValue[];
    typesOfJobs?: SelectLookupValue[];
}

export class ProjectFormHelper {
    public fields: FormField[];
    public settings: ProjectCardSettings;

    public static async getProjectsByBuildObject(siteUrl: string, projectListId: string, buildObjectId: number) {
        const query = new CamlBuilder().View().RowLimit(100).Query()
            .Where().LookupField(proj.FieldBuildObj).Id()
            .EqualTo(buildObjectId).Or()
            // ID expr Should be deleted on prod.
            .NumberField('ID')
            .EqualTo(Number(buildObjectId))
            .ToString();

        console.log('utils.getItemsByQuery');
        console.log(query);

        const projectsResult = await utils.getItemsByQuery(siteUrl, projectListId, query);
        const items: ProjectItem[] = new Array<ProjectItem>();

        projectsResult.data.forEach((item) => {
            const itemVals = item.get_fieldValues();
            const boval: SP.FieldLookupValue[] = itemVals[proj.FieldBuildObj] as SP.FieldLookupValue[];
            if (boval && boval.length > 0) {
                const buildObject: SelectLookupValue = {
                    LookupId: Number(boval[0].get_lookupId()),
                    LookupValue: boval[0].get_lookupValue(),
                };
                const designerVals: SP.FieldLookupValue[] = itemVals[proj.FieldDesigner] as SP.FieldLookupValue[];
                let designers: SelectLookupValue[] = new Array<SelectLookupValue>();
                if (designerVals && designerVals.length > 0) {
                    designers = designerVals.map((dv) => {
                        const value: SelectLookupValue = {
                            LookupId: Number(dv.get_lookupId()),
                            LookupValue: dv.get_lookupValue(),
                        };
                        return value;
                    });
                }
                items.push({
                    ID: Number(item.get_item('ID')),
                    Title: item.get_item(proj.FieldTitle) as string,
                    CreatedDate: itemVals['Created'] as Date,
                    BuildObject: buildObject,
                    Designer: designers,
                });
            }
        });
        return items;
    }

    constructor(fields: FormField[], projectCardSettings: ProjectCardSettings) {
        this.fields = fields;
        this.settings = projectCardSettings;
    }

    public getTrimmedText(value: string) {
        if (!value || value === '') {
            return '';
        }
        const val = value.substring(value.lastIndexOf(',') + 1);
        return 'Комплект документов по адресу ' + val.replace(/,|;|\\|\/|\||\.|'/g, '');
    }

    public getMultiLookupValueAsString(values: SelectLookupValue[]): string {
        let value = '';
        values.forEach((val) => {
            value += `${val.LookupId};#${val.LookupValue.replace(/;/g, ';;')};#`;
        });
        return value;
    }

    public getLookupValueAsString(val: SelectLookupValue) {
        return `${val.LookupId};#${val.LookupValue}`;
    }

    public notifyOnError(errorTitle: string, error: string) {
        SP.SOD.executeFunc(
            constants.Fkrea.SPScripts.SP.Script,
            constants.Fkrea.SPScripts.SP.UI.Status,
            () => {
                SP.UI.Notify.removeNotification(self.notify);
                SP.UI.Status.removeAllStatus(false);
                const status = SP.UI.Status.addStatus(errorTitle, error);
                SP.UI.Status.setStatusPriColor(status, 'red');
            });
    }

    public async createFolder(
        siteUrl: string,
        scanLibId: string,
        path: string,
        fn: (folder: SP.Folder | null, exists: boolean, errorMsg?: string)
            => void) {

        try {
            if (path) {
                const folder =
                    await utils.
                        checkIfFolderExists(
                            siteUrl,
                            scanLibId,
                            path);
                // Folder Already Exists
                fn(folder, true);
            } else {
                fn(null, false, 'Path can not be empty');
            }
        } catch (e) {
            const sperr = e as SPClientRequestError;
            if (sperr) {
                if (sperr.errorTypeName ===
                    'System.IO.DirectoryNotFoundException') {
                    if (path) {
                        try {
                            // create on not exists
                            const folder = await utils.
                                createFolderRecursively(
                                    siteUrl,
                                    scanLibId,
                                    path);

                            fn(folder, false);
                        } catch (ex) {
                            fn(null, false, (ex as Error).message);
                        }
                    } else {
                        fn(null, false, 'Path can not be empty');
                    }
                }
            } else {
                fn(null, false, (e as Error).message);
            }
        }
    }


    public async customSave(
        siteUrl: string,
        listId: string,
        itemId: number,
        mode: FormMode,
    ): Promise<SP.ListItem> {
        return new Promise<SP.ListItem>((resolve, reject) => {
            let item: SP.ListItem;
            const initContext = new SP.ClientContext(siteUrl);
            // console.log(siteUrl);
            const params = new SP.ListItemCreationInformation();
            let allFormValues = new Array<SP.ListItemFormUpdateValue>();

            initContext.add_requestSucceeded((source, eventArgs) => {
                // console.log(item);
                resolve(item);
            });
            initContext.add_requestFailed((source, eventArgs) => {
                reject(new SPClientRequestError(eventArgs));
            });
            const formList = ((initContext.get_web()).get_lists()).getById(listId);
            const isNew = mode === FormMode.New;
            params.set_underlyingObjectType(0);
            if (isNew) {
                item = formList.addItem(params);
            } else {
                item = formList.getItemById(itemId);
            }
            this.fields.forEach((fld) => {
                // if (fld.name !== proj.FieldTitle) {
                //     return;
                // }
                const value = fld.name === proj.FieldBuildObj ?
                    // Shoul be remaked
                    this.getMultiLookupValueAsString([((fld as FormFieldLookup).value as SelectLookupValue)]) :
                    fld.getValueAsString(); // this.getFieldValueAsString(fld);
                if (value !== null) {
                    const formUpdateValue = new SP.ListItemFormUpdateValue();
                    formUpdateValue.set_fieldName(fld.name);
                    formUpdateValue.set_fieldValue(value);
                    allFormValues.push(formUpdateValue);
                }
            });
            const updateScope = new SP.ExceptionHandlingScope(initContext);
            const updateScopeDispose = updateScope.startScope();
            if (item) {
                allFormValues = item.validateUpdateListItem(allFormValues, isNew);
                updateScopeDispose.dispose();
            }
            initContext.load(item);
            initContext.executeQueryAsync();
        });
    }

    // private getFieldValueAsString(field: FormField) : string {
    //     if (field.type === 'Lookup') {
    //         const lf = field as FormFieldLookup;
    //         if (lf && lf.value) {
    //             if (lf.allowMulti) {
    //                 return this.getMultiLookupValueAsString(<SelectLookupValue[]>lf.value);
    //             }
    //             else {
    //                 if (lf.value) {
    //                     return this.getLookupValueAsString(<SelectLookupValue>lf.value);
    //                 }
    //                 else {
    //                     return '';
    //                 }
    //             }
    //         }
    //     }
    //     else {
    //         const tf = <FormFieldText>field;
    //         return tf && tf.value ? tf.value : '';
    //     }
    //     return '';
    // }

    public async SearchBuildObject(
        queryText: string,
        listId: string,
        loading: (val: boolean) => void,
    ) {
        let values: SelectLookupValue[] = new Array<SelectLookupValue>();
        try {
            const objr = await utils.SearchListObject(
                queryText,
                listId,
                100,
                ['ListItemID', 'Title', 'externalIDOWSTEXT']);
            const results = objr as SP.JsonObjectResult;
            if (results) {
                const result = results.get_value() as ResultTableCollection;
                if (!result || !result.ResultTables || result.ResultTables.length === 0) {
                    loading(false);
                    return values;
                }
                values = result.ResultTables[0].ResultRows.map((r) => {
                    return {
                        LookupId: r.ListItemID,
                        LookupValue: r.Title,
                        externalID: r.externalIDOWSTEXT,
                    };
                });
            }
        } catch (e) {
            loading(false);
        }
        return values;
    }

    public async changeBuildObject(val: SelectLookupValue) {
        if (!val.externalID) {
            // console.log('UOPD_ID is null or empty');
            // console.log(val);
            return;
        }

        // const result: ProjectResult = {
        //     builders: new Array<SelectLookupValue>();
        // };
        let boId = -1; // UOPD_ID
        try {
            // Get build object from main site by UOPD_ID
            const resultBo = await utils.getItemsByQuery(
                this.settings.siteUrl,
                this.settings.buildingsListId,
                this.getBoByUOPDQuery(val.externalID));
            if (resultBo.data && resultBo.data.length !== 0) {
                boId = resultBo.data[0].get_item('UNOM');
            } else {
                throw new Error('externalID of "build object" can not be null or empty.');
            }

            // Get Documents from main site which field "BuildingAddress" contains bo id...
            const resultDocs = await utils.getItemsByQuery(
                this.settings.siteUrl,
                this.settings.docListId,
                this.docsByBoIDQuery(boId));
            if (!resultDocs || !(resultDocs.data && resultDocs.data.length > 0)) {
                // console.log('Building address could not be found on main site.');
                return;
            }

            // Fetch all builder's id and contracts
            const builderIds = new Array<number>();
            const contracts = new Array<SelectLookupValue>();
            resultDocs.data.forEach((doc) => {
                const builderLV = doc.get_item(proj.FieldBuilder) as SP.FieldLookupValue;
                if (builderLV) {
                    builderIds.push(builderLV.get_lookupId());
                }

                // const dirRef = doc.get_item('FileDirRef');
                // const leafRef = doc.get_item('FileLeafRef');
                // const ub = new SP.Utilities.UrlBuilder(dirRef);
                // ub.combinePath(leafRef);

                contracts.push({
                    LookupId: doc.get_id(),
                    LookupValue: doc.get_item(proj.FieldTitle),
                    // url: ub.get_url(),
                });
            });

            // Get All Builders from main site...
            const buildUnoIds = new Array<string>();
            const buildersResult = await utils.getItemsByQuery(this.settings.siteUrl,
                this.settings.contractorListId, this.getAllContractorFromMainSiteQuery(builderIds));
            if (buildersResult.data && buildersResult.data.length > 0) {
                // Fetch all DUOPD_ID to get local designers and contractors
                buildersResult.data.forEach((bld) => {
                    buildUnoIds.push(bld.get_item(proj.FieldUOPDID) as string);
                });
            }

            const fldDesigner = this.fields.find((f) =>
                f.name === proj.FieldDesigner) as FormFieldLookup;
            let contractors = new Array<SelectLookupValue>();
            if (fldDesigner) {
                const ctrResult = await this.getContractors(fldDesigner.lookupListId, buildUnoIds);
                if (ctrResult) {
                    contractors = ctrResult;
                }
            }

            const result: ProjectResult = {
                contracts,
                builders: contractors,
            };
            return result;
        } catch (e) {
            throw e;
        }
    }

    private async getContractors(listId: string, ids: string[]) {
        try {
            const result = await utils.getItemsByQuery(
                _spPageContextInfo.webServerRelativeUrl,
                listId,
                this.getDesignerQuery(ids));

            if (result.data.length === 0) {
                return;
            }
            const designers = result.data.map(
                (ele) => {
                    const val: SelectLookupValue = {
                        LookupId: ele.get_id(),
                        LookupValue: ele.get_item(proj.FieldTitle),
                    };
                    return val;
                });
            return designers;
        } catch (e) {
            throw e;
        }
        return null;
    }

    //#region  [ CAML ]
    private getBOByExtIdQuery(val: number): string {
        let caml = '';
        caml = new CamlBuilder()
            .View([proj.FieldExternalId])
            .RowLimit(1)
            .Query()
            .Where()
            .NumberField('ID')
            .EqualTo(val)
            .ToString();
        return caml;
    }
    private docsByBoIDQuery(extID: number): string {
        // const cb = new CamlBuilder();
        // const query = cb
        //     .View()//, 'Title', proj.FieldBuildingAddress, 'ContentTypeId', 'ContentType'])
        //     .RowLimit(1000)
        //     .Query()
        //     .Where()
        //     .LookupMultiField(proj.FieldBuildingAddress)
        //     .IncludesSuchItemThat()
        //     .Id().In([extID])
        //     .And()
        //     .ComputedField('ContentType')
        //     .EqualTo('Договор')
        //     .OrderBy('ID') // Large List
        //     .ToString();

        // const query = '<View Scope="RecursiveAll"><Query><Where><And><And>' +
        //     '<Eq><FieldRef Name="ContentType" /><Value Type="Computed">Договор</Value></Eq><Eq>' +
        //     '<FieldRef Name="BuildingAddress_x005f_UNOM" /><Value Type="Number">' +
        //     extID +
        //     '</Value></Eq></And><Neq>' +
        //     '<FieldRef Name="ContentType" /><Value Type="Computed">Папка</Value></Neq></And></Where></Query>' +
        //     '<ViewFields><FieldRef Name="ContentTypeId" /><FieldRef Name="Title" /><FieldRef Name="BarCode" />' +
        //     '<FieldRef Name="BuildingAddress" LookupId="TRUE" />' +
        //     '<FieldRef Name="DocDate" /><FieldRef Name="DocNum" />' +
        //     '<FieldRef Name="AttributeOfDocument" /><FieldRef Name="GroupOfJobs" />' +
        //     '<FieldRef Name="ID" /><FieldRef Name="Created" />' +
        //     '<FieldRef Name="Builder" LookupId="TRUE" />' +
        //     '<FieldRef Name="BuildingAddress_x005f_Title" />' +
        //     '<FieldRef Name="BuildingAddress_x005f_District" />' +
        //     '<FieldRef Name="BuildingAddress_x005f_Region" />' +
        //     '<FieldRef Name="BuildingAddress_x005f_UNOM" />' +
        //     '<FieldRef Name="Builder_x005f_Title" /></ViewFields>' +
        //     '<ProjectedFields>' +
        //     '<Field Name="BuildingAddress_x005f_Title"' +
        //     'Type="LookupMulti" FieldRef="BuildingAddress" ShowField="Title" />' +
        //     '<Field Name="BuildingAddress_x005f_District"' +
        //     'Type="LookupMulti" FieldRef="BuildingAddress" ShowField="District" />' +
        //     '<Field Name="BuildingAddress_x005f_Region"' +
        //     'Type="LookupMulti" FieldRef="BuildingAddress" ShowField="Region" />' +
        //     '<Field Name="BuildingAddress_x005f_UNOM"' +
        //     'Type="LookupMulti" FieldRef="BuildingAddress" ShowField="UNOM" />' +
        //     '<Field Name="Builder_x005f_Title"' +
        //     'Type="Lookup" FieldRef="Builder" ShowField="Title" />' +
        //     '</ProjectedFields>' +
        //     '<RowLimit Paged="TRUE">1000</RowLimit></View>';

        const query = `
            <View Scope="RecursiveAll">
  <Query>
    <Where>
      <And>
        <And>
          <Eq>
            <FieldRef Name="ContentType" />
            <Value Type="Computed">Договор</Value>
          </Eq>
          <Eq>
            <FieldRef Name="BuildingAddress_x005f_UNOM" />
            <Value Type="Number">${extID}</Value>
          </Eq>
        </And>
        <Neq>
          <FieldRef Name="ContentType" />
          <Value Type="Computed">Папка</Value>
        </Neq>
      </And>
    </Where>
  </Query>
  <ViewFields>
    <FieldRef Name="ContentTypeId" />
    <FieldRef Name="Title" />
    <FieldRef Name="BarCode" />
    <FieldRef Name="BuildingAddress" LookupId="TRUE" />
    <FieldRef Name="DocDate" />
    <FieldRef Name="DocNum" />
    <FieldRef Name="AttributeOfDocument" />
    <FieldRef Name="GroupOfJobs" />
    <FieldRef Name="ID" />
    <FieldRef Name="Created" />
    <FieldRef Name="Builder" LookupId="TRUE" />
    <FieldRef Name="BuildingAddress_x005f_Title" />
    <FieldRef Name="BuildingAddress_x005f_District" />
    <FieldRef Name="BuildingAddress_x005f_Region" />
    <FieldRef Name="BuildingAddress_x005f_UNOM" />
    <FieldRef Name="Builder_x005f_Title" />
  </ViewFields>
  <ProjectedFields>
    <Field Name="BuildingAddress_x005f_Title" Type="LookupMulti" FieldRef="BuildingAddress" ShowField="Title" />
    <Field Name="BuildingAddress_x005f_District" Type="LookupMulti" FieldRef="BuildingAddress" ShowField="District" />
    <Field Name="BuildingAddress_x005f_Region" Type="LookupMulti" FieldRef="BuildingAddress" ShowField="Region" />
    <Field Name="BuildingAddress_x005f_UNOM" Type="LookupMulti" FieldRef="BuildingAddress" ShowField="UNOM" />
    <Field Name="Builder_x005f_Title" Type="Lookup" FieldRef="Builder" ShowField="Title" />
  </ProjectedFields>
  <RowLimit Paged="TRUE">100</RowLimit>
</View>`;
        // console.log(query);
        return query;
    }

    private getBoByUOPDQuery(id: string): string {
        const cb = new CamlBuilder();
        return cb.View()
            .RowLimit(1)
            .Query().Where()
            .TextField('UOPD_ID')
            .EqualTo(id).Or()
            // ID expr Should be deleted on prod.
            .NumberField('ID')
            .EqualTo(Number(id))
            .ToString();
    }

    private getDesignerQuery(ids: string[]): string {
        let query = '';
        const cb = new CamlBuilder();
        query = cb.View().Query().Where()
            .TextField(proj.FieldExtIdOCounterpartiesListProjSite)
            .In(ids).ToString();
        return query;
    }

    private getAllContractorFromMainSiteQuery(ids: number[]): string {
        const query = new CamlBuilder().View()
            .Query()
            .Where()
            .NumberField('ID')
            .In(ids).ToString();
        return query;
    }
    //#endregion

    private clearValues() {
        this.fields.forEach((f) => {
            if (f.name === proj.FieldBuildObj) { return; }
            if (f.type === 'Lookup' || f.type === 'LookupMulti') {
                (f as FormFieldLookup).value = [];
            } else {
                (f as FormFieldText).value = '';
            }
        });
    }
}
