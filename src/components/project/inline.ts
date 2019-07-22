import Vue from 'vue';
import AddFile from '@/components/docs/executive/AddFile.vue';
import { ProjectSiteSettings, SelectLookupValue, ExecutiveDocument } from '@/types';

export function addFileDialog(
    elementId: string,
    siteSettings: ProjectSiteSettings,
    projectId: number,
    doc?: ExecutiveDocument
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
                    siteSettings,
                    projectId,
                    doc,
                },
            });
        }
    });

    var component = new DialogComponent().$mount(element);
    element.appendChild(component.$el);
    return element;
}

export function showEditExecDocDialog(
    fn: (retDoc: ExecutiveDocument) => void,
    siteSettings: ProjectSiteSettings,
    projectId: number,
    doc?: ExecutiveDocument) {
    SP.SOD.executeFunc(
        "sp.ui.dialog.js",
        "SP.UI.ModalDialog.showModalDialog",
        // Callback start
        () => {
            // Open Save Dialog
            SP.UI.ModalDialog.showModalDialog({
                width: 1104,
                height: 730,
                //autoSize: true,
                title: "Добавить файл исполнительной документации",
                html: addFileDialog("addFileElem", siteSettings, projectId, doc),
                // Callback dialog return
                dialogReturnValueCallback: (
                    dialogResult: SP.UI.DialogResult,
                    returnValue: any
                ) => {
                    if (dialogResult === SP.UI.DialogResult.OK) {
                        const doc = returnValue as ExecutiveDocument;
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
