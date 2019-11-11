<template>
    <div class="wrapper">
      <SystemList v-bind:project="project"></SystemList>
      <footer>
        <a href="#" class="print" @click="onPrintReport">Печать реестра</a>
        <a
          class="print"
          rel="noopener"
          target="_blank"
          style="margin-left: 10px"
          @click="download"
        >Скачать файлы</a>
        <!-- :href="downloadLink" -->
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
import { showPrintReportDialog, showDownloadDialog } from "./inline";

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
export default class ExecutiveDocsForm extends Vue {
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

  get downloadLink() {
    return `${this.siteSettings.siteUrl}/_layouts/15/fkr/DownloadExecFiles.ashx?pid=${this.project.id}&plistid=${this.siteSettings.projectListId}&elibid=${this.siteSettings.executiveDocCardsListId}`;
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
  private contractUrl(id: number) {}
  private onPrintReport() {
    // const self = this;
    showPrintReportDialog(this.project.id);
  }
  private download() {
    showDownloadDialog(this.downloadLink, this.project.title + ".zip");
  }
}
</script>
