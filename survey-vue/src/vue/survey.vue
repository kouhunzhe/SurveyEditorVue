<template>
  <div :class="css.root" :style="{ background: survey.underpainting }">
    <form onsubmit="return false;" class="survey-form" :style="{ background: survey.typePageUnderpainting,width: survey.areaWidth+'px' }">
      <survey-heeader :survey="survey"></survey-heeader>
      <div :class="css.container" >
        <div v-if="hasTitle" :class="css.header">
          <h3 :class="css.title">
            <survey-string :locString="survey.locTitle" />
          </h3>
          <h5 :class="css.description">
            <survey-string :locString="survey.locDescription" />
          </h5>
        </div>
        <template v-if="survey.state === 'starting'">
          <div :class="css.body">
            <div
              v-if="survey.isNavigationButtonsShowing === 'top' || survey.isNavigationButtonsShowing === 'both'"
              :class="css.footer"
            >
              <input
                type="button"
                :value="survey.startSurveyText"
                :class="getNavBtnClasses('start')"
                @click="start"
              />
            </div>
            <survey-page
              :id="survey.startedPage.id"
              :survey="survey"
              :page="survey.startedPage"
              :css="css"
            />
            <div
              v-if="survey.isNavigationButtonsShowing === 'bottom' || survey.isNavigationButtonsShowing === 'both'"
              :class="css.footer"
            >
              <input
                type="button"
                :value="survey.startSurveyText"
                :class="getNavBtnClasses('start')"
                @click="start"
              />
            </div>
          </div>
        </template>
        <template v-if="survey.state === 'running'">
          <div :class="css.body" :style="{ background: survey.typePageUnderpainting }">
            <survey-progress v-if="survey.isShowProgressBarOnTop" :survey="survey" :css="css" :class="css.progressBarTop"/>
            <survey-timerpanel v-if="survey.isTimerPanelShowingOnTop" :survey="survey" :css="css" />
            <div
              v-if="survey.isNavigationButtonsShowing === 'top' || survey.isNavigationButtonsShowing === 'both'"
              :class="css.footer">
              <input
                type="button"
                :value="survey.pagePrevText"
                v-show="!survey.isFirstPage && survey.isShowPrevButton"
                :class="getNavBtnClasses('prev')"
                @click="prevPage"
              />
              <input
                type="button"
                :value="survey.pageNextText"
                v-show="!survey.isLastPage"
                :class="getNavBtnClasses('next')"
                @click="nextPage"
              />
              <input
                v-if="survey.isEditMode"
                type="button"
                :value="survey.completeText"
                v-show="survey.isLastPage"
                :class="getNavBtnClasses('complete')"
                @click="completeLastPage"
              />
            </div>
            <survey-page
              :id="survey.currentPage.id"
              :survey="survey"
              :page="survey.currentPage"
              :css="css"
            />
            <survey-timerpanel
              v-if="survey.isTimerPanelShowingOnBottom"
              :survey="survey"
              :css="css"
            />
            <survey-progress v-if="survey.isShowProgressBarOnBottom" :survey="survey" :css="css" :class="css.progressBarBottom"/>
            <div
              v-if="survey.isNavigationButtonsShowing === 'bottom' || survey.isNavigationButtonsShowing === 'both'"
              :class="css.footer"
            >
            <el-button size="medium" v-if="!survey.isFirstPage && survey.isShowPrevButton"  :class="getNavBtnClasses('prev')"  @click="prevPage">{{survey.pagePrevText}}</el-button>
            <el-button size="medium" v-if="!survey.isLastPage"  :class="getNavBtnClasses('next')"  @click="nextPage">{{survey.pageNextText}}</el-button>
            <el-button size="medium" type="primary"  v-if="survey.isEditMode" v-show="survey.isLastPage" :class="getNavBtnClasses('complete')" @click="completeLastPage">{{survey.completeText}}</el-button>
            </div>
          </div>
        </template>
        <div v-if="hasCompletedPage">
          <div v-html="survey.processedCompletedHtml" :class="getCompletedPageClasses()"></div>
          <div v-if="survey.completedState != ''" :class="css.saveData.root">
            <div :class="getCompletedStateClasses()">
              <span>{{survey.completedStateText}}</span>
              <el-button size="medium" 
              v-if="survey.completedState == 'error'"
              :value="survey.getLocString('saveAgainButton')"
              @click="doTrySaveAgain"
              :class="css.saveData.saveAgainButton"
              >{{survey.getLocString('saveAgainButton')}}</el-button>

             
            </div>
          </div>
        </div>
        <div
          v-if="survey.state === 'completedbefore'"
          :class="css.body"
          v-html="survey.processedCompletedBeforeHtml"
        ></div>
        <div
          v-if="survey.state === 'loading'"
          :class="css.body"
          v-html="survey.processedLoadingHtml"
        ></div>
        <div v-if="survey.state === 'empty'" :class="css.bodyEmpty">
          <el-alert
            :title="survey.emptySurveyText"
            type="error">
          </el-alert>
          <survey-empty></survey-empty>
         </div>
      </div>
      
    </form>
    <survey-copyright :survey="survey" v-if="survey.showCopyright"></survey-copyright>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { surveyCss } from "../defaultCss/cssstandard";
import { VueSurveyModel as SurveyModel } from "./surveyModel";
import { StylesManager } from "../stylesmanager";

@Component
export class Survey extends Vue {
  @Prop({ required: false }) survey: SurveyModel

  forceUpdate() {
    this.$forceUpdate();
  }

  constructor() {
    super();
  }
  created() {
  }
  mounted() {
    var el = this.$el;
    if (el && this.survey) {
      this.survey.doAfterRenderSurvey(el);
      this.survey.renderCallback = this.forceUpdate;
      this.survey.startTimerFromUI();
    }
  }
  beforeDestroy() {
    this.survey.stopTimer();
    this.survey.renderCallback = undefined;
  }

  get hasTitle() {
    return !!this.survey.title && this.survey.showTitle;
  }
  get hasCompletedPage() {
    return this.survey.showCompletedPage && this.survey.state === "completed";
  }
  get css() {
    return this.survey?this.survey.css:"";
  }
  getNavBtnClasses(btnType: any) {
    const btnClass = this.css.navigation[btnType];
    return this.css.navigationButton + " " + btnClass;
  }
  getCompletedPageClasses() {
    var css = this.css;
    return css.body + " " + css.completedPage;
  }
  getCompletedStateClasses() {
    return this.css.saveData[this.survey.completedState];
  }
  start() {
    this.survey.start();
  }
  prevPage() {
    this.survey.prevPage();
  }
  nextPage() {
    this.survey.nextPage();
  }
  completeLastPage() {
    this.survey.completeLastPage();
  }
  doTrySaveAgain() {
    this.survey.doComplete();
  }
}

// TODO: make this functionality available via surveyCss in all examples
Object.defineProperty(Survey, "cssType", {
  get: function() {
    return surveyCss.currentType;
  },
  set: function(newType) {
    StylesManager.applyTheme(newType);
  },
  enumerable: true,
  configurable: false
});

Vue.component("survey", Survey);
export default Survey;
</script>
<style scoped>
.survey-form{
  margin:  0 auto;
  max-width: 100%;
}

</style>
