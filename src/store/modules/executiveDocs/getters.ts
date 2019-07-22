import { GetterTree } from 'vuex';
import types from '@/store/mutation-types';
import { ExecutiveDocsState, ExecutiveDocument, RootState } from '@/types';

export const getters: GetterTree<ExecutiveDocsState, RootState> = {
    documentCount(state): number {
        let count = 0;
        if (state.groupedDocs) {
            const keys: string[] = Object.keys(state.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key);
                count += state.groupedDocs[index].length;
            });
            return count;
        }
        return 0;
    },
    documentCountWithScan(state): number {
        let count = 0;

        if (state.groupedDocs) {
            const keys: string[] = Object.keys(state.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key);
                const filter = state.groupedDocs[index].filter((doc) =>
                    (doc.scanLink !== undefined && doc.scanLink !== null && doc.scanLink !== ''))
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },
    requiredDocumentCount(state): number {
        let count = 0;
        if (state.groupedDocs) {
            const keys: string[] = Object.keys(state.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key);
                const filter = state.groupedDocs[index].filter((doc) => doc.required);
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },
    remarksCount(state): number {
        let count = 0;
        if (state.groupedDocs) {
            const keys: string[] = Object.keys(state.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key);
                const filter = state.groupedDocs[index].filter((doc) => doc.hasRemarks);
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },

    // commonDocuments(state): ExecutiveDocument[] {
    //     return state.documents.filter((doc) => doc.jobTypeId === undefined || doc.jobTypeId === null);
    // },
    // commonDocumentCount(state, getters): number {
    //     const documents: ExecutiveDocument[] = getters.commonDocuments;
    //     return documents.length;
    // },
    // documentsWithScan(state): ExecutiveDocument[] {
    //     const docs = state.documents.filter((doc) => !doc.scanLink);
    //     return docs;
    // },
    // documentsWithScanCount(state, getters): number {
    //     const documentsWithScan: ExecutiveDocument[] = getters.documentsWithScan;
    //     return documentsWithScan.length;
    // },
    // documentsWithRemarks(state): ExecutiveDocument[] {
    //     const docs: ExecutiveDocument[] = state.documents.filter((doc) => doc.hasRemarks);
    //     return docs;
    // },
    // documentsWithRemarksCount(state, getters): number {
    //     const docs: ExecutiveDocument[] = getters.documentsWithRemarks;
    //     return docs.length;
    // },
};
