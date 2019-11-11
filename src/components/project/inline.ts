import Vue from 'vue';
import AddFile from '@/components/docs/executive/AddFile.vue';
import { ProjectSiteSettings, SelectLookupValue, ExecutiveDocument } from '@/types';
import OnSaveDialogForm from '../OnSaveDialogForm.vue';
import PrintExecDocsDialog from '../PrintExecDocsDialog.vue';
import store from '@/store/store';
import { Fkrea } from "@/constants";
import scr = Fkrea.SPScripts;
import axios from 'axios';


export function showDownloadDialog(url: string, fileName: string) {
    SP.SOD.executeFunc('sp.ui.dialog.js', 'SP.UI.ModalDialog.showWaitScreenWithNoClose', () => {
        const loadingDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Пожалуйста подождите', 'Архивируем файлы. Это может занять несколько минут.', 150, 500);
        axios({
            url,
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            loadingDialog.close(SP.UI.DialogResult.OK);
        });
    });
    //SP.UI.ModalDialog.ShowPopupDialog(url);
    // SP.UI.ModalDialog.showModalDialog({
    //     autoSize: true,
    //     title: "test",
    //     url,
    //     html: element,
    //     // Callback dialog return
    //     dialogReturnValueCallback: (dialogResult: SP.UI.DialogResult) => {
    //         console.log("Closed");
    //         if (dialogResult === SP.UI.DialogResult.OK) {
    //         } else {
    //         }
    //     }
    // });
}

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

export function printReportDialog() {
    let element = document.getElementById('printReport');
    if (!element) {
        element = document.createElement('div');
        element.id = 'printReport';
    }
    const DialogComponent = Vue.extend({
        components: {
            PrintExecDocsDialog,
        },
        render: (h, context) => {
            return h(PrintExecDocsDialog, {
                props: {
                },
            });
        },
        store,
    });

    var component = new DialogComponent().$mount(element);
    element.appendChild(component.$el);
    return element;
}
export function showPrintReportDialog(projectId: number) {
    const mywindow = window.open('/sites/documentation/SitePages/PrintProjectExecutiveDocs.aspx?pid=' + projectId, 'PRINT', 'height=400,width=600');

    if (mywindow) {
        mywindow.document.write('<html><head><title></title>');
        mywindow.document.write('</head><body >');
        mywindow.document.write(printReportDialog().innerHTML);
        mywindow.document.write('</body></html>');
        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/
        mywindow.print();
        mywindow.close();
    }
}
