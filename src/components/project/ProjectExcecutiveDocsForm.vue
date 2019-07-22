<template>
  <!-- 
<a onclick="OpenPopUpPage('http:\u002f\u002fvm-arch\u002fsites\u002fdocumentation\u002f_layouts\u002f15\u002flistform.aspx?PageType=4\u0026ListId={ea94fe6e-fdb0-4609-93bf-f5d752e9c400}\u0026ID=14\u0026RootFolder=*', RefreshPage); return false;" href="http:\u002f\u002fvm-arch\u002fsites\u002fdocumentation\u002f_layouts\u002f15\u002flistform.aspx?PageType=4\u0026ListId={ea94fe6e-fdb0-4609-93bf-f5d752e9c400}\u0026ID=14\u0026RootFolder=*">замена внутреннего водостока</a>
  -->

  <div class="wrapper_big">
    <header>
      <h1>
        Комплект исполнительной документации
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
      </h1>
      <div class="tabs">
        <span class="active">Исполнительная</span>
        <span>Проектная</span>
      </div>

      <div class="clearfix"></div>
    </header>
    <div class="wrapper">
      <div class="top">
        <h2>{{ buildObject.LookupValue }}</h2>
      </div>
      <div class="about">
        <h2>Генподрядчик :</h2>
        <p>
          {{builder.LookupValue}}
          <!-- ЗАО Ремонтностроительная
          <br />фимрма “Мосстройресурс”-->
        </p>
        <h2>Договор :</h2>
        <p>
          <span v-for="item in contracts" :key="item.LookupId">
            <a href="#">{{item.LookupValue}}</a>
          </span>
          <br />
          <!-- <a href="#">Доп соглашение №32/86000-123 от 13.07.2018</a> -->
        </p>
      </div>

      <!-- System LIST -->
      <SystemList v-bind:project="project"></SystemList>
      <footer>
        <a href="#" class="print">Печать реестра</a>
        <form action>
          <label for>Подготовлен к передаче</label>
          <label for>Принят в архив</label>
          <input type="checkbox" value="Подготовлен к передаче" />
          <input type="checkbox" value="Проинят в архив" />
          <span>20.04.2019</span>
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
import { createNamespacedHelpers } from "vuex";
import { ExecutiveDocument, ExecutiveDocsState, Project } from "../../types";
import { mapState, mapGetters, mapActions } from "vuex";
import store from "@/store/store";

@Component({
  components: {
    SystemList
  },
  computed: {
    ...mapState({
      project: project => store.state.project
    })
  }
})
export default class ProjectExcecutiveDocsForm extends Vue {
  private project!: Project;

  get buildObject() {
    if (
      this.project &&
      this.project.buildObject &&
      this.project.buildObject.length
    )
      return this.project.buildObject[0];
  }
  get contracts() {
    if (this.project && this.project.contracts && this.project.contracts.length)
      return this.project.contracts;
  }
  get builder() {
    if (this.project && this.project.builder && this.project.builder.length)
      return this.project.builder[0];
  }

  private mounted() {}
}
</script>
