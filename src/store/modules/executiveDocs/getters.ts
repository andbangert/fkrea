import { GetterTree } from 'vuex';
import types from '@/store/mutation-types';
import {
    ExecutiveDocsState,
    ExecutiveDocument,
    RootState,
    IndexedExecDocs,
} from '@/types';

export const getrs: GetterTree<ExecutiveDocsState, RootState> = {
    groupedDocs(state): IndexedExecDocs {
        const jobTypeIds = new Array<number>();
        const grouped = state.documents.reduce((rv: IndexedExecDocs, x: ExecutiveDocument) => {
            let jobType = x.jobTypeId;
            if (!jobType) {
                jobType = 0;
            } else {
                jobTypeIds.push(jobType);
            }
            (rv[jobType] = rv[jobType] || []).push(x);
            return rv;
        }, {});
        return grouped;
    },
    documentCount(state, getters): number {
        let count = 0;
        if (getters.groupedDocs) {
            const keys: string[] = Object.keys(getters.groupedDocs);
            keys.forEach((key) => {
                // const index = Number.parseInt(key);
                // count += getters.groupedDocs[index].length;
                const index = Number.parseInt(key, undefined);
                const groupedDocs: IndexedExecDocs = getters.groupedDocs as IndexedExecDocs;
                const filter = groupedDocs[index].filter((doc) =>
                    (doc.barCode && doc.barCode !== ''));
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },
    documentCountWithScan(state, getters): number {
        let count = 0;
        if (getters.groupedDocs) {
            const keys: string[] = Object.keys(getters.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key, undefined);
                const groupedDocs: IndexedExecDocs = getters.groupedDocs as IndexedExecDocs;
                const filter = groupedDocs[index].filter((doc) =>
                    (doc.scanLink !== undefined && doc.scanLink !== null && doc.scanLink !== ''));
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },
    requiredDocumentCount(state, getters): number {
        let count = 0;
        if (getters.groupedDocs) {
            const keys: string[] = Object.keys(getters.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key, undefined);
                const groupedDocs: IndexedExecDocs = getters.groupedDocs as IndexedExecDocs;
                const filter = groupedDocs[index].filter((doc) => doc.required);
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },
    requiredDocumentWithBarcodeCount(state, getters): number {
        let count = 0;
        if (getters.groupedDocs) {
            const keys: string[] = Object.keys(getters.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key, undefined);
                const groupedDocs: IndexedExecDocs = getters.groupedDocs as IndexedExecDocs;
                const filter = groupedDocs[index].filter(
                    (doc) => (doc.required && doc.barCode && doc.barCode !== ''));
                if (filter) {
                    count += filter.length;
                }
            });
            return count;
        }
        return 0;
    },
    remarksCount(state, getters): number {
        let count = 0;
        if (getters.groupedDocs) {
            const keys: string[] = Object.keys(getters.groupedDocs);
            keys.forEach((key) => {
                const index = Number.parseInt(key);
                const groupedDocs: IndexedExecDocs = getters.groupedDocs as IndexedExecDocs;
                const filter = groupedDocs[index].filter((doc) => doc.hasRemarks);
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
