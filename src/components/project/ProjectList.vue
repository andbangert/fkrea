<template>
  <div>
    <template v-if="containsItems">
      <table class="fkr-table">
        <thead>
          <tr class="header-row">
            <th class="td-id">№</th>
            <th>Название</th>
            <th nowrap>Дата создания</th>
            <th>Проектировщик</th>
            <th>Генподрядчик</th>
            <th>Договор</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.ID">
            <td class="td-id">{{index+1}}</td>
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
                :listId="contractorListId"
                :value="item.Designer"
              ></FieldLookupDisplay>
            </td>
            <td>
              <FieldLookupDisplay
                :siteUrl="siteUrl"
                :listId="contractorListId"
                :value="item.Contractor"
              ></FieldLookupDisplay>
            </td>
            <td>
              <FieldLookupDisplay
                :siteUrl="contractSiteUrl"
                :listId="contractListId"
                :value="item.Contracts"
              ></FieldLookupDisplay>
            </td>
          </tr>
        </tbody>
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
  @Prop() contractListId!: string;
  @Prop() contractSiteUrl!: string;

  count: number = 0;

  get containsItems() {
    return this.items && this.items.length > 0;
  }

  formatDate(date: Date) {
    return date.format("dd.MM.yyyy");
    //date.getDate()+'.'+date.getMonth()+'.'+date.getFullYear();
  }
}
</script>
<style scoped>
.td-id {
  padding-left: 8px;
}
.fkr-table thead tr th {
  padding-right: 8px;
}
</style>