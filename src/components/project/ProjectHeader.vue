<template>
  <div class="db-container">
    <div class="db-row">
      <div class="db-col-12">
        <span class="fkr-title fkr-color-blue">{{buildAddress}}</span>
      </div>
    </div>
    <div class="db-row">
      <div class="db-col-6">
        <!-- <span class="fkr-bold-text">Генподрядчик :</span>-->
        <!-- <span>-->
        <div class="db-container">
          <div class="db-row">
            <div class="db-col-2">
              <span class="fkr-bold-text">Генподрядчик :</span>
            </div>
            <div class="db-col-10">
              <div v-for="builder in builders" :key="builder.LookupId">
                <a href="/">{{builder.LookupValue}}</a>
              </div>
            </div>
          </div>
          <!-- </span> -->
        </div>
      </div>

      <div class="db-col-6">
        <div class="db-container">
          <div class="db-row">
            <div class="db-col-2">
              <span class="fkr-bold-text">Договор :</span>
            </div>
            <div class="db-col-10">
              <!-- <ul v-for="contract in contracts" :key="contract.LookupId">
              </ul>-->
              <div v-for="contract in contracts" :key="contract.LookupId">
                <a href="/">{{contract.LookupValue}}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import actions from "@/store/action-types";
import store from "@/store/store";
import { mapState } from "vuex";
import { Project } from "../../types";

@Component({
  computed: {
    ...mapState({
      project: project => store.state.project
    })
  }
})
export default class ProjectHeader extends Vue {
  private project!: Project;

  private get buildAddress() {
    if (this.project && this.project.buildObject) {
      return this.project.buildObject[0].LookupValue;
    }
    return "";
  }
  private get contracts() {
    if (this.project && this.project.contracts) {
      return this.project.contracts;
    }
    return [];
  }
  private get builders() {
    if (this.project && this.project.builder) {
      return this.project.builder;
    }
    return [];
  }
}
</script>
