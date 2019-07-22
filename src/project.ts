import { Vue } from 'vue-property-decorator';
import vSelect from 'vue-select';
import SPListItemToolbar from '@/components/forms/SPListItemToolbar.vue';
import OnSaveDialogForm from '@/components/OnSaveDialogForm.vue';
import '@/scss/v-select.css';
import '@/scss/form.css';

import CamlBuilder from 'camljs';
import * as utils from './utilities';
import * as constants from './constants';
import {
    ProjectCardSettings,
    SelectLookupValue,
    SPClientRequestError,
} from './types';

import { FieldValidationResult } from '@/types/FieldValidationResult';

import proj = constants.Fkrea.Fields;

Vue.component('v-select', vSelect);
Vue.component('list-item-toolbar', SPListItemToolbar);
Vue.component('save-dialog', OnSaveDialogForm);


export class ProjectForm {
    // 'BuildObj' is excluded from this collection as root element.
    private fieldsToRender = [
        'Designer',
        'DesignerContracts',
        'Contractor',
        'Contracts',
        'TypeOfJobs',
    ];
    private formCtx: SPClientTemplates.RenderContext_Form;
    private fieldVms = Array<{ fieldName: string, vm: Vue }>();
    private settings: ProjectCardSettings;
    private loadingOnEdit: boolean = false;
    private webUrl: string;
    private phBO = 'Введите текст для поиска. Минимум 3 символа';
    private phSelect = 'Значение не выбрано';
    private instructions: string = 'Нажмите кнопку "Продолжить",'
        + ' чтобы перейти к добавлению файлов.';
    private buttonOk: string = 'Продолжить';
    private folderInstructions = 'Папка проекта с таким иемене уже существует.'
        + 'Задайте другое имя в поле "Название" и попробуйте еще раз сохранить карточку.';
    private notifId: string = '';


    constructor(formCtx: SPClientTemplates.RenderContext_Form, settings: ProjectCardSettings) {
        this.formCtx = formCtx;
        this.webUrl = this.formCtx.FormContext.webAttributes.WebUrl;
        this.settings = settings;
        this.initBuildObjectField();
        this.initFields();
        this.createToolbar();
        if (this.formCtx.ControlMode === SPClientTemplates.ClientControlMode.EditForm) {
            this.loadingOnEdit = true;
            this.initFieldsOnEditMode();
        }
    }

    private initBuildObjectField() {
        if (!this.formCtx || !this.formCtx.ListSchema) {
            return;
        }
        const fldCtx = this.formCtx.ListSchema.Field.
            find((fld) => fld.Name === proj.FieldBuildObj) as SPClientTemplates.FieldSchema_InForm_Lookup;
        if (!fldCtx) {
            return;
        }
        const buildObjElementId = `${fldCtx.Name}_${fldCtx.Id}_$${fldCtx.FieldType}Field_fld`;
        const fieldBoOpts: VueSelectOptions = {
            onSearch: async function (queryText: string, loading: (val: boolean) => void) {
                if (!queryText || queryText.length < 3) {
                    this.options = [];
                    return;
                }
                loading(true);
                try {
                    const objr = await utils.SearchListObject(
                        queryText, fldCtx.LookupListId, 100, ['ListItemID', 'Title', 'externalIDOWSTEXT']);
                    const results = objr as SP.JsonObjectResult;
                    if (results) {
                        const result = results.get_value() as ResultTableCollection;
                        if (!result || !result.ResultTables || result.ResultTables.length === 0) {
                            loading(false);
                            return;
                        }
                        const values = result.ResultTables[0].ResultRows.map((r) => {
                            return {
                                LookupId: r.ListItemID,
                                LookupValue: r.Title,
                                externalID: r.externalIDOWSTEXT,
                            };
                        });
                        this.options = values;
                    }
                } catch (e) {
                    loading(false);
                }
                loading(false);
            },
            onChange: async (value: string | object) => {
                let val = value;
                if (!value) {
                    // Reset all fields
                    this.setDesigner(null); // Options
                    this.setContracts(null); // Options
                    this.setEmptyValues();
                    return;
                }
                if (Array.isArray(value)) {
                    val = value[0];
                }
                // Get external ID if edit form loading...
                const slv = val as SelectLookupValue;
                if (!slv) { return; }
                if (this.loadingOnEdit) {
                    await this.getBuildObject(slv);
                } else {
                    this.onBuildObjChanged(slv);
                    // await this.getBuildObject(slv);
                    // Set title. Title by SP when edit mode.
                    this.setTextFieldValue(slv.LookupValue, proj.FieldTitle);
                    // Set Path Field Only In NewMode
                    if (this.formCtx.ControlMode ===
                        SPClientTemplates.ClientControlMode.NewForm) {
                        this.setTextFieldValue(slv.LookupValue, proj.FieldPath);
                    }
                }
            },
            label: 'LookupValue',
            filterable: false,
            open: true,
            placeholder: this.phBO,
        };
        this.fieldVms.push({
            fieldName: proj.FieldBuildObj,
            vm: this.createBuildObjectFieldControl(buildObjElementId, fieldBoOpts),
        });
    }

    private initFields() {
        this.fieldsToRender.forEach((fldName) => {
            const element = this.formCtx.ListSchema.Field.find((f) => f.Name === fldName);
            if (!element) {
                return;
            }
            const fldChoice = element as SPClientTemplates.FieldSchema_InForm_Lookup;
            let multi: boolean = false;
            if (fldChoice && fldChoice.AllowMultipleValues) {
                multi = true;
            } else if (fldName === proj.FieldDesignerContracts || fldName === proj.FieldContracts) {
                multi = true;
            }
            let choices: any[] = [];
            if (element.Name !== proj.FieldDesigner &&
                element.Name !== proj.FieldContractor &&
                element.Name !== proj.FieldContracts &&
                element.Name !== proj.FieldDesignerContracts) {
                if (fldChoice) {
                    choices = fldChoice.Choices;
                }
            }

            const options: VueSelectOptions = {
                options: choices,
                label: 'LookupValue',
                multiple: multi,
                placeholder: this.phSelect,
            };

            try {
                const bindEleId = `${element.Name}_${element.Id}_$${element.FieldType}Field_fld`;
                const vm = this.createSelectField(bindEleId, options);
                this.fieldVms.push({ fieldName: element.Name, vm });
            } catch (e) {
                // console.error(e);
            }
        });
    }

    private async getBuildObject(value: SelectLookupValue) {
        const query = this.getBOByExtIdQuery(value.LookupId);
        const lfld =
            this.formCtx
                .ListSchema.Field
                .find((f) => f.Name === proj.FieldBuildObj) as SPClientTemplates.FieldSchema_InForm_Lookup;

        const boListId = lfld.LookupListId;
        const item = await utils
            .getItemsByQuery(this.webUrl, boListId, query);

        if (item && item.data && item.data.length > 0) {
            const val: SelectLookupValue = {
                ...value,
                externalID: item.data[0].get_item(proj.FieldExternalId),
            };
            await this.onBuildObjChanged(val);
        }
    }

    private async onBuildObjChanged(val: SelectLookupValue) {
        if (!val) {
            this.setDesigner(null);
            this.setContracts(null);
            return;
        }
        const value = val as SelectLookupValue;
        if (!value || !value.externalID) {
            // console.log('UOPD_ID is null or empty');
            // console.log(value);
            return;
        }

        let boExtId = -1;
        // UOPD_ID
        try {
            const resultBo = await utils.getItemsByQuery(this.settings.siteUrl,
                this.settings.buildingsListId,
                this.getBoByUOPDQuery(value.externalID));
            if (resultBo.data && resultBo.data.length !== 0) {
                boExtId = resultBo.data[0].get_id();
            }
        } catch (e) {
            console.error(e);
        }
        // const boExtId = value.externalID;// ? Number(value.externalID) : -1;
        if (!boExtId) {
            throw new Error('externalID of "build object" can not be null or empty.');
        }
        try {
            // console.log(this._settings.docListId);
            // Get Build Addresses from main site...
            const result = await utils.getItemsByQuery(this.settings.siteUrl,
                this.settings.docListId,
                this.docsByBoIDQuery(boExtId));
            if (!result || !result.data) {
                // console.log('Building address could not be found on main site.');
                return;
            }
            if (result.data.length === 0) {
                // console.log(result);
                // console.log('Building address could not be found on main site.');
                return;
            }
            // const ddd = fkr.getDocsByBuildingAddressUNOM(boExtId + '');
            // console.log(ddd);
            // const result =
            // {
            //    data: new Array<SP.ListItem<any>>(),
            // };
            // Fetch all builder's id
            const blds = new Array<number>();
            const contracts = new Array<SelectLookupValue>();
            result.data.forEach((doc) => {
                const lv = doc.get_item(proj.FieldBuilder) as SP.FieldLookupValue;
                if (lv) {
                    blds.push(lv.get_lookupId());
                }
                const dirRef = doc.get_item('FileDirRef');
                const leafRef = doc.get_item('FileLeafRef');
                const ub = new SP.Utilities.UrlBuilder(dirRef);
                ub.combinePath(leafRef);
                contracts.push({
                    LookupId: doc.get_id(),
                    LookupValue: doc.get_item(proj.FieldTitle),
                    url: ub.get_url(),
                });
            });
            // Set contracts
            this.setContracts(contracts);
            const query = this.getAllContractorFromMainSiteQuery(blds);
            // Get All Builders from main site...
            const buildrs = await utils.getItemsByQuery(this.settings.siteUrl,
                this.settings.contractorListId, query);
            const buildUnoIds = new Array<string>();
            if (buildrs.data && buildrs.data.length > 0) {
                // Fetch all DUOPD_ID to get local designers and contractors
                buildrs.data.forEach((bld) => {
                    buildUnoIds.push(bld.get_item(proj.FieldUOPDID) as string);
                });
            } else {
                return;
            }
            // Set field options to designer and contractor fields.
            await this.getDesigner(buildUnoIds);
        } catch (e) {
            throw e;
        }
    }

    private async getDesigner(ids: string[]) {
        const fld = this.formCtx.ListSchema.Field.find((f) =>
            f.Name === proj.FieldDesigner);
        const designerFld = fld as SPClientTemplates.FieldSchema_InForm_Lookup;
        if (!designerFld) {
            return;
        }
        try {
            const result = await utils.getItemsByQuery(
                _spPageContextInfo.webServerRelativeUrl,
                designerFld.LookupListId,
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
                },
            );
            this.setDesigner(designers);
        } catch (e) {
            throw e;
        }
    }

    private setDesigner(options: SelectLookupValue[] | null) {
        this.setOptions(proj.FieldDesigner, options);
        this.setOptions(proj.FieldContractor, options, true);
    }

    private setContracts(options: SelectLookupValue[] | null) {
        this.setOptions(proj.FieldContracts, options, true);
        this.setOptions(proj.FieldDesignerContracts, options, true);
    }

    private setOptions(
        fieldName: string,
        options: SelectLookupValue[] | null,
        multi: boolean = false,
    ) {
        const vm = this.fieldVms.find((v) => v.fieldName === fieldName);
        if (vm) {
            const opts = (vm.vm.$props as VueSelectOptions);
            opts.options =
                options !== null ? options : [];
        }
    }

    private getFieldByName(fieldName: string) {
        return this.formCtx.ListSchema.Field.find((fld) => fld.Name === fieldName);
    }

    private setTextFieldValue(value: string, fieldName: string) {
        const fld = this.getFieldByName(fieldName);
        if (fld) {
            const tit = document
                .getElementById(utils.getInputTextId(fld)) as HTMLInputElement;
            if (tit) {
                if (!value || value === '') {
                    tit.value = '';
                    return;
                }
                let val = value.substring(value.lastIndexOf(',') + 1);
                val = 'Комплект документов по адресу ' + val.replace(/,|;|\\|\/|\||\.|'/g, '');
                tit.value = val;
                // Update form value
                this.formCtx.FormContext.updateControlValue(fld.Name, val);
            }
        }
    }

    private Save(): boolean {
        // Validate
        if (!this.validateFields()) {
            return false;
        }
        if (this.formCtx.ControlMode === SPClientTemplates.ClientControlMode.NewForm) {
            // Create folders
            // console.log('save');
            this.createFolder((folder: SP.Folder | null, exists, msg) => {
                if (exists && folder !== null) {
                    this.notifyOnError('Ошибка создания папки проекта',
                        this.folderInstructions + ' Папка: ' + folder.get_name(),
                    );
                } else if (folder !== null) {
                    this.onSave();
                } else {
                    this.notifyOnError('Ошибка создания папки проекта', msg ? msg : '');
                }
            });
        } else {
            this.onSave();
        }
        return false;
    }

    private onSave() {
        this.saveInputs();
        if (PreSaveItem && !PreSaveItem()) {
            return false;
        }
        this.customSave()
            .then((result) => {
                SP.SOD.executeFunc(
                    constants.Fkrea.SPScripts.SP_UI_Dialog.Script,
                    constants.Fkrea.SPScripts.SP_UI_Dialog.ShowModalDialog, () => {
                        this.showOnSaveDialog(result.get_id());
                    });
            });
        // .catch((e) => {});
    }

    private Cancel() {
        let retUrl = GetUrlKeyValue('source');
        // if (window['WPQ2FormCtx']) {
        //     const fctx = window['WPQ2FormCtx'] as SPGlobalFormContext;
        //     retUrl = fctx.RedirectInfo.redirectUrl;
        // }
        // else {
        //     retUrl = GetUrlKeyValue('source');
        // }
        if (retUrl && retUrl !== '') {
            retUrl = '/';
        }
        // Go Add File Page Dialog
        STSNavigate(SP.Utilities.HttpUtility.urlPathEncode(retUrl));
    }

    private notifyOnError(errorTitle: string, error: string) {
        SP.SOD.executeFunc(
            constants.Fkrea.SPScripts.SP.Script,
            constants.Fkrea.SPScripts.SP.UI.Status,
            () => {
                SP.UI.Notify.removeNotification(self.notify);
                SP.UI.Status.removeAllStatus(false);
                const status = SP.UI.Status.addStatus(errorTitle, error);
                SP.UI.Status.setStatusPriColor(status, 'red');
            }
        );
    }

    // #region [ Save Functions ]
    private async customSave(): Promise<SP.ListItem> {
        return new Promise<SP.ListItem>((resolve, reject) => {
            let item: SP.ListItem;
            const ctx = this.formCtx.FormContext;
            const initContext = SPClientTemplates.Utility.InitContext(ctx.webAttributes.WebUrl);
            const params = new SP.ListItemCreationInformation();
            let allFormValues = new Array<SP.ListItemFormUpdateValue>();

            initContext.add_requestSucceeded((source, eventArgs) => {
                resolve(item);
            });
            initContext.add_requestFailed((source, eventArgs) => {
                // OnRequestFailed(source, eventArgs);
                reject(new SPClientRequestError(eventArgs));
            });
            const formList = ((initContext.get_web()).get_lists()).getById(ctx.listAttributes.Id);
            const isNew = SPClientTemplates.ClientControlMode.NewForm === this.formCtx.ControlMode;
            params.set_underlyingObjectType(ctx.itemAttributes.FsObjType);
            if (isNew) {
                item = formList.addItem(params);
            } else {
                // console.log(ctx.itemAttributes.Id);
                item = formList.getItemById(ctx.itemAttributes.Id);
            }
            this.formCtx.ListSchema.Field.forEach((fld) => {
                const value = this.getFieldValue(fld.Name);
                if (value !== null) {
                    const formUpdateValue = new SP.ListItemFormUpdateValue();
                    formUpdateValue.set_fieldName(fld.Name);
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

    private getFieldValue(fName: string): string | null {
        const formEltPrefix = 'ClientFormPostBackValue_'
            + this.formCtx.FormContext.listAttributes.Id + '_';
        const inputId = formEltPrefix + fName;
        const curInputElt = document.getElementById(inputId) as HTMLInputElement;
        if (curInputElt != null) {
            return curInputElt.value;
        }
        return null;
    }

    private getSelectOptions(fieldName: string) {
        return this.fieldVms.find((vm) => vm.fieldName === fieldName);
    }

    private saveInputs() {
        this.saveInput(proj.FieldBuildObj, this.getCurrentValue(proj.FieldBuildObj));
        this.fieldsToRender.forEach((fldName) => {
            this.saveInput(fldName, this.getCurrentValue(fldName));
        });
    }

    private getCurrentValue(fieldName: string): SelectLookupValue[] | undefined {
        const vm = this.getSelectOptions(fieldName);
        let value: SelectLookupValue[] | undefined;
        if (vm) {
            const options = (vm.vm as VueSelectOptions);
            const valueArr = options.valueAsArray;
            if (valueArr) {
                value = valueArr.map((v) => {
                    return v as SelectLookupValue;
                });
            }
        }
        return value;
    }

    private saveInput(fieldName: string, value: SelectLookupValue | SelectLookupValue[] | undefined) {
        const ctx = this.getFieldByName(fieldName);
        if (!ctx) { return; }
        if (ctx.FieldType === 'Lookup' || ctx.FieldType === 'LookupMulti') {
            const fldChoice = ctx as SPClientTemplates.FieldSchema_InForm_Lookup;
            const eleId = fldChoice.AllowMultipleValues
                ? utils.getInputMultiLookupId(ctx)
                : utils.getInputLookupId(ctx);
            const ele = document.getElementById(eleId) as HTMLInputElement;
            if (!ele) {
                throw new Error(`${eleId} not found.`);
            }
            const ctrlVal = this.convertValueToString(value);
            ele.value = ctrlVal;
            this.formCtx.FormContext.updateControlValue(ctx.Name, ctrlVal);
        } else {
            const ctrlVal = this.convertValueToString(value);
            const eleId = utils.getInputTextId(ctx);
            const ele = document.getElementById(eleId) as HTMLInputElement;
            ele.value = ctrlVal;
            this.formCtx.FormContext.updateControlValue(ctx.Name, ctrlVal);
        }
    }

    private convertValueToString(value: SelectLookupValue | SelectLookupValue[] | undefined): string {
        if (!value) {
            return '';
        }
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '';
            }
            return this.getMultiLookupValueAsString(value);
        }
        const val = value as SelectLookupValue;
        return this.getLookupValueAsString(val);
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
    // #endregion

    //#region [ Vue render ]

    private createBuildObjectFieldControl(elementId: string, props: VueSelectOptions) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id ${elementId} does not exists.`);
        }
        const selectField = Vue.extend({
            components: {
                vSelect,
            },
            render: (h, context) => {
                return h('v-select', {
                    props,
                    scopedSlots: {
                        ['no-options']: () => 'Нет значений для выбора',
                    },
                });
            },
        });
        const fld = new selectField();
        return fld.$mount(element).$children[0];
    }

    private createSelectField(elementId: string, props: VueSelectOptions): Vue {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id ${elementId}.`);
        }
        const selectField = Vue.extend({
            components: {
                vSelect,
            },
            render: (h, context) => {
                return h('v-select', {
                    props,
                    scopedSlots: {
                        ['no-options']: () => 'Нет значений для выбора',
                    },
                });
            },
        });
        const fld = new selectField().$mount(element);
        return fld.$children[0];
    }

    private createToolbar() {
        const self = this;
        const element = document.getElementById('_toolBarSection');
        if (!element) {
            throw new Error(`Element with id _toolBarSection.`);
        }
        const toolbar = Vue.extend({
            components: {
                SPListItemToolbar,
            },
            render: (h, context) => {
                return h('list-item-toolbar', {
                    props: {
                        onSave: () => {
                            self.Save();
                        },
                        onCancel: () => {
                            self.Cancel();
                        },
                    },
                });
            },
        });
        new toolbar().$mount(element);
    }

    private createOnSaveDialogElement(elementId: string,
        instructions: string,
        buttonOk: string,
        subject: ''
    ): HTMLElement {
        let element = document.getElementById(elementId);
        if (!element) {
            element = document.createElement('div');
            element.id = elementId;
        }

        const DialogComponent = Vue.extend({
            components: {
                OnSaveDialogForm,
            },
            render: (h, context) => {
                return h(OnSaveDialogForm, {
                    props: {
                        instructions,
                        buttonOk,
                        subject,
                    },
                    scopedSlots: {
                        ['instructions']: (props) => props.instructions,
                        ['buttonOk']: (props) => props.buttonOk,
                        ['subject']: (props) => props.subject,
                    },
                });
            },
        });
        const component = new DialogComponent().$mount(element);
        element.appendChild(component.$el);
        return element;
    }
    //#endregion

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
        const cb = new CamlBuilder();
        const query = cb
            .View()
            .RowLimit(1000)
            .Query()
            .Where()
            .LookupMultiField(proj.FieldBuildingAddress)
            .IncludesSuchItemThat()
            .Id().In([extID])
            .And()
            .ComputedField('ContentType')
            .EqualTo('Договор')
            .OrderBy('ID') // Large List
            .ToString();
        return query;
    }

    private getBoByUOPDQuery(id: string): string {
        const cb = new CamlBuilder();
        return cb.View()
            .RowLimit(1)
            .Query().Where()
            .TextField('UOPD_ID')
            .EqualTo(id)
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

    private showOnSaveDialog(projectId: number) {
        SP.UI.ModalDialog.showModalDialog({
            autoSize: true,
            title: 'Сохранение проекта...',
            html: this.createOnSaveDialogElement(
                '_onSaveDialog', this.instructions, this.buttonOk, '',
            ),
            // Callback dialog return
            dialogReturnValueCallback: (
                dialogResult: SP.UI.DialogResult,
            ) => {
                if (dialogResult === SP.UI.DialogResult.OK) {
                    let rurl = ''; // GetUrlKeyValue('source');
                    const webUrl = this.formCtx.FormContext.webAttributes.WebUrl;
                    const page = 'Lists/Projects/DispFormTabsV1.aspx';
                    const fid = this.formCtx.FormUniqueId + 'FormCtx';
                    if (window[fid]) {
                        const fctx = window[fid] as SPGlobalFormContext;
                        rurl = fctx.RedirectInfo.redirectUrl;
                    } else {
                        rurl = GetUrlKeyValue('source');
                    }
                    // const url = `${webUrl}/${page}?pid=${projectId}&mode=${mode}&returnUrl=${rurl}`;
                    const url = `${webUrl}/${page}?ID=${projectId}&returnUrl=${rurl}`;
                    STSNavigate(url);
                } else {
                    this.Cancel();
                }
            },
        });
    }

    private setEmptyValues() {
        this.fieldsToRender.forEach((f) => {
            this.setSelectValues(f, []);
        });
    }

    private setSelectValues(fieldName: string, options: SelectLookupValue[]) {
        const vm = this.getSelectOptions(fieldName);
        if (vm) {
            (vm.vm.$props as VueSelectOptions).value = options ? options : [];
        }
    }

    private initFieldsOnEditMode() {
        if (!this.formCtx.ListData) {
            return;
        }
        const items = this.formCtx.ListData.Items as SPClientTemplates.Item[];
        if (!items || items.length === 0) {
            return;
        }
        const item = items[0] as SPClientTemplates.Item;
        if (!item) {
            return;
        }
        //
        const formFields = this.formCtx.ListSchema.Field;
        const fields = [...this.fieldsToRender, proj.FieldBuildObj];
        fields.forEach((fldName) => {
            const value = item[fldName];
            const fld = formFields.find((f) => f.Name === fldName) as SPClientTemplates.FieldSchema_InForm;
            if (!value || !fld) {
                return;
            }
            if (fld.Type === 'Lookup') {
                const lookupFld = fld as SPClientTemplates.FieldSchema_InForm_Lookup;
                if (lookupFld.AllowMultipleValues) {
                    const values = SPClientTemplates.Utility.ParseMultiLookupValues(value);
                    if (values && values.length > 0) {
                        const optValues = values.map((v) => {
                            const slv: SelectLookupValue = { ...v };
                            return slv;
                        });
                        this.setSelectValues(fld.Name, optValues);
                    }
                } else {
                    const lv = SPClientTemplates.Utility.ParseLookupValue(value);
                    if (lv) {
                        const slv: SelectLookupValue = { ...lv };
                        this.setSelectValues(fld.Name, [slv]);
                    }
                }
            } else {
                const values = SPClientTemplates.Utility.ParseMultiLookupValues(value);
                if (values && values.length > 0) {
                    const optValues = values.map((v) => {
                        const slv: SelectLookupValue = { ...v };
                        return slv;
                    });
                    this.setSelectValues(fld.Name, optValues);
                }
            }
        });
    }

    private validateFields(): boolean {
        let vresult = true;
        const fld = this.formCtx.ListSchema.Field.find((fld) => fld.Name === proj.FieldTitle);
        if (!fld) { return vresult; }
        if (fld.Required) {
            const value = this.getFieldValue(fld.Name);
            const result = new SPClientForms
                .ClientValidation
                .RequiredFileValidator()
                .Validate(value) as FieldValidationResult;
            const nodeId = utils.getInputTextId(fld);
            this.addValidatorElement(nodeId, result);
            vresult = (vresult && !result.validationError);
        }
        return vresult;
    }

    private addValidatorElement(nodeId: string, errorResult: FieldValidationResult) {
        const errorSpanId = 'Error_' + nodeId;
        const span = document.getElementById(errorSpanId);

        if (span != null && span.parentNode != null)
            span.parentNode.removeChild(span);
        if (!errorResult.validationError)
            return;
        const inputElt = document.getElementById(nodeId);

        if (inputElt == null || inputElt.parentNode == null)
            return;
        const errorSpan = document.createElement("SPAN");

        errorSpan.id = errorSpanId;
        errorSpan.className = 'ms-formvalidation ms-csrformvalidation';
        errorSpan.innerHTML = '<span role="alert">' + STSHtmlEncode(errorResult.errorMessage) + '<br/></span>';
        inputElt.parentNode.appendChild(errorSpan);
    }

    // TODO: Need to be refactored
    private async createFolder(
        fn: (folder: SP.Folder | null, exists: boolean, errorMsg?: string)
            => void) {

        const path = this.getFieldValue(proj.FieldPath);
        try {
            if (path) {
                const folder =
                    await utils.
                        checkIfFolderExists(
                            _spPageContextInfo.webServerRelativeUrl,
                            this.settings.scanLib,
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
                            const folder = await utils.
                                createFolderRecursively(
                                    _spPageContextInfo.webServerRelativeUrl,
                                    this.settings.scanLib,
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
    // End
}
//}
