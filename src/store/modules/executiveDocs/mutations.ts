import Vue from 'vue';
import { MutationTree } from 'vuex';
import types from '@/store/mutation-types';
import { ExecutiveDocsState, ExecutiveDocument, IndexedExecDocsTypes, IndexedExecDocs } from '@/types';

export const mutations: MutationTree<ExecutiveDocsState> = {
    [types.SET_EXEC_DOCS](state, payload: { docs: ExecutiveDocument[] }) {
        if (payload.docs.length > 0) {
            state.documents.push(...payload.docs);
        }
        //Vue.set(state.groupedDocs, '')
        // state.groupedDocs = payload.grouped;
    },
    [types.ADD_EXEC_DOC](state, docs: ExecutiveDocument[]) {
        if (docs && docs.length > 0) {
            state.documents.push(...docs);
        }
    },
    [types.EDIT_EXEC_DOC](state, doc: ExecutiveDocument) {
        if (doc) {
            const index = state.documents.findIndex((d) => d.id === doc.id);
            Vue.set(state.documents, index, doc);
        }
    },
    [types.REMOVE_EXEC_DOC](state, doc: ExecutiveDocument) {
        if (doc) {
            const index = state.documents.findIndex((d) => d.id === doc.id);
            state.documents.splice(index, 1)
        }
    },
};


// export const mutations: MutationTree<ExecutiveDocsState> = {
//     [types.SET_EXEC_DOCS](state, payload: { docs: ExecutiveDocument[], grouped: IndexedExecDocs }) {
//         if (payload.docs.length > 0) {
//             state.documents.push(...payload.docs);
//         }
//         state.groupedDocs = payload.grouped;
//     },
//     [types.ADD_EXEC_DOC](state, docs: ExecutiveDocument[]) {
//         if (docs && docs.length > 0) {
//             //state.documents.push(...docs);
//             docs.forEach((doc) => {
//                 if (doc.jobTypeId) {
//                     const arr = state.groupedDocs[doc.jobTypeId];
//                     //Vue.set(arr, arr.length, doc);
//                     arr.push(...[doc]);
//                     Vue.set(state.groupedDocs[doc.jobTypeId], 'length', arr.length);
//                 }
//             });
//         }
//     },
//     [types.EDIT_EXEC_DOC](state, doc: ExecutiveDocument) {
//         if (doc && doc.jobTypeId) {
//             const arr = state.groupedDocs[doc.jobTypeId];
//             const index = arr.findIndex((d) => d.id === doc.id);
//             Vue.set(arr, index, doc);
//             Vue.set(state.groupedDocs, doc.jobTypeId, arr);
//         }
//     },
//     [types.REMOVE_EXEC_DOC](state, doc: ExecutiveDocument) {
//         if (doc.jobTypeId) {
//             const arr = state.groupedDocs[doc.jobTypeId];
//             const index = arr.findIndex((d) => d.id === doc.id);
//             arr.splice(index, 1);
//         }
//     },
// };
