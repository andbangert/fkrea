<template>
  <div>
    <table class="fkr-table fkr-proj-docs">
      <thead>
        <tr class="header-row">
          <th></th>
          <th>Название файла</th>
          <th>Тип документа</th>
          <th>Примечание</th>
          <th>Версия</th>
          <th>Дата</th>
          <th>Размер</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <File v-for="item in files" :key="item.fileName" v-bind:file="item"></File>
      </tbody>
      <tfoot>
        <tr class="footer-row">
          <td colspan="4" class="description">
            <span>Строк на стр.</span>
            <select v-model="pageSize">
              <option>10</option>
              <option>20</option>
              <option>30</option>
              <option>50</option>
            </select>&nbsp;
            <span>| {{pagerStringRange}}</span>
          </td>
          <td colspan="2">
            <span>{{pagerStringCurrent}}</span>
          </td>
          <td colspan="2" class="fkr-pager-cell">
            <table class="fkr-pager">
              <tr>
                <td class="fkr-pager-btn">
                  <a href="#" @click="pagePrev">&lt;</a>
                </td>
                <td class="fkr-pager-size">
                  <select v-model="pageSize">
                    <option>10</option>
                    <option>20</option>
                    <option>30</option>
                    <option>50</option>
                  </select>
                </td>
                <td class="fkr-pager-btn">
                  <a href="#" @click="pageNext">&gt;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
<script lang="ts">
import utils from "@/utils";
import { AppOptions, StateFile, UploadMode, ProjectDocsState } from "@/types";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { createNamespacedHelpers } from "vuex";
import actionTypes from "@/store/action-types";
import store from "@/store/modules/projectDocs/store";
import File from "@/components/docs/project/File.vue";

const { mapActions, mapState, mapGetters } = createNamespacedHelpers(
  "projectDocs"
);
const state = store.state as ProjectDocsState;

@Component({
  components: {
    File
  },
  computed: {
    ...mapState({
      stateFiles: stateFiles => state.files,
      mode: mode => state.mode
    })
  }
})
export default class FileList extends Vue {
  private stateFiles!: StateFile[];
  private mode!: UploadMode;
  public pageNumber: number = 1;
  private pageSize: number = 10;

  private onsaveclick() {}

  private mount() {}

  get files(): StateFile[] {
    return this.paginate(this.pageSize, this.pageNumber);
  }
  get pagesCount() {
    if (this.stateFiles && this.stateFiles.length > 0) {
      const count = this.stateFiles.length / this.pageSize;
      return Math.ceil(count);
    }
    return 0;
  }

  get pagerStringRange() {
    if (this.stateFiles && this.stateFiles.length > 0) {
      const numEnd = this.pageNumber * this.pageSize;
      const numStart = numEnd - this.pageSize + 1;
      const len = this.stateFiles.length;
      return `${numStart} - ${numEnd} из ${len} строк`;
    }
    return "";
  }

  get pagerStringCurrent() {
    if (this.stateFiles && this.stateFiles.length > 0) {
      const count = Math.round(this.stateFiles.length / this.pageSize);
      return `${this.pageNumber} из ${this.pagesCount} стр.`;
    }
    return "";
  }

  private pageNext() {
    if (this.pagesCount >= this.pageNumber) {
      this.pageNumber++;
    }
  }
  private pagePrev() {
    if (this.pageNumber !== 1) {
      this.pageNumber--;
    }
  }
  private paginate(pageSize: number, pageNumber: number): StateFile[] {
    if (this.stateFiles && this.stateFiles.length > 0) {
      --pageNumber;
      return this.stateFiles.slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize
      );
    }
    return [];
  }
  @Watch('pageSize')
  private onPageSizeChanged(oldval: any, newval: any) {
    console.log('on changed page size.');
    this.pageNumber = 1;
  }
}
</script>
<style scoped>
.fkr-pager-size {
  padding-right: 1px !important;
}
.fkr-pager-btn {
  padding: 0px !important;
}
.fkr-pager-btn a {
  cursor: pointer;
  display: table-cell;
  height: 39px;
  width: 39px;
  text-align: center;
  vertical-align: middle;
}
.fkr-pager-btn a:hover {
  text-decoration: none !important;
}
.fkr-pager-cell {
  padding: 0px !important;
}
.description {
  padding-left: 14px !important;
}
</style>
