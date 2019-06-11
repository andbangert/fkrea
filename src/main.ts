import Vue from 'vue';
// import { Fkrea } from './project';
import { ProjectCardSettings, FormMode, } from './types';
import ProjectForm from './components/project/ProjectForm.vue';
import ProjectSearch from './components/project/ProjectSearch.vue';
import { ProjectFieldInitializer } from '@/projectCardInitializer';
import "@/scss/v-select.css";
import "@/scss/form.css";


Vue.config.productionTip = false;

interface ProjectMainSettings {
  siteUrl: string;
  listId: string;
  itemId: number;
  mode: FormMode;
}

// Custom
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
          siteUrl: siteUrl,
          buildObjectList: buildAddrListId,
          projectList: projectListId,
          contractorList: contractorListId,
        },
      }),
    }).$mount('#app');
    // ========================
}


// Normal way to render form
// export let projectCardSettings: ProjectCardSettings;
// export function ConfigureProjectCard(settings: ProjectCardSettings) {
//   // TODO: Check props here
//   projectCardSettings = settings;
// }

// export function InitProjectNewForm(formCtx: SPClientTemplates.RenderContext_Form, settings: ProjectCardSettings) {
//   if (!formCtx || !formCtx.ListSchema) {
//     return;
//   }
//   SP.SOD.executeOrDelayUntilScriptLoaded(() => {
//     try {
//       const projectForm = new Fkrea.ProjectForm(formCtx, settings);
//     } catch (e) {
//       console.log(e);
//     }
//   }, 'sp.js');
// }

(function () {
  RegisterModuleInit('app.js', () => {
    // Initialize properties here
  });
  NotifyScriptLoadedAndExecuteWaitingJobs('app.js');
});

// {
//   contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616',
//   contractorListId: '{C79A969E-A687-40C1-8015-F176F18B2337}', // Main site
//   designerListId: '{080CBB6C-C2D3-4A85-BEA6-FE7A82B91103}', // Project Site 
//   docListId: '{1C2C050F-4E47-448F-9E48-5C25643939F8}', // Main site
//   siteUrl: '/',
//   scanLib: '{70E129BD-68AC-4B61-8242-133D6EB48C3E}',
//   executiveLib: '{8CE27767-7234-43C9-A78E-C81F3B042B49}',
// };



// TEST SERVER
// <script type='text/javascript' >
//   document.write('<div id="app"></div>');

// if (SP && SP.SOD) {
//   SP.SOD.executeFunc('app.js', null, function () {
//     try {
//       fkrea.InitializeProjectSearch('/sites/documentation', '{faefac83-f507-48ed-89bc-f2a62d338bfe}', '{D0A9D56C-4D8A-43B1-9D0A-CEB123EC9B54}', '{080CBB6C-C2D3-4A85-BEA6-FE7A82B91103}');
//     } catch (e) {
//       console.error(e);
//     }
//   });
// }
// </script>




// PRODUCTION SERVER
// <script type='text/javascript' >
//   document.write('<div id="app"></div>');

// if (SP && SP.SOD) {
//   SP.SOD.executeFunc('app.js', null, function () {
//     try {
//       var projectId = Number(GetUrlKeyValue('pid'));
//       var mode = 0;
//       if (projectId && !isNaN(projectId)) {
//         mode = 1;
//       }
//       var mainSettings =
//       {
//         siteUrl: '/sites/documentation',
//         listId: '{C3C9E598-C6F1-49EF-881B-DFA95013DF73}',
//         itemId: projectId && !isNaN(projectId) ? projectId : -1,
//         mode: mode,
//       };

//       var pcSettings =
//       {
//         siteUrl: '/',
//         contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616', // Main site
//         contractorListId: '{0d2d2424-dee8-48d4-8bc2-a70a88b31956}', // Main site
//         docListId: '{4d45929a-e485-44e7-9d45-69a3f7fe711c}', // Main site
//         BuildingsListId: '{91d722bb-ea2c-4821-b90b-fd834b0e69b8}', // Main site
//         scanLib: '{f966ae2c-75f9-4e64-b37a-c5c2b9e408c8}',
//         executiveLib: '{47367CDD-BF16-4604-91B5-85A5446D39B4}', // Project Site
//         designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
//       };

//       fkrea.InitializeProjectCardPage(mainSettings, pcSettings);
//     } catch (e) {
//       console.error(e);
//     }
//   });
// }
// </script>
