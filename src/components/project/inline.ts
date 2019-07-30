import Vue from 'vue';
import AddFile from '@/components/docs/executive/AddFile.vue';
import { ProjectSiteSettings, SelectLookupValue, ExecutiveDocument } from '@/types';
import OnSaveDialogForm from '../OnSaveDialogForm.vue';
import store from '@/store/store';


export function showOnSaveDialog(
    title: string,
    instructions: string,
    buttonOk: string,
    subject: string,
    fnOk: () => void, fnCancel?: () => void) {
    SP.UI.ModalDialog.showModalDialog({
        autoSize: true,
        title,
        html: createOnSaveDialogElement(
            "_onSaveDialog",
            instructions,
            buttonOk,
            subject,
        ),
        // Callback dialog return
        dialogReturnValueCallback: (dialogResult: SP.UI.DialogResult) => {
            if (dialogResult === SP.UI.DialogResult.OK) {
                fnOk();
            } else {
                if (fnCancel) {
                    fnCancel();
                }
            }
        }
    });
}

export function createOnSaveDialogElement(
    elementId: string,
    instructions: string,
    buttonOk: string,
    subject: string,
): HTMLElement {
    let element = document.getElementById(elementId);
    if (!element) {
        element = document.createElement("div");
        element.id = elementId;
    }

    const DialogComponent = Vue.extend({
        components: {
            OnSaveDialogForm
        },
        render: (h, context) => {
            return h(OnSaveDialogForm, {
                props: {
                    instructions,
                    buttonOk,
                    subject
                },
                scopedSlots: {
                    ["instructions"]: props => props.instructions,
                    ["buttonOk"]: props => props.buttonOk,
                    ["subject"]: props => props.subject
                }
            });
        }
    });
    const component = new DialogComponent().$mount(element);
    element.appendChild(component.$el);
    return element;
}


export function addFileDialog(
    elementId: string,
    // siteSettings: ProjectSiteSettings,
    // projectId: number,
    doc?: ExecutiveDocument,
    jobTypeId?: number,
) {
    let element = document.getElementById(elementId);
    if (!element) {
        element = document.createElement('div');
        element.id = elementId;
    }

    const DialogComponent = Vue.extend({
        components: {
            AddFile,
        },
        render: (h, context) => {
            return h(AddFile, {
                props: {
                    // siteSettings,
                    // projectId,
                    doc,
                    jobTypeId,
                },
            });
        },
        store,
    });

    var component = new DialogComponent().$mount(element);
    element.appendChild(component.$el);
    return element;
}

export function showEditExecDocDialog(
    fn: (retDoc: ExecutiveDocument) => void,
    doc?: ExecutiveDocument, jobTypeId?: number) {
    SP.SOD.executeFunc(
        "sp.ui.dialog.js",
        "SP.UI.ModalDialog.showModalDialog",
        // Callback start
        () => {
            // Open Save Dialog
            SP.UI.ModalDialog.showModalDialog({
                width: 970,
                height: 630,
                //autoSize: true,
                title: "Добавить файл исполнительной документации",
                html: addFileDialog("addFileElem", doc, jobTypeId),
                // Callback dialog return
                dialogReturnValueCallback: (
                    dialogResult: SP.UI.DialogResult,
                    returnValue: any
                ) => {
                    if (dialogResult === SP.UI.DialogResult.OK) {
                        const doc = returnValue as ExecutiveDocument;
                        console.log(doc);
                        fn(doc);
                    } else {
                        // without save
                    }
                }
                // End callback dialog return
            });
        } // Callback ends
    );
}
