import { ActionTree } from 'vuex';
import types from '@/store/action-types';
import mutations from '@/store/mutation-types';
import {
    ExecutiveDocsState,
    RootState,
    ExecutiveDocument,
    IndexedExecDocs,
    IndexedExecDocsTypes,
    SelectLookupValue,
    FileData,
} from '@/types';
import { getExecutiveDocs, getExecutiveDocTypes, addExecutiveDoc, scanForDocuments } from '@/docHelper';
import { removeListItemById } from '@/utilities';
import { FieldNames } from '@/constants';

export const actions: ActionTree<ExecutiveDocsState, RootState> = {
    async [types.LOAD_EXEC_DOCS]({ commit, dispatch, state, rootState }) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }
        if (!rootState.project) {
            return;
        }

        // Initialize documents
        const docs = await getExecutiveDocs(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            rootState.project.id);

        commit(mutations.SET_EXEC_DOCS, { docs });
        try {
            await dispatch(types.SCAN_ALL_EXEC_DOC);
        }
        catch (e) {
            console.log(e);
        }
    },
    async [types.ADD_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }
        const file = await addExecutiveDoc(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            doc,
        );
        commit(mutations.ADD_EXEC_DOC, [file]);
    },
    async [types.EDIT_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }

        const file = await addExecutiveDoc(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            doc,
        );

        if (file && file.id > 0) {
            commit(mutations.EDIT_EXEC_DOC, file);
        }
    },
    async [types.REMOVE_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }

        // Old logic
        // if (doc.required) {
        //     const execDocEmpty: ExecutiveDocument = {
        //         id: doc.id,
        //         title: doc.title,
        //         required: true,
        //         docTypeId: doc.docTypeId,
        //         docTypeName: doc.docTypeName,
        //         hasRemarks: false,
        //         jobTypeId: doc.jobTypeId,
        //         projectId: doc.projectId,
        //         changed: false,
        //         barCode: '',
        //         comment: '',
        //         formType: '',
        //         remarks: '',
        //         scanDate: null,
        //         scanLink: '',
        //         scanSize: 0,
        //     };
        //     try {
        //         const newDoc = await addExecutiveDoc(
        //             rootState.projectSiteSettings.siteUrl,
        //             rootState.projectSiteSettings.executiveDocCardsListId,
        //             execDocEmpty, false);
        //         commit(mutations.EDIT_EXEC_DOC, newDoc);
        //     }
        //     catch (e) {
        //         console.error(e);
        //     }
        // } else {
        await removeListItemById(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            doc.id);
        commit(mutations.REMOVE_EXEC_DOC, doc);
        // }
    },
    async [types.SCAN_EXEC_DOC]({ commit, dispatch, state, rootState }, barCode: string) {
        if (!rootState.project) {
            return;
        }
        if (!rootState.project.jobTypes) {
            return;
        }
        if (barCode === '') {
            return [];
        }

        const bc = barCode + '.pdf';
        const docs = [];
        if (rootState.projectSiteSettings &&
            rootState.projectSiteSettings.siteUrl &&
            rootState.projectSiteSettings.executiveDocLibListId) {
            const files = await scanForDocuments(
                rootState.projectSiteSettings.siteUrl,
                rootState.projectSiteSettings.executiveDocLibListId,
                FieldNames.FieldFileLeafRef,
                [bc]);
            if (files.length) {
                docs.push(...files);
            }
        }

        if (rootState.archiveSiteSettings &&
            rootState.archiveSiteSettings.siteUrl &&
            rootState.archiveSiteSettings.scanDocLibListId) {
            const files = await scanForDocuments(
                rootState.archiveSiteSettings.siteUrl,
                rootState.archiveSiteSettings.scanDocLibListId,
                FieldNames.FieldFileLeafRef,
                [bc]);
            if (files.length) {
                docs.push(...files);
            }
        }
        return docs;
    },
    async [types.SCAN_ALL_EXEC_DOC]({ commit, dispatch, state, rootState }) {
        if (!rootState.project) {
            return;
        }
        if (!rootState.project.jobTypes) {
            return;
        }

        const barCodeFileNames: string[] = [];
        const barCodes: Array<{ id: number, barcode: string }> = Array<{ id: number, barcode: string }>();
        const arr = state.documents.filter((d) => d.barCode && (!d.scanLink || d.scanLink === ''));
        //
        arr.forEach((d) => {
            if (d.barCode && !d.scanLink) {
                barCodeFileNames.push(d.barCode + '.pdf');
                barCodes.push({ id: d.id, barcode: d.barCode });
            }
        });

        const files: FileData[] = [];
        try {
            if (rootState.projectSiteSettings &&
                rootState.projectSiteSettings.siteUrl &&
                rootState.projectSiteSettings.executiveDocLibListId) {
                const filesEx = await scanForDocuments(
                    rootState.projectSiteSettings.siteUrl,
                    rootState.projectSiteSettings.executiveDocLibListId,
                    FieldNames.FieldFileLeafRef,
                    barCodeFileNames);
                files.push(...filesEx);
            }
        }
        catch (e) {
            console.error(e);
        }

        try {
            if (rootState.archiveSiteSettings &&
                rootState.archiveSiteSettings.siteUrl &&
                rootState.archiveSiteSettings.scanDocLibListId) {
                const filesEx = await scanForDocuments(
                    rootState.archiveSiteSettings.siteUrl,
                    rootState.archiveSiteSettings.scanDocLibListId,
                    FieldNames.FieldFileLeafRef,
                    barCodeFileNames);
                files.push(...filesEx);
            }
        }
        catch (e) {
            console.error(e);
        }

        let bc = barCodes.pop();
        while (bc) {
            try {
                const barcode = bc.barcode;
                const fid = bc.id;
                const file = files.find((f) => f.name.toLowerCase() === (barcode + '.pdf'));
                const doc = state.documents.find((d) => (d.barCode === barcode && d.id === fid));
                //
                if (file && doc) {
                    // Should be changed in mutation
                    doc.scanDate = file.created;
                    doc.scanLink = file.url;
                    doc.scanSize = file.size;
                    // Commit all changes to server and commit.
                    await dispatch(types.EDIT_EXEC_DOC, doc);
                }
            }
            catch (e) {
                console.error(e);
            }
            bc = barCodes.pop();
        }
    },
};
