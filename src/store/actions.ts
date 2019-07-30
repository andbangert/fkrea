import { ActionTree } from 'vuex';
import {
    RootState,
    Project,
    ProjectSiteSettings,
    ArchiveSiteSettings,
    StorageAddressSettings,
    FieldValueCollection,
} from '@/types';

import * as util from '@/utilities';
import { FieldNames } from '@/constants';
import types from './action-types';
import mutations from './mutation-types';

export const actions: ActionTree<RootState, RootState> = {
    async [types.INIT_STATE]({ commit, dispatch, state }, payload: {
        projectSiteSettings: ProjectSiteSettings,
        archiveSiteSettings: ArchiveSiteSettings,
        storageSettings: StorageAddressSettings,
    }) {
        commit(mutations.CONFIGURE_APP, {
            projectSiteSettings: payload.projectSiteSettings,
            archiveSiteSettings: payload.archiveSiteSettings,
            storageSettings: payload.storageSettings,
        });
    },
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
        const jobTypesLv = fldValues[FieldNames.FieldTypeOfJobs] as SP.FieldLookupValue[];
        const executiveDocsArchived = fldValues[FieldNames.FieldExecutiveDocsReadyToArchive] as boolean;
        const executiveDocsReadyToArchive = fldValues[FieldNames.FieldExecutiveDocsArchived] as boolean;
        const executiveDocsArchivedDate = fldValues[FieldNames.FieldExecutiveDocsArchivedDate] as Date;
        const executiveDocsReadyToArchiveDate = fldValues[FieldNames.FieldExecutiveDocsReadyToArchiveDate] as Date;
        const project: Project = {
            id,
            title,
            contracts,
            executiveDocsArchived,
            executiveDocsReadyToArchive,
            executiveDocsArchivedDate,
            executiveDocsReadyToArchiveDate,
        };
        if (boLv) {
            const boArr = util.convertToSelectLookup(boLv);
            if (boArr && boArr.length > 0) {
                project.buildObject = boArr;// = boArr[0];
            }
        }
        if (bldrLv) {
            const builder = util.convertToSelectLookup(bldrLv);
            if (bldrLv && bldrLv.length > 0) {
                project.builder = builder;
            }
        }
        if (jobTypesLv) {
            const jobTypes = [{ LookupId: 0, LookupValue: 'Общие документы' }];
            const jtC = util.convertToSelectLookup(jobTypesLv);
            if (jtC && jtC.length > 0) {
                jobTypes.push(...jtC);
            }
            project.jobTypes = jobTypes;
        }
        commit(mutations.SET_PROJECT, project);
    },
    async [types.SET_EXEC_DOCS_ARCHIVED]({ commit, dispatch, state }, payload: {
        archived: boolean,
    }) {
        if (!state.projectSiteSettings || !state.projectSiteSettings.siteUrl) {
            throw new Error();
        }
        if (!state.projectSiteSettings || !state.projectSiteSettings.projectListId) {
            throw new Error();
        }
        if (!state.project) {
            throw new Error('Project should be set before.');
        }

        const date = payload.archived ? new Date() : null;
        const values: FieldValueCollection = {
            [FieldNames.FieldExecutiveDocsArchived]: payload.archived,
            [FieldNames.FieldExecutiveDocsArchivedDate]: date ? util.dateToFormString(date) : '',
        };
        await util.createOrUpdateItem(
            state.projectSiteSettings.siteUrl,
            state.projectSiteSettings.projectListId,
            state.project.id,
            values);
        commit(mutations.SET_EXEC_DOCS_ARCHIVED, {
            archived: payload.archived,
            date: date
        })

    },
    async [types.SET_EXEC_DOCS_ARCHIVE_READY]({ commit, dispatch, state }, payload: {
        archived: boolean,
    }) {
        if (!state.projectSiteSettings || !state.projectSiteSettings.siteUrl) {
            throw Error();
        }
        if (!state.projectSiteSettings || !state.projectSiteSettings.projectListId) {
            throw Error();
        }
        if (!state.project) {
            throw new Error('Project should be set before.');
        }

        const date = payload.archived ? new Date() : null;
        const values: FieldValueCollection = {
            [FieldNames.FieldExecutiveDocsReadyToArchive]: payload.archived,
            [FieldNames.FieldExecutiveDocsReadyToArchiveDate]: date ? util.dateToFormString(date) : '',
        };

        await util.createOrUpdateItem(
            state.projectSiteSettings.siteUrl,
            state.projectSiteSettings.projectListId,
            state.project.id, values);

        commit(mutations.SET_EXEC_DOCS_ARCHIVE_READY, {
            archived: payload.archived,
            date: date,
        })
    },
};
