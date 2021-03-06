import * as Survey from "survey-vue";
import { SurveyPropertyEditorFactory } from "./propertyEditors/propertyRegisterEditor";
import { SurveyPropertyEditorBase } from "./propertyEditors/propertyEditorBase";

export class Extentions {
  public static registerCustomPropertyEditor(name: string, widgetJSON: any) {
    SurveyPropertyEditorFactory.registerCustomEditor(name, widgetJSON);
  }
  public static unregisterCustomPropertyEditor(name: string) {
    SurveyPropertyEditorFactory.unregisterCustomEditor(name);
  }
  public static registerPropertyEditor(
    name: string,
    creator: (property: Survey.JsonObjectProperty) => SurveyPropertyEditorBase
  ) {
    SurveyPropertyEditorFactory.registerEditor(name, creator);
  }
}
