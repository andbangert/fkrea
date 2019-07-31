import Vue from 'vue';
import {
  ProjectCardSettings,
  ProjectMainSettings,
  RootState,
  ProjectSiteSettings,
  ArchiveSiteSettings,
  StorageAddressSettings,
  ExecutiveDocument,
  FieldValueCollection,
} from './types';
import { ProjectFieldInitializer } from '@/projectCardInitializer';
import ProjectForm from './components/project/ProjectForm.vue';
import ProjectSearch from './components/project/ProjectSearch.vue';
import ProjectExcecutiveDocsForm from './components/project/ProjectExcecutiveDocsForm.vue';
import actions from '@/store/action-types';
import store from './store/store';
import axios from 'axios';
import '@/scss/v-select.css';
import '@/scss/form.css';
import '@/scss/executive.css';
import { getStorageAddress, initializeExecutiveDocs } from './docHelper';
import { createOrUpdateItem, dateToFormString } from './utilities';
import { FieldNames } from './constants';

Vue.config.productionTip = false;

export async function InitializeProjectExecutiveDocs(
  projSiteSettings?: ProjectSiteSettings,
  archSiteSettings?: ArchiveSiteSettings,
  storageSettings?: StorageAddressSettings) {

  const pidStr = GetUrlKeyValue('pid');
  if (!pidStr && pidStr === '') {
    throw Error('Project id must be set as get parameter.');
  }

  const projectId: number = Number(pidStr);
  if (isNaN(projectId)) {
    throw Error('Project id must be a number.');
  }
  // Storage Address API
  if (!storageSettings) {
    storageSettings = {
      url: 'http://5.200.53.136/classes/workBase.php',
      userId: '4C54FB6E-7D7B-49B1-9E8C-7D560BB630AE',
    };
  }
  // Archive site
  if (!archSiteSettings) {
    archSiteSettings = {
      siteUrl: 'http://vm-arch/',
      docListId: '',
      scanDocLibListId: '',
    };
  }
  // Project Site
  if (!projSiteSettings) {
    projSiteSettings = {
      siteUrl: 'http://vm-arch/sites/documentation',
      buildingsListId: 'faefac83-f507-48ed-89bc-f2a62d338bfe',
      contractorsListId: '080cbb6c-c2d3-4a85-bea6-fe7a82b91103',
      executiveDocLibListId: '8ce27767-7234-43c9-a78e-c81f3b042b49',
      executiveDocCardsListId: 'e7fbd4fb-ed60-475f-9f2d-dc0bfa7a021c',
      projectListId: 'd0a9d56c-4d8a-43b1-9d0a-ceb123ec9b54',
      typesOfJobsListId: 'ea94fe6e-fdb0-4609-93bf-f5d752e9c400',
      executiveDocTypesListId: '6647f002-47e0-4e8f-a2c0-d0bc8dfe2ab4',
    };
  }

  //createItemTest(projSiteSettings);
  window.localStorage.removeItem('store_' + projectId);
  store.subscribe((mutation, state: RootState) => {
    // Remove an old
    window.localStorage.setItem('store_' + projectId, JSON.stringify(state));
  });

  await store.dispatch(actions.INIT_STATE, {
    projectSiteSettings: projSiteSettings,
    archiveSiteSettings: archSiteSettings,
    storageSettings: storageSettings,
  });

  await store.dispatch(actions.LOAD_PROJECT, {
    siteUrl: projSiteSettings.siteUrl,
    listId: projSiteSettings.projectListId,
    itemId: projectId,
  });

  await store.dispatch('executiveDocs/' + actions.LOAD_EXEC_DOCS, {
    siteUrl: projSiteSettings.siteUrl,
    listId: projSiteSettings.executiveDocLibListId,
    itemId: projectId,
  });

  const v1 = new Vue({
    components: { ProjectExcecutiveDocsForm },
    render: (h) => h(ProjectExcecutiveDocsForm, {
      props: {
        projectId: projectId
      }
    }),
    store,
  }).$mount('#app');
}

export function InitializeProjectViewCardPage() {
}

export async function InitializeProjectCardPage(mainSettings: ProjectMainSettings,
  projectCardSettings: ProjectCardSettings) {
  const payload = mainSettings;
  //  = {
  //   siteUrl: '/sites/documentation',
  //   listId: '{D0A9D56C-4D8A-43B1-9D0A-CEB123EC9B54}',
  //   itemId: -1,
  // mode: 0
  // };

  const fields = await ProjectFieldInitializer.InitializeFields(payload,
    ['BuildObj',
      'Title',
      'Path',
      'Designer',
      'DesignerContracts',
      'Contractor',
      'Contracts',
      'TypeOfJobs']);

  const pcSettings = projectCardSettings;

  // TEST
  // {
  //   siteUrl: '/', // Main site
  //   contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616', // Main site
  //   contractorListId: '{c79a969e-a687-40c1-8015-f176f18b2337}', // Main site
  //   docListId: '{1c2c050f-4e47-448f-9e48-5c25643939f8}', // Main site
  //   BuildingsListId: '{94833f97-7310-4e99-954d-68b471ecd082}', // Main site
  //   scanLib: '{70e129bd-68ac-4b61-8242-133d6eb48c3e}',
  //   executiveLib: '{8CE27767-7234-43C9-A78E-C81F3B042B49}', // Project Site
  //   designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
  // };

  // PROD
  // {
  //   siteUrl: '/',
  //   contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616', // Main site
  //   contractorListId: '{0d2d2424-dee8-48d4-8bc2-a70a88b31956}', // Main site
  //   docListId: '{4d45929a-e485-44e7-9d45-69a3f7fe711c}', // Main site
  //   BuildingsListId: '{91d722bb-ea2c-4821-b90b-fd834b0e69b8}', // Main site
  //   scanLib: '{f966ae2c-75f9-4e64-b37a-c5c2b9e408c8}',
  //   executiveLib: '{47367CDD-BF16-4604-91B5-85A5446D39B4}', // Project Site
  //   designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
  // };


  const options = await ProjectFieldInitializer.InitializeFieldOptions(payload, fields, projectCardSettings);
  // Initialize State
  const v1 = new Vue({
    el: '#app',
    components: {
      ProjectForm,
    },
    render: (h) => h(ProjectForm, {
      props: {
        fields,
        settings: projectCardSettings,
        options,
        siteUrl: payload.siteUrl,
        listId: payload.listId,
        itemId: payload.itemId,
        mode: payload.mode,
        scanLibId: projectCardSettings.scanLib,
        executiveDocCardListId: projectCardSettings.executiveDocCardListId,
        executiveDocTypeListId: projectCardSettings.executiveDocTypeListId,
      },
    }),
  }).$mount('#app');
  // ========================
}

export function InitializeProjectSearch(siteUrl: string, buildAddrListId: string, projectListId: string, contractorListId: string) {
  // Initialize State
  const v1 = new Vue({
    el: '#app',
    components: {
      ProjectSearch,
    },
    render: (h) => h(ProjectSearch, {
      props: {
        siteUrl,
        buildObjectList: buildAddrListId,
        projectList: projectListId,
        contractorList: contractorListId,
      },
    }),
  }).$mount('#app');
  // ========================
}

(function () {
  RegisterModuleInit('app.js', () => {
    // Initialize properties here
  });
  NotifyScriptLoadedAndExecuteWaitingJobs('app.js');
});
