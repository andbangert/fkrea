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
} from '@/types';
import { getExecutiveDocs, getExecutiveDocTypes, addExecutiveDoc } from '@/docHelper';

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

        const jobTypeIds = new Array<number>();
        const grouped = docs.reduce((rv: IndexedExecDocs, x: ExecutiveDocument) => {
            let jobType = x.jobTypeId;
            if (!jobType) {
                jobType = 0;
            }
            else {
                jobTypeIds.push(jobType);
            }
            (rv[jobType] = rv[jobType] || []).push(x);
            return rv;
        }, {});
        commit(mutations.SET_EXEC_DOCS, { docs, grouped });
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

        if (doc.id > 0) {
            //     const newdoc = await addExecutiveDoc(
            //         rootState.projectSiteSettings.siteUrl,
            //         rootState.projectSiteSettings.executiveDocCardsListId,
            //         doc);
            commit(mutations.ADD_EXEC_DOC, [doc]);
        }
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
        if (doc.id > 0) {
            // const updateDoc = await addExecutiveDoc(
            //     rootState.projectSiteSettings.siteUrl,
            //     rootState.projectSiteSettings.executiveDocCardsListId,
            //     doc);
            commit(mutations.ADD_EXEC_DOC, [doc]);
        }
    },
    [types.REMOVE_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        
    }
};
