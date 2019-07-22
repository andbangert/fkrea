<template>
  <div class="table">
    <div class="start">
      <h2>Всего по объекту</h2>
      <h2>Систем</h2>
      <h2>Документов</h2>
      <h2>Загружено</h2>
      <h2>Обязательных</h2>
      <h2>Замечаний</h2>
      <h2></h2>
    </div>
    <div class="start">
      <h2></h2>
      <h2>{{systemCount}}</h2>
      <h2>{{documentCount}}</h2>
      <h2>{{documentCountWithScan}}</h2>
      <h2>{{requiredDocumentCount}}&nbsp;из&nbsp;{{documentCount}}</h2>
      <h2>{{remarksCount}}</h2>
      <h2></h2>
    </div>

    <div class="one" v-for="(jobType, index) in project.jobTypes" :key="jobType.LookupId">
      <div class="title">
        <h2>{{index+1}}.&nbsp;{{ jobType.LookupValue }}</h2>
        <h2>{{docCount(jobType.LookupId)}}</h2>
        <h2>{{docsWithScanCount(jobType.LookupId)}}</h2>
        <h2>{{requiredCount(jobType.LookupId)}}&nbsp;из&nbsp;{{docCount(jobType.LookupId)}}</h2>
        <h2>{{docsRemarkedCount(jobType.LookupId)}}</h2>
        <h2>
          <span>
            <svg
              width="21"
              height="12"
              viewBox="0 0 21 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.3508 9.51476L19.4016 0.000488281L20.6498 1.17464L10.3518 12L0.0379648 1.17513L1.28524 0L10.3508 9.51476Z"
                fill="#5A6872"
              />
            </svg>
          </span>
        </h2>
      </div>
      <doc-list v-bind:docs="getDocsBySystemId(jobType.LookupId)" v-bind:jobType="jobType.LookupId"></doc-list>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import storeExec from "@/store/modules/executiveDocs/store";
import DocList from "./DocList.vue";
import { Prop } from "vue-property-decorator";
import {
  Project,
  ExecutiveDocument,
  ExecutiveDocsState,
  IndexedExecDocs,
  IndexedExecDocsTypes
} from "../../../types";
import { createNamespacedHelpers, Computed } from "vuex";

const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
  "executiveDocs"
);
const store = storeExec.state as ExecutiveDocsState;

@Component({
  components: {
    DocList
  },
  computed: {
    ...mapState({
      docs: docs => store.groupedDocs
    }),
    ...mapGetters([
      "documentCount",
      "requiredDocumentCount",
      "documentCountWithScan",
      "remarksCount"
    ])
  }
})
export default class SystemList extends Vue {
  @Prop()
  private project!: Project;
  private docs!: IndexedExecDocs;

  // Data
  private documentCount!: Computed;
  private requiredDocumentCount!: Computed;
  private documentCountWithScan!: Computed;
  private remarksCount!: Computed;

  // Getters/Setters
  get systemCount() {
    return this.project.jobTypes ? this.project.jobTypes.length : 0;
  }

  // Methods
  private getDocsBySystemId(systemId: number) {
    return this.docs[systemId];
  }
  private docCount(systemId: number) {
    const docs = this.docs[systemId];
    return docs ? docs.length : 0;
  }
  private requiredCount(systemId: number) {
    const docs = this.docs[systemId];
    if (docs) {
      const filter = docs.filter(doc => doc.required);
      return filter ? filter.length : 0;
    }
    return 0;
  }
  private docsWithScanCount(systemId: number) {
    const docs = this.docs[systemId];
    if (docs) {
      const filter = docs.filter(
        doc =>
          doc.scanLink !== undefined &&
          doc.scanLink !== null &&
          doc.scanLink !== ""
      );
      return filter ? filter.length : 0;
    }
    return 0;
  }
  private docsRemarkedCount(systemId: number) {
    const docs = this.docs[systemId];
    if (docs) {
      const filter = docs.filter(doc => doc.hasRemarks);
      return filter ? filter.length : 0;
    }
    return 0;
  }

  mounted() {}
}
</script>

