<template>
  <div class="hello">
    <v-select :options="options"></v-select>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import vSelect from "vue-select";

Vue.component("v-select", vSelect);

@Component({
  data() {
    return { options: ["foo", "bar", "baz"] };
  }
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;
  options!: Array<string>;
  
  mounted() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
