import { ActionTree } from 'vuex';
import { RootState, Project } from '@/types';
import * as util from '@/utilities';
import { FieldNames } from '@/constants';
import types from './action-types';
import mutations from './mutation-types';

export const actions: ActionTree<RootState, RootState> = {
    async [types.LOAD_PROJECT]({ commit, dispatch, state }, payload: {
        siteUrl: string,
        listId: string,
        itemId: number
    }) {
        // Set Project To State
        const item = await util.getItemById(payload.siteUrl, payload.listId, payload.itemId);
        // Convert to project
        if (!item) {
            throw Error(`Item not found. Item id ${payload.itemId}.`);
        }
        const fldValues = item.get_fieldValues();
        if (!fldValues) {
            throw new Error('Field values was not initialized.');
        }

        const id = item.get_id();
        const title = fldValues[FieldNames.FieldTitle] as string;
        const contrStr = fldValues[FieldNames.FieldContracts] as string;
        const contracts = util.parseMultiLookupValue(contrStr);
        const boLv = fldValues[FieldNames.FieldBuildObj] as SP.FieldLookupValue[];
        const bldrLv = fldValues[FieldNames.FieldContractor] as SP.FieldLookupValue[];
        const project: Project = {
            id,
            title,
            contracts,
        };
        if(boLv) {
            console.log('Bolv ');
            console.log(boLv);
            const boArr = util.convertToSelectLookup(boLv);
            if(boArr && boArr.length > 0) {
                project.buildObject = boArr[0];
            }
        }
        if(bldrLv) {
            console.log('Bldr ');
            console.log(bldrLv);
            const builder = util.convertToSelectLookup(bldrLv);
            if(bldrLv && bldrLv.length > 0) {
                project.builder = builder;
            }
        }
        commit(mutations.SET_PROJECT, project);
    },
}
