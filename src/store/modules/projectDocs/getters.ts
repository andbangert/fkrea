import { GetterTree } from 'vuex';
import {
    ProjectDocsState, RootState, StateFile,
} from '@/types';

export const getters: GetterTree<ProjectDocsState, RootState> = {
    getUnsavedFiles(state): Array<StateFile> {
        return state.files.filter((f) => !f.saved);
    },
    unsavedFilesCount(state, getters) {
        const unsaved = getters.getUnsavedFiles as StateFile[];
        if(unsaved) {
            return unsaved.length;
        }
    },
    changedFiles(state): Array<StateFile> {
        return state.files.filter((f) => f.changed);
    },
    hasUnsavedFiles(state, getrs): boolean {
        const files = getrs.unsavedFiles; // as Array<StateFile>;
        return files && files.length > 0;
    },
    filesCount(state, getrs): number {
        if (state.files) {
            return state.files.length;
        }
        return 0;
    },
};
