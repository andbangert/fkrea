<template>
  <div>
    <UploadFiles :config="siteSettings" :project="project"></UploadFiles>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { mapState, mapGetters, mapActions } from "vuex";
import { createNamespacedHelpers, ActionMethod } from "vuex";
import { Fkrea } from "@/constants";
import ProjectHeader from "./ProjectHeader.vue";
import SystemList from "@/components/docs/executive/SystemList.vue";
import ExecutiveDocsForm from "@/components/project/ExecutiveDocsForm.vue";
import UploadFiles from "@/components/docs/project/UploadFiles.vue";

import {
  ExecutiveDocument,
  ExecutiveDocsState,
  Project,
  ProjectSiteSettings,
  ArchiveSiteSettings
} from "@/types";
import store from "@/store/store";

@Component({
  components: {
    UploadFiles
  },
  computed: {
    ...mapState({
      siteSettings: siteSettings => store.state.projectSiteSettings,
      project: project => store.state.project
    })
  }
})
export default class ProjectDocsForm extends Vue {
  private siteSettings!: ProjectSiteSettings;
  private project!: Project;
}
</script>