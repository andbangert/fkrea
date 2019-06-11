import { Module } from 'vuex';
import {
    StateObject,
    ProjectFormStateObject,
    ProjectCardSettings,
    FormField,
    FormMode,
    FormFieldLookup,
    FormFieldText,
} from '@/types';


export const fieldsToRender: string[] = [
    'Title',
    'Path',
    'Designer',
    'DesignerContracts',
    'Contractor',
    'Contracts',
    'TypeOfJobs',
];

export const projectFormState: Module<ProjectFormStateObject, StateObject> = {
    namespaced: true,
    state: {
        fields: new Array<FormField>(),
        listId: '',
        itemID: -1,
        mode: FormMode.Unknown,
        settings: null,
    },
    actions: {
        async initializeCard(
            { dispatch, commit },
            payload: {
                siteUrl: string,
                listId: string,
                itemId: number,
                settings: ProjectCardSettings,
            }) {

            // commit('initializeCard', {
            //     listId: string,
            //     itemId: number,
            //     mode: FormMode,
            //     fields: Array<FormField>,
            //     settings: ProjectCardSettings
            // });


            // Load List metadata
            const metadata = await new Promise<FormField[]>((resolve, reject) => {
                const fieldsMetadata = new Array<FormField>();
                const ctx = new SP.ClientContext(payload.siteUrl);
                const list = ctx.get_web().get_lists().getById(payload.listId);
                const fields = list.get_fields();
                let item = null;
                if (payload.itemId > 0) {
                    item = list.getItemById(payload.itemId);
                    ctx.load(item);
                }
                ctx.load(list);
                ctx.load(fields);
                ctx.executeQueryAsync((s, a) => {
                    fieldsToRender.forEach((name) => {
                        const fld = fields.getByInternalNameOrTitle(name);
                        const fieldType = fld.get_typeAsString();
                        if (fieldType === 'Lookup' || fieldType === 'LookupMulti') {
                            const fldLookup = fld as SP.FieldLookup;
                            if (fldLookup) {
                                fieldsMetadata.push(
                                    new FormFieldLookup(
                                        fldLookup.get_internalName(),
                                        fldLookup.get_title(),
                                        fldLookup.get_lookupList(),
                                        undefined,
                                        fldLookup.get_allowMultipleValues()));
                            }
                        } else if ((fieldType === 'TextField' || fieldType === 'Text')) {
                            const fldText = fld as SP.FieldText;
                            fieldsMetadata.push(
                                new FormFieldText(
                                    fldText.get_internalName(),
                                    fldText.get_title(),
                                    undefined));
                        }
                    });
                    resolve(fieldsMetadata);
                }, (s, a: SP.ClientRequestFailedEventArgs) => {
                    reject();
                });
                ctx.dispose();
            });
        },
    },
    mutations: {
        initializeCard(state, payload: {
            listId: string,
            itemId: number,
            mode: FormMode,
            fields: FormField[],
            settings: ProjectCardSettings,
        }) {
            state.listId = payload.listId;
            state.itemID = payload.itemId;
            state.mode = payload.mode;
            state.fields = payload.fields;
            state.settings = payload.settings;
        },
    },
};
