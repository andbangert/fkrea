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
      <h2>{{requiredDocumentWithBarcodeCount}}&nbsp;из&nbsp;{{requiredDocumentCount}}</h2>
      <h2>{{remarksCount}}</h2>
      <h2></h2>
    </div>
    <div class="one" v-for="(jobType, index) in project.jobTypes" :key="jobType.LookupId">
      <div class="title" @click="showClick(index)" :class="active(index)">
        <h2>{{ jobType.LookupValue }}</h2>
        <h2>{{docCount(jobType.LookupId)}}</h2>
        <h2>{{docsWithScanCount(jobType.LookupId)}}</h2>
        <h2>{{requiredCountWithBarcode(jobType.LookupId)}}&nbsp;из&nbsp;{{requiredCount(jobType.LookupId)}}</h2>
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
      <transition name="slide">
        <doc-list v-if="show(index)" v-bind:jobTypeId="jobType.LookupId"></doc-list>
      </transition>
      <!-- v-bind:docs="getDocsBySystemId(jobType.LookupId)" -->
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
    // ...mapState({
    //   docs: docs => store.groupedDocs
    // }),
    ...mapGetters([
      "documentCount",
      "requiredDocumentCount",
      "documentCountWithScan",
      "remarksCount",
      "groupedDocs",
      "requiredDocumentWithBarcodeCount"
    ])
  }
})
export default class SystemList extends Vue {
  @Prop()
  private project!: Project;

  // Data
  private groupedDocs!: IndexedExecDocs;
  private showMenu: { active: boolean }[] = [];
  private documentCount!: Computed;
  private requiredDocumentCount!: Computed;
  private documentCountWithScan!: Computed;
  private remarksCount!: Computed;
  private requiredDocumentWithBarcodeCount!: Computed;

  // Getters/Setters
  get systemCount() {
    return this.project.jobTypes ? this.project.jobTypes.length : 0;
  }
  get docs() {
    return this.groupedDocs;
  }

  // Methods
  private active(index: number) {
    const flag = this.showMenu[index];
    return flag;
  }
  private show(index: number) {
    const flag = this.showMenu[index];
    return flag.active;
  }
  private showClick(index: number) {
    const flag = this.showMenu[index];
    if (flag) {
      flag.active = !flag.active;
    }
  }
  private getDocsBySystemId(systemId: number) {
    return this.docs[systemId];
  }
  private docCount(systemId: number) {
    const docs = this.docs[systemId];
    //return docs ? docs.length : 0;
    if (docs) {
      const filter = docs.filter(
        doc => doc.barCode && doc.barCode !== ""
      );
      return filter ? filter.length : 0;
    }
  }
  private requiredCountWithBarcode(systemId: number) {
    const docs = this.docs[systemId];
    if (docs) {
      const filter = docs.filter(
        doc => doc.barCode && doc.barCode !== "" && doc.required
      );
      return filter ? filter.length : 0;
    }
    return 0;
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

  // Hooks
  created() {
    if (this.project.jobTypes) {
      // this.showMenu.length = this.project.jobTypes.length;
      let k = 0;
      this.project.jobTypes.forEach(jt => {
        Vue.set(this.showMenu, k, { active: false });
        k++;
      });
    }
  }
  mounted() {
  }
}
</script>

<style>
.slide-enter-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: ease-in;
  -webkit-transition-timing-function: ease-in;
  -o-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
  /* display: block; */
}

.slide-leave-active {
  -moz-transition-duration: 0.3s;
  -webkit-transition-duration: 0.3s;
  -o-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  /* display: none; */
}

.slide-enter-to,
.slide-leave {
  max-height: 100px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}
</style>
