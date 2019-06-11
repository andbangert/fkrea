<template>
    <tr>
      <td width="113" class="ms-formlabel" nowrap="true" valign="top">
        <h3 class="ms-standardheader">
          <nobr>
            <slot name="label"></slot>
            <!-- <span title="Strings.STS.L_RequiredField_Tooltip" class="ms-accentText">*</span> -->
          </nobr>
        </h3>
      </td>
      <td width="350" class="ms-formbody" valign="top">
        <slot name="control"></slot>
      </td>
    </tr>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class FieldTemplate extends Vue {
}
</script>
