import Vue from 'vue';
import { MutationTree } from 'vuex';
import types from '@/store/mutation-types';
import { ExecutiveDocsState, ExecutiveDocument, IndexedExecDocsTypes, IndexedExecDocs, FileData } from '@/types';

export const mutations: MutationTree<ExecutiveDocsState> = {
    [types.SET_EXEC_DOCS](state, payload: { docs: ExecutiveDocument[] }) {
        if (payload.docs.length > 0) {
            state.documents.push(...payload.docs.sort((a, b) => {
                if (a.title && b.title) {
                    if (a.title > b.title) {
                        return 1;
                    }
                    if (a.title < b.title) {
                        return -1;
                    }
                    return 0;
                }
                return 0;
            }));
        }
    },
    [types.ADD_EXEC_DOC](state, docs: ExecutiveDocument[]) {
        if (docs && docs.length > 0) {
            state.documents.push(...docs);
        }
    },
    [types.EDIT_EXEC_DOC](state, doc: ExecutiveDocument) {
        if (doc) {
            const index = state.documents.findIndex((d) => d.id === doc.id);
            // Vue.set(state.documents, index, doc);
            const old = state.documents.splice(index, 1, doc);
            // console.log('old');
            // console.log(old);
            // console.log('new');
            // console.log(doc);
        }
    },
    [types.REMOVE_EXEC_DOC](state, doc: ExecutiveDocument) {
        if (doc) {
            const index = state.documents.findIndex((d) => d.id === doc.id);
            state.documents.splice(index, 1);
        }
    },
    [types.REMOVE_EXEC_DOC](state, doc: ExecutiveDocument) {
        if (doc) {
            const index = state.documents.findIndex((d) => d.id === doc.id);
            state.documents.splice(index, 1);
        }
    },
    [types.SET_SCAN_DATA](state, payload: { doc: ExecutiveDocument, file: FileData }) {
        if (payload.doc.barCode) {
            payload.doc.scanDate = payload.file.created;
            payload.doc.scanLink = payload.file.url;
            payload.doc.scanSize = payload.file.size;
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
