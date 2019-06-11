<template>
  <div>
    <template v-if="containsItems">
      <table class="projects-table">
        <tr>
          <th class="ms-vh2" style="max-width: 500px;">
            <div class="ms-vh-div">№</div>
          </th>
          <th class="ms-vh2" style="max-width: 500px;">
            <div class="ms-vh-div">Название</div>
          </th>
          <th class="ms-vh2" style="max-width: 500px;">
            <div class="ms-vh-div">Дата</div>
          </th>
          <th class="ms-vh2">
            <div class="ms-vh-div">Объект реконструкции</div>
          </th>
          <th class="ms-vh2" style="max-width: 500px;">
            <div class="ms-vh-div">Проектировщик</div>
          </th>
        </tr>
        <tr v-for="(item, index) in items" :key="item.ID">
          <td>{{index+1}}</td>
          <td>
            <FieldLookupDisplay
              :siteUrl="siteUrl"
              :listId="listId"
              :value="{ LookupId: item.ID, LookupValue: item.Title }"
            ></FieldLookupDisplay>
          </td>
          <td>{{ formatDate(item.CreatedDate) }}</td>
          <td>
            <FieldLookupDisplay
              :siteUrl="siteUrl"
              :listId="buildObjectListId"
              :value="item.BuildObject"
            ></FieldLookupDisplay>
          </td>
          <td>
            <FieldLookupDisplay
              :siteUrl="siteUrl"
              :listId="contractorListId"
              :value="item.Designer"
            ></FieldLookupDisplay>
          </td>
        </tr>
      </table>
    </template>
    <template v-else>
      <span>Комплекты по заданному адресу не найдены.</span>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ProjectItem } from "../../types";
import FieldLookupDisplay from "../forms/FieldLookupDisplay.vue";

@Component({
  components: {
    FieldLookupDisplay
  }
})
export default class ProjectList extends Vue {
  @Prop() items!: ProjectItem[];
  @Prop() siteUrl!: string;
  @Prop() listId!: string;
  @Prop() buildObjectListId!: string;
  @Prop() contractorListId!: string;

  count: number = 0;

  get containsItems() {
    return this.items && this.items.length > 0;
  }

  formatDate(date: Date) {
    return date.format("dd.mm.yyyy");
    //date.getDate()+'.'+date.getMonth()+'.'+date.getFullYear();
  }
}
</script>
<style>
.projects-table td {
  padding-right: 10px;
}
</style>
