<template>
  <div class="wrapper_big">
    <!-- Комплект исполнительной документации -->
    <!-- <header>
      <h1>
          <a :href="linkEditProject" target="_blank">
            <span>
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0 19.8099L19.7496 0.583966C20.5756 -0.220138 21.8506 -0.190297 22.6425 0.651673L27.474 5.78849C28.318 6.68577 28.2863 8.15061 27.4044 9.0057L7.72572 28.087H0V19.8099ZM2.09269 20.7894V25.862H6.91475L21.4086 11.8082L16.5819 6.68435L2.09269 20.7894ZM18.1269 5.18033L22.9565 10.3073L25.9943 7.36176L21.1628 2.22494L18.1269 5.18033Z"
                  fill="#6D6D6D"
                />
                <path d="M0 34V31.0435H34V34H0Z" fill="#6D6D6D" />
              </svg>
            </span>
          </a>
      </h1>
      <div class="tabs">
        <span class="active">Исполнительная</span>
        <a href="#">Проектная</a>
      </div>
      <div class="clearfix"></div>
    </header>-->
    <div class="wrapper">
      <div class="top">
        <h2>
          <span>{{ buildObject.LookupValue }}</span>
          <span class="fkr-commands" style="margin-left:8px;">
            <a class="fkr-edit" :href="linkEditProject" target="_blank"></a>
          </span>
        </h2>
      </div>
      <div class="about">
        <div style="float: left; width: 490px">
          <h2 style="width: 150px; float: left;">{{builderLabel}} :</h2>
          <p style="width: 335px; float: left;">{{builder.LookupValue}}</p>
        </div>
        <div style="float: left; width: 490px">
          <h2 style="width: 90px; float: left;">Договор :</h2>
          <div style="width: 400px;float: left;margin-top: 16px;">
            <ul style="padding: 0;">
              <li v-for="item in contracts" :key="item.LookupId">
                <!-- <a href="#">{{item.LookupValue}}</a> -->
                <FieldLookupDisplay :siteUrl="mainSiteUrl" :listId="contractListId" :value="item"></FieldLookupDisplay>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <br />
      <div class="fkr-action-pane">
        <div class="fkr-group-justified" style="width: 432px; float: right">
          <div class="fkr-btn-group">
            <button
              type="button"
              class="fkr-btn fkr-btn-primary"
              @click="componentName = 'project'"
              :class="{active:isProjectActive}"
            >Проектная документация</button>
            <button
              type="button"
              class="fkr-btn fkr-btn-primary"
              @click="componentName = 'executive'"
              :class="{active:!isProjectActive}"
            >Исполнительная документация</button>
          </div>
        </div>
      </div>
      <br />
      <component :is="activeComponent"></component>
    </div>
    <div class="clearfix"></div>
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
import FieldLookupDisplay from "../forms/FieldLookupDisplay.vue";
import ProjectDocsForm from "@/components/project/ProjectDocsForm.vue";
import { showPrintReportDialog, showDownloadDialog } from "./inline";
import {
  ExecutiveDocument,
  ExecutiveDocsState,
  Project,
  ProjectSiteSettings,
  ArchiveSiteSettings
} from "@/types";
import store from "@/store/store";
import { get } from "http";

@Component({
  components: {
    SystemList,
    FieldLookupDisplay,
    ExecutiveDocsForm,
    ProjectDocsForm
  },
  computed: {
    ...mapState({
      project: project => store.state.project,
      siteSettings: siteSettings => store.state.projectSiteSettings,
      archiveSettings: archiveSettings => store.state.archiveSiteSettings
    })
  }
})
export default class ProjectViewForm extends Vue {
  private project!: Project;
  private siteSettings!: ProjectSiteSettings;
  private archiveSettings!: ArchiveSiteSettings;
  private componentName: string = "Project";

  get isProjectActive() {
    return this.componentName.toLowerCase() === "project";
  }
  get activeComponent() {
    return this.componentName.toLowerCase() + "-docs-form";
  }
  get builderLabel() {
    return this.isProjectActive ? "Проектировщик" : "Генподрядчик";
  }
  get mainSiteUrl() {
    if (this.archiveSettings) {
      return this.archiveSettings.siteUrl;
    }
    return "";
  }
  get contractListId() {
    if (this.archiveSettings) {
      return this.archiveSettings.docListId;
    }
    return "";
  }
  get linkEditProject() {
    if (this.siteSettings) {
      return `${this.siteSettings.siteUrl}/_layouts/15/listform.aspx?PageType=6&ListId=${this.siteSettings.projectListId}&ID=${this.project.id}&RootFolder=*`;
    }
    return "";
  }
  get buildObject() {
    if (
      this.project &&
      this.project.buildObject &&
      this.project.buildObject.length
    ) {
      return this.project.buildObject[0];
    }
    return [];
  }
  get contracts() {
    if (this.componentName.toLowerCase() === "project") {
      return this.designerContracts;
    } else {
      if (
        this.project &&
        this.project.contracts &&
        this.project.contracts.length
      ) {
        return this.project.contracts;
      }
      return [];
    }
    return [];
  }
  get builder() {
    if (this.componentName.toLowerCase() === "project") {
      return this.designer;
    } else {
      if (
        this.project &&
        this.project.builder &&
        this.project.builder.length > 0
      ) {
        return this.project.builder[0];
      }
      return [];
    }
    return [];
  }
  get designer() {
    if (
      this.project &&
      this.project.designer &&
      this.project.designer.length > 0
    ) {
      return this.project.designer[0];
    }
    return [];
  }
  get designerContracts() {
    if (
      this.project &&
      this.project.designerContracts &&
      this.project.designerContracts.length > 0
    ) {
      return this.project.designerContracts[0];
    }
    return [];
  }
  private mounted() {}
}
</script>
