<!-- by sunyy -->
<template>
  <el-scrollbar class="toolbox">
    <el-menu class="menu">
        <template v-for="(x, index) in items">
          <el-menu-item :key="index" :index="x.name" class="item">
            <i :class="['iconfont ',x.iconName]"></i>
            <span slot="title" @click="testClick">{{x.title}}</span>
          </el-menu-item>
        </template>
      </el-menu>
  </el-scrollbar>
</template>
<script lang="ts">
import * as ko from "knockout";
import * as Survey from "survey-vue";
import { editorLocalization } from "@/js/editorLocalization";
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

/**
 * The Toolbox item description.
 */
export interface IQuestionToolboxItem {
  /**
   * An unique name
   */
  name: string;
  /**
   * Icon name
   */
  iconName: string;
  /**
   * The JSON that used to create a new question/panel. The 'type' attribute is requried.
   */
  json: any;
  /**
   * Toolbox item title
   */
  title: string;
  /**
   * Toolbox item tooltip. It equals to title if it is empty
   */
  tooltip?: string;
  /**
   * True, if an end user added this item into Toolbox from the survey.
   */
  isCopied: boolean;
  /**
   * Toolbox item category. If it is empty, it goes to 'General' category.
   */
  category: string;
}


@Component
export default class Toolbox extends Vue  {

  @Prop() public supportedQuestions:  Array<string>

  private testClick(){
    console.log(this)
  }

  private orderedQuestionsInit = [
    "text",
    "checkbox",
    "radiogroup",
    "dropdown",
    "comment",
    "rating",
    "imagepicker",
    "boolean",
    "html"
  ];

  private questionDefaultSettings = {
    imagepicker: () => {
      return {
        choices: [
          {
            value: "1",
            imageLink:"http://e.hiphotos.baidu.com/video/pic/item/962bd40735fae6cd80e2473200b30f2442a70f0b.jpg"
          },
          {
            value: "2",
             imageLink:"2"
          },
          {
            value: "3",
             imageLink:"3"
          },
          {
            value: "4",
            imageLink:"4"
          }
        ]
      };
    }
  };

  /**
   * Modify this array to change the toolbox items order.
   */
  public get orderedQuestions() {
    debugger
    return this.orderedQuestionsInit;
  }
  public set orderedQuestions(questions) {
    this.orderedQuestionsInit = questions;
    this.reorderItems();
  }
  /**
   * The maximum number of copied toolbox items. If an user adding copiedItemMaxCount + 1 item, the first added item will be removed.
   */
  public copiedItemMaxCount: number = 3;
  private allowExpandMultipleCategoriesValue: boolean = false;
  private keepAllCategoriesExpandedValue: boolean = false;
  private itemsValue: Array<IQuestionToolboxItem> = [];

  koItems = ko.observableArray();
  koCategories = ko.observableArray();
  koActiveCategory = ko.observable("");
  koHasCategories = ko.observable(false);
  koCanCollapseCategories = ko.observable(true);

  created() {
    var supportedQuestions=this.supportedQuestions
    this.createDefaultItems(supportedQuestions);
    var self = this;
    this.koActiveCategory.subscribe(function(newValue) {
      for (var i = 0; i < self.koCategories().length; i++) {
        var category = self.koCategories()[i];
        (<any>category).koCollapsed((<any>category).name !== newValue);
      }
    });
  }
  /**
   * The Array of Toolbox items as Text JSON.
   */
  public get jsonText() {
    return JSON.stringify(this.itemsValue);
  }
  public set jsonText(value: string) {
    this.itemsValue = value ? JSON.parse(value) : [];
    this.onItemsChanged();
  }
  /**
   * The Array of copied Toolbox items as Text JSON.
   */
  public get copiedJsonText(): string {
    return JSON.stringify(this.copiedItems);
  }
  public set copiedJsonText(value: string) {
    var newItems = value ? JSON.parse(value) : [];
    this.clearCopiedItems();
    for (var i = 0; i < newItems.length; i++) {
      newItems[i].isCopied = true;
      this.addItem(newItems[i]);
    }
  }
  /**
   * The Array of Toolbox items.
   */
  public get items(): Array<IQuestionToolboxItem> {
    return this.itemsValue;
  }
  public get itemNames(): Array<string> {
    var res = [];
    for (var i = 0; i < this.items.length; i++) {
      res.push(this.items[i].name);
    }
    return res;
  }
  /**
   * The Array of copied Toolbox items
   */
  public get copiedItems(): Array<IQuestionToolboxItem> {
    var result = [];
    for (var i = 0; i < this.itemsValue.length; i++) {
      if (this.itemsValue[i].isCopied) result.push(this.itemsValue[i]);
    }
    return result;
  }
  /**
   * Add toolbox items into the Toolbox
   * @param items the list of new items
   * @param clearAll set it to true to clear all previous items.
   */
  public addItems(
    items: Array<IQuestionToolboxItem>,
    clearAll: boolean = false
  ) {
    if (clearAll) {
      this.clearItems();
    }
    for (var i = 0; i < items.length; i++) {
      this.itemsValue.push(items[i]);
    }
    this.onItemsChanged();
  }
  /**
   * Add a copied Question into Toolbox
   * @param question a copied Survey.Question
   * @param options a json object that allows you to override question properties. Attributes are: name, title, tooltip, isCopied, iconName, json and category.
   */
  public addCopiedItem(question: Survey.Question, options: any = null) {
    if (!options) options = {};
    var name = !!options.name ? options.name : question.name;
    var title = !!options.title ? options.title : name;
    var tooltip = !!options.tooltip ? options.tooltip : title;
    var item = {
      name: name,
      title: title,
      tooltip: tooltip,
      isCopied: options.isCopied !== false,
      iconName: !!options.iconName ? options.iconName : "icon-default",
      json: !!options.json ? options.json : this.getQuestionJSON(question),
      category: !!options.category ? options.category : ""
    };
    if (this.replaceItem(item)) return;
    var copied = this.copiedItems;
    if (this.copiedItemMaxCount > 0 && copied.length == this.copiedItemMaxCount)
      this.removeItem(copied[this.copiedItemMaxCount - 1].name);
    this.addItem(item);
  }
  /**
   * Add a toolbox item
   * @param item the toolbox item description
   * @see IQuestionToolboxItem
   */
  public addItem(item: IQuestionToolboxItem) {
    this.correctItem(item);
    this.itemsValue.push(item);
    this.onItemsChanged();
  }
  private correctItem(item: IQuestionToolboxItem) {
    if (!item.title) item.title = item.name;
    if (!item.tooltip) item.tooltip = item.title;
  }
  /**
   * Add a new toolbox item, add delete the old item with the same name
   * @param item the toolbox item description
   * @see IQuestionToolboxItem
   */
  public replaceItem(item: IQuestionToolboxItem): boolean {
    this.correctItem(item);
    var index = this.indexOf(item.name);
    if (index < 0) return;
    this.itemsValue[index] = item;
    this.onItemsChanged();
    return true;
  }
  /**
   * Remove a toolbox item by it's name
   * @param name toolbox item name
   * @see IQuestionToolboxItem
   */
  public removeItem(name: string): boolean {
    var index = this.indexOf(name);
    if (index < 0) return false;
    this.itemsValue.splice(index, 1);
    this.onItemsChanged();
    return true;
  }
  /**
   * Remove all toolbox items.
   */
  public clearItems() {
    this.itemsValue = [];
    this.onItemsChanged();
  }
  /**
   * Remove all copied toolbox items.
   */
  public clearCopiedItems() {
    var removedItems = this.copiedItems;
    for (var i = 0; i < removedItems.length; i++) {
      this.removeItem(removedItems[i].name);
    }
  }
  /**
   * Returns toolbox item by its name. Returns null if there is no toolbox item with this name
   * @param name
   */
  public getItemByName(name: string): IQuestionToolboxItem {
    var index = this.indexOf(name);
    return index > -1 ? this.itemsValue[index] : null;
  }
  /**
   * Set it to true, to allow end-user to expand more than one category. There will no active category in this case
   * @see activeCategory
   */
  public get allowExpandMultipleCategories(): boolean {
    return this.allowExpandMultipleCategoriesValue;
  }
  public set allowExpandMultipleCategories(val: boolean) {
    this.allowExpandMultipleCategoriesValue = val;
    this.updateCategoriesState();
  }
  /**
   * Set it to true to expand all categories and hide expand/collapse category buttons
   */
  public get keepAllCategoriesExpanded(): boolean {
    return this.keepAllCategoriesExpandedValue;
  }
  public set keepAllCategoriesExpanded(val: boolean) {
    this.keepAllCategoriesExpandedValue = val;
    this.koCanCollapseCategories(!this.keepAllCategoriesExpanded);
    this.updateCategoriesState();
  }
  private updateCategoriesState() {
    var noActive =
      this.allowExpandMultipleCategories || this.keepAllCategoriesExpanded;
    if (noActive) {
      this.activeCategory = "";
      if (this.keepAllCategoriesExpanded) {
        this.expandAllCategories();
      }
    } else {
      if (this.koCategories().length > 0) {
        this.activeCategory = (<any>this.koCategories()[0]).name;
      }
    }
  }

  /**
   * Change the category of the toolbox item
   * @param name the toolbox item name
   * @param category new category name
   */
  public changeCategory(name: string, category: string) {
    this.changeCategories([{ name: name, category: category }]);
  }
  /**
   * Change categories for several toolbox items.
   * @param changedItems the array of objects {name: "your toolbox item name", category: "new category name"}
   */
  public changeCategories(changedItems: Array<any>) {
    for (var i = 0; i < changedItems.length; i++) {
      var item = changedItems[i];
      var toolboxItem = this.getItemByName(item.name);
      if (toolboxItem) {
        toolboxItem.category = item.category;
      }
    }
    this.onItemsChanged();
  }
  /**
   * Set and get and active category. This property doesn't work if allowExpandMultipleCategories is true. Its default value is empty.
   * @see allowExpandMultipleCategories
   * @see expandCategory
   * @see collapseCategory
   */
  public get activeCategory(): string {
    return this.koActiveCategory();
  }
  public set activeCategory(val: string) {
    this.koActiveCategory(val);
  }
  private doCategoryClick(categoryName: string) {
    if (this.keepAllCategoriesExpanded) return;
    if (this.allowExpandMultipleCategories) {
      var category = this.getCategoryByName(categoryName);
      if (category) {
        category.koCollapsed(!category.koCollapsed());
      }
    } else {
      this.activeCategory = categoryName;
    }
  }
  /**
   * Expand a category by its name. If allowExpandMultipleCategories is false (default value), all other categories become collapsed
   * @param categoryName the category name
   * @see allowExpandMultipleCategories
   * @see collapseCategory
   */
  public expandCategory(categoryName: string) {
    if (this.allowExpandMultipleCategories) {
      var category = this.getCategoryByName(categoryName);
      if (category) {
        category.koCollapsed(false);
      }
    } else {
      this.activeCategory = categoryName;
    }
  }
  /**
   * Collapse a category by its name. If allowExpandMultipleCategories is false (default value) this function does nothing
   * @param categoryName the category name
   * @see allowExpandMultipleCategories
   */
  public collapseCategory(categoryName: string) {
    if (!this.allowExpandMultipleCategories) return;
    var category = this.getCategoryByName(categoryName);
    if (category) {
      category.koCollapsed(true);
    }
  }
  /**
   * Expand all categories. If allowExpandMultipleCategories is false (default value) this function does nothing
   * @see allowExpandMultipleCategories
   */
  public expandAllCategories() {
    this.expandCollapseAllCategories(false);
  }
  /**
   * Collapse all categories. If allowExpandMultipleCategories is false (default value) this function does nothing
   * @see allowExpandMultipleCategories
   */
  public collapseAllCategories() {
    this.expandCollapseAllCategories(true);
  }
  private expandCollapseAllCategories(isCollapsed: boolean) {
    var categories = this.koCategories();
    for (var i = 0; i < categories.length; i++) {
      (<any>categories[i]).koCollapsed(isCollapsed);
    }
  }
  private getCategoryByName(categoryName: string): any {
    var categories = this.koCategories();
    for (var i = 0; i < categories.length; i++) {
      var category = <any>categories[i];
      if (category.name === categoryName) return category;
    }
    return null;
  }
  protected onItemsChanged() {
    this.koItems([]);
    this.koItems(this.itemsValue);
    var categories = [];
    var categoriesHash = {};
    var prevActiveCategory = this.koActiveCategory();
    var self = this;
    for (var i = 0; i < this.itemsValue.length; i++) {
      var item = this.itemsValue[i];
      var categoryName = item.category
        ? item.category
        : editorLocalization.getString("ed.toolboxGeneralCategory"); //TODO
      if (!categoriesHash[categoryName]) {
        var category = {
          name: categoryName,
          items: [],
          koCollapsed: ko.observable(categoryName !== prevActiveCategory),
          expand: function() {
            self.doCategoryClick(this.name);
          }
        };
        categoriesHash[categoryName] = category;
        categories.push(category);
      }
      categoriesHash[categoryName].items.push(item);
    }
    this.koCategories(categories);
    if (!this.allowExpandMultipleCategories) {
      if (prevActiveCategory && categoriesHash[prevActiveCategory]) {
        this.koActiveCategory(prevActiveCategory);
      } else {
        this.koActiveCategory(categories.length > 0 ? categories[0].name : "");
      }
    } else {
      if (categories.length > 0) {
        categories[0].koCollapsed(false);
      }
    }
    this.koHasCategories(categories.length > 1);
  }
  private indexOf(name: string) {
    for (var i = 0; i < this.itemsValue.length; i++) {
      if (this.itemsValue[i].name == name) return i;
    }
    return -1;
  }
  private reorderItems() {
    this.itemsValue.sort((i1, i2) => {
      var index1 = this.orderedQuestionsInit.indexOf(i1.name);
      if (index1 === -1) index1 = Number.MAX_VALUE;
      var index2 = this.orderedQuestionsInit.indexOf(i2.name);
      if (index2 === -1) index2 = Number.MAX_VALUE;
      return index1 - index2;
    });
    this.onItemsChanged();
  }
  private createDefaultItems(supportedQuestions: Array<string>) {
    this.clearItems();
    var questions = this.getQuestionTypes(supportedQuestions);
    for (var i = 0; i < questions.length; i++) {
      var name = questions[i];
      var question = Survey.ElementFactory.Instance.createElement(name, "q1");
      if (!question) {
        question = Survey.Serializer.createClass(name);
      }
      var json = this.getQuestionJSON(question);
      var title = editorLocalization.getString("qt." + name);
      var item = {
        name: name,
        iconName: "icon-" + name,
        title: title,
        tooltip: title,
        json: json,
        isCopied: false,
        category: ""
      };
      this.itemsValue.push(item);
    }
    this.registerCustomWidgets();
    this.onItemsChanged();
  }
  private registerCustomWidgets() {
    var inst = Survey.CustomWidgetCollection.Instance;
    if (!inst.getActivatedBy) return;
    var widgets = inst.widgets;
    for (var i = 0; i < widgets.length; i++) {
      if (inst.getActivatedBy(widgets[i].name) != "customtype") continue;
      var widgetJson = widgets[i].widgetJson;
      if (!widgetJson.widgetIsLoaded || !widgetJson.widgetIsLoaded()) continue;
      var iconName = widgetJson.iconName ? widgetJson.iconName : "icon-default";
      var title = editorLocalization.getString("qt." + widgetJson.name);
      if (!title || title == widgetJson.name) title = widgetJson.title;
      if (!title) title = widgetJson.name;
      var json = widgetJson.defaultJSON ? widgetJson.defaultJSON : {};
      if (!json.type) {
        json.type = widgetJson.name;
      }
      var item = {
        name: widgetJson.name,
        iconName: iconName,
        title: title,
        tooltip: title,
        json: json,
        isCopied: false,
        category: ""
      };
      this.itemsValue.push(item);
    }
  }
  private getQuestionJSON(question: any): any {
    var json = new Survey.JsonObject().toJsonObject(question);
    json.type = question.getType();
    if (!!this.questionDefaultSettings[json.type]) {
      var defaultSettings = this.questionDefaultSettings[json.type]();
      for (var key in defaultSettings) {
        json[key] = defaultSettings[key];
      }
    }
    return json;
  }
  private getQuestionTypes(supportedQuestions: Array<string>): string[] {
    var allTypes = Survey.ElementFactory.Instance.getAllTypes();
    if (!supportedQuestions || supportedQuestions.length == 0)
      supportedQuestions = allTypes;
    var questions = [];
    var orderedQuestions = this.orderedQuestions
    for (var i = 0; i < this.orderedQuestions.length; i++) {
      var name = this.orderedQuestions[i];
      if (supportedQuestions.indexOf(name) > -1 && allTypes.indexOf(name) > -1)
        questions.push(name);
    }
    for (var i = 0; i < supportedQuestions.length; i++) {
      var name = supportedQuestions[i];
      if (
        questions.indexOf(supportedQuestions[i]) < 0 &&
        allTypes.indexOf(name) > -1
      )
        questions.push(name);
    }
    return questions;
  }
}

</script>

<style lang='scss'>
</style>
<style lang='scss' scoped>
.toolbox{
  height: 100%;
  max-width: 240px;
  width: 240px;
  &::v-deep  .el-scrollbar__wrap{
    overflow-x: hidden;
  }
  .menu{
    .item{
      .iconfont{
          margin-right: 5px;
          width: 24px;
          text-align: center;
          font-size: 18px;
          vertical-align: middle;
      }
    }
  }
}
</style>
