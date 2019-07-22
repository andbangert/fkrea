import Vue from 'vue';
import { MutationTree } from 'vuex';
import types from '@/store/mutation-types';
import { ExecutiveDocsState, ExecutiveDocument, IndexedExecDocsTypes, IndexedExecDocs } from '@/types';


export const mutations: MutationTree<ExecutiveDocsState> = {
    [types.SET_EXEC_DOCS](state, payload: { docs: ExecutiveDocument[], grouped: IndexedExecDocs }) {
        if (payload.docs.length > 0) {
            state.documents.push(...payload.docs);
        }
        state.groupedDocs = payload.grouped;
    },
    [types.ADD_EXEC_DOC](state, docs: ExecutiveDocument[]) {
        if (docs && docs.length > 0) {
            //state.documents.push(...docs);
            docs.forEach((doc) => {
                if (doc.jobTypeId) {
                    const arr = state.groupedDocs[doc.jobTypeId];
                    arr.push(doc);
                }
            });
        }
    },
    [types.REMOVE_EXEC_DOC](state, docs: ExecutiveDocument[]) {
        if (docs && docs.length > 0) {
            docs.forEach((doc) => {
                if (doc.jobTypeId) {
                    const arr = state.groupedDocs[doc.jobTypeId];
                    if (doc.required) {
                        const index = arr.findIndex((d) => d.id === d.id);
                        if (index >= 0) {
                            const execDocEmpty: ExecutiveDocument = {
                                id: doc.id,
                                required: true,
                                docTypeId: doc.docTypeId,
                                docTypeName: doc.docTypeName,
                                hasRemarks: false,
                                jobTypeId: doc.jobTypeId,
                                projectId: doc.projectId,
                            };
                            Vue.set(arr, index, execDocEmpty);
                        }
                    } else {
                        const index = arr.findIndex((d) => d.id === doc.id);
                        arr.splice(index, 1);
                    }
                }
            });
        }
    },
};
