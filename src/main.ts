import Vue from 'vue';
import { ProjectCardSettings, ProjectMainSettings } from './types';
import ProjectForm from './components/project/ProjectForm.vue';
import ProjectSearch from './components/project/ProjectSearch.vue';
import ProjectExcecutiveDocsForm from './components/project/ProjectExcecutiveDocsForm.vue';
import { ProjectFieldInitializer } from '@/projectCardInitializer';
import '@/scss/v-select.css';
import '@/scss/form.css';

Vue.config.productionTip = false;

export function InitializeProjectExecutiveDocs(settings: ProjectMainSettings, cardSettings: ProjectCardSettings) {
  const v1 = new Vue({
    components: { ProjectExcecutiveDocsForm },
    render: (h) => h(ProjectExcecutiveDocsForm)
  }).$mount('#app');
}

export function InitializeProjectViewCardPage() {
}

export async function InitializeProjectCardPage(mainSettings: ProjectMainSettings, projectCardSettings: ProjectCardSettings) {
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
