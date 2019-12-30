import * as ko from "knockout";
import Vue from "vue";
import * as Survey from "survey-vue";

import {  SurveyPropertyEditorBase,  ISurveyObjectEditorOptions} from "./propertyEditors/propertyEditorBase";
// import { SurveyPropertyEditorFactory } from "./propertyEditors/propertyEditorFactory";
import { SurveyPropertyCalculatedValueEditor } from "./propertyEditors/propertyCalculatedValues"
import { SurveyPropertyEditorFactory} from "./propertyEditors/propertyRegisterEditor";
export declare type SurveyOnPropertyChangedCallback = (  property: SurveyObjectProperty,  newValue: any) => void;

export class SurveyObjectProperty {
  private objectValue: any;
  private onPropertyChanged: SurveyOnPropertyChangedCallback;
  private isActiveValue: boolean;
  public onChanged: (newValue: any) => any;
  public name: string;
  public disabled: boolean;
  public editor: SurveyPropertyEditorBase;
  public editorType: string;
  public editorTypeTemplate: string;
  public baseEditorType: string;
  public onDependedPropertyUpdateCallback: (propertyName: string) => void;
  public koVisible: any;

  koIsShowEditor = Vue.observable(false);

  constructor(
    public property: Survey.JsonObjectProperty,
    onPropertyChanged: SurveyOnPropertyChangedCallback = null,
    propertyEditorOptions: ISurveyObjectEditorOptions = null
  ) {
    this.onPropertyChanged = onPropertyChanged;
    this.name = this.property.name;
    this.disabled = property["readOnly"];
    var self = this;
    var onItemChanged = function(newValue) {
      self.onEditorValueChanged(newValue);
    };
    this.editor = SurveyPropertyEditorFactory.createEditor(
      property,
      onItemChanged
    );
    this.editor.onGetLocale = this.doOnGetLocale;
    this.editor.options = propertyEditorOptions;
    this.editorType = this.editor.editorType;
    this.editorTypeTemplate = this.editor.editorTypeTemplate;
    this.isActive = false;
    this.koVisible = Vue.observable(this.isVisible());
  }
  public get displayName(): string {
    return this.editor.displayName;
  }
  public get title(): string {
    return this.editor.title;
  }
  public get isActive(): boolean {
    return this.isActiveValue;
  }
  public set isActive(val: boolean) {
    if (this.isActive == val) return;
    this.isActiveValue = val;
    this.koIsShowEditor=!this.disabled && (this.editor.alwaysShowEditor || this.isActive);
  }
  public get value(): any {
    return this.editor.value;
  }
  public set value(value:any) {
    this.editor.value=value;
  }
  public get text(): any {
    return this.editor.text;
  }
  public get koIsDefault(): any {
    return this.editor.koIsDefault;
  }
  private doOnGetLocale(): string {
    if (this.object && this.object["getLocale"]) return this.object.getLocale();
    return "";
  }
  public get object(): any {
    return this.objectValue;
  }
  public set object(value: any) {
    this.objectValue = value;
    this.editor.object = value;
    this.updateDependedProperties();
    this.updateDynamicProperties();
  }
  public updateDynamicProperties() {
    this.koVisible=this.isVisible();
    this.editor.updateDynamicProperties();
  }
  protected isVisible(): boolean {
    if (!this.object) return true;
    var layout = !!this.object.getLayoutType ? this.object.getLayoutType() : "";
    if (
      !!this.property.isVisible &&
      !(<any>this.property["isVisible"])(layout, this.object)
    )
      return false;
    return true;
  }
  protected onEditorValueChanged(newValue) {
    if (this.object) {
      if (!!this.onPropertyChanged) this.onPropertyChanged(this, newValue);
      if (!!this.onChanged) this.onChanged(newValue);
    }
    this.updateDependedProperties();
  }
  private updateDependedProperties() {
    if (!this.object || !this.onDependedPropertyUpdateCallback) return;
    if (!this.property["getDependedProperties"]) return;
    var props = this.property["getDependedProperties"]();
    if (!props) return;
    for (var i = 0; i < props.length; i++) {
      this.onDependedPropertyUpdateCallback(props[i]);
    }
  }
}
