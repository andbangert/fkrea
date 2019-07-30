<template>
  <div class="wrapper_big">
    <header>
      <h1>
        Комплект исполнительной документации
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
    </header>
    <div class="wrapper" style="margin-left:60px">
      <div class="top">
        <h2>{{ buildObject.LookupValue }}</h2>
      </div>

      <div class="about">
        <div style="float: left; width: 490px">
          <h2 style="width: 140px; float: left;">Генподрядчик :</h2>
          <p style="width: 345px; float: left;">{{builder.LookupValue}}</p>
        </div>
        <div style="float: left; width: 490px">
          <h2 style="width: 90px; float: left;">Договор :</h2>
          <div style="width: 400px;float: left;margin-top: 16px;">
            <ul style="padding: 0;">
              <li v-for="item in contracts" :key="item.LookupId">
                <!-- <a href="#">{{item.LookupValue}}</a> -->
                <FieldLookupDisplay
                  :siteUrl="mainSiteUrl"
                  :listId="contractListId"
                  :value="item"
                ></FieldLookupDisplay>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <SystemList v-bind:project="project"></SystemList>
      <footer>
        <a href="#" class="print">Печать реестра</a>
        <form>
          <label
            :class="{ active: project.executiveDocsReadyToArchive }"
            @click="setReadyToArchive"
          >Подготовлен к передаче</label>
          <label
            :class="{ active: project.executiveDocsArchived }"
            @click="setArchived"
          >Принят в архив</label>
          <input
            type="checkbox"
            id="chkReadyToArchive"
            v-model="project.executiveDocsReadyToArchive"
          />
          <input type="checkbox" id="chkArchived" v-model="project.executiveDocsArchived" />
          <span>{{archiveReadyDate}}</span>
        </form>
        <div class="clearfix"></div>
      </footer>
    </div>
    <div class="clearfix"></div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ProjectHeader from "./ProjectHeader.vue";
import SystemList from "@/components/docs/executive/SystemList.vue";
import { createNamespacedHelpers, ActionMethod } from "vuex";
import {
  ExecutiveDocument,
  ExecutiveDocsState,
  Project,
  ProjectSiteSettings,
  ArchiveSiteSettings
} from "../../types";
import { mapState, mapGetters, mapActions } from "vuex";
import store from "@/store/store";
import { get } from "http";
import FieldLookupDisplay from "../forms/FieldLookupDisplay.vue";

@Component({
  components: {
    SystemList,
    FieldLookupDisplay
  },
  computed: {
    ...mapState({
      project: project => store.state.project,
      siteSettings: siteSettings => store.state.projectSiteSettings,
      archiveSettings: archiveSettings => store.state.archiveSiteSettings
    })
  },
  methods: {
    ...mapActions(["setExecDocArchived", "setExecDocReadyToArchive"])
  }
})
export default class ProjectExcecutiveDocsForm extends Vue {
  private project!: Project;
  private setExecDocArchived!: ActionMethod;
  private setExecDocReadyToArchive!: ActionMethod;
  private siteSettings!: ProjectSiteSettings;
  private archiveSettings!: ArchiveSiteSettings;

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

  get archiveReadyDate() {
    if (this.project && this.project.executiveDocsReadyToArchiveDate) {
      const date = this.project.executiveDocsReadyToArchiveDate;
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${day < 10 ? "0" + day : day}.${
        month < 10 ? "0" + month : month
      }.${date.getFullYear()}`;
    }
    return "";
  }

  get linkEditProject() {
    if (this.siteSettings) {
      return `${this.siteSettings.siteUrl}/SitePages/ProjectCardPage.aspx?pid=${this.project.id}`;
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
    if (
      this.project &&
      this.project.contracts &&
      this.project.contracts.length
    ) {
      return this.project.contracts;
    }
    return [];
  }

  get builder() {
    if (this.project && this.project.builder && this.project.builder.length) {
      return this.project.builder[0];
    }
    return [];
  }

  get archived() {
    return this.project.executiveDocsArchived;
  }

  @Watch("archived")
  onArchiveChanged(newVal: boolean, oldVal: boolean) {
    this.setExecDocArchived({
      archived: newVal
    });
  }

  get archiveReady() {
    return this.project.executiveDocsReadyToArchive;
  }

  @Watch("archiveReady")
  onArchiveReady(newVal: boolean, oldVal: boolean) {
    this.setExecDocReadyToArchive({
      archived: newVal
    });
  }

  private mounted() {}

  private setReadyToArchive(event: Event) {
    const ele: HTMLElement = document.getElementById(
      "chkReadyToArchive"
    ) as HTMLElement;
    if (ele) {
      ele.click();
    }
  }

  private setArchived() {
    const ele: HTMLElement = document.getElementById(
      "chkArchived"
    ) as HTMLElement;
    if (ele) {
      ele.click();
    }
  }
  private contractUrl(id: number) {
    //this.
  }
}
</script>
