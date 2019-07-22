import { GetterTree } from 'vuex';
import {
    RootState,
} from '../types';

export const getters: GetterTree<RootState, RootState> = {
    getProjectBuildObject: (state) => {
        // TODO: Build link here.
        if (state.project) {
            const arr = state.project.buildObject;
            if (arr && arr.length > 0) {
                arr[0].LookupValue;
            }
        }
        return '';
    },
    getProjectBuilder: (state) => {
    },
    getProjectContracts: (state) => {
    }
};
