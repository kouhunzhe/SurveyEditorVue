<template>
  <span  >
    <survey-element
    v-if="element.visible"
    v-for="element in row.elements"
    :key="element.idValue"
    :id="element.id"
    :name="element.name"
    :style="{ paddingLeft: element.paddingLeft, paddingRight: element.paddingRight, width: element.renderWidth, display: 'inline-block' }"
    :element="element"
    :survey="survey"
    :css="css"></survey-element>
  </span>

</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { SurveyModel } from "../survey";
import { PanelModelBase, PanelModel, QuestionRowModel } from "../panel";
import { VueSurveyModel } from "./surveyModel";
@Component
export class Row extends Vue {
  @Prop({ required: false }) row: any;
  @Prop({ required: false }) css: any;
  @Prop({ required: false }) element: any;
  @Prop({ required: false }) survey: SurveyModel;
  mounted() {
    if (!!this.row) {
      VueSurveyModel.updatePropertiesHash(this.row);
    }
  }
}
Vue.component("survey-row", Row);
export default Row;
</script>
<style>
.survey-qstn {
    display: block;
    vertical-align: top;
    /* overflow: auto; */
}
</style>