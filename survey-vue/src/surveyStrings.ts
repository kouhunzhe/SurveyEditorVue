import { simplifiedChineseSurveyStrings } from "./localization/simplified-chinese";

export var surveyLocalization = {
  currentLocaleValue: "",
  defaultLocaleValue: "zh-cn",
  locales: <{[index: string]: any}>{},
  localeNames: <{[index: string]: any}>{},
  supportedLocales: <Array<any>>[],
  get currentLocale() {
    return this.currentLocaleValue === this.defaultLocaleValue
      ? ""
      : this.currentLocaleValue;
  },
  set currentLocale(val: string) {
    this.currentLocaleValue = val;
  },
  get defaultLocale() {
    return this.defaultLocaleValue;
  },
  set defaultLocale(val: string) {
    this.defaultLocaleValue = val;
  },
  getString: function(strName: string) {
    var loc = this.currentLocale
      ? this.locales[this.currentLocale]
      : this.locales[this.defaultLocale];
    if (!loc || !loc[strName]) loc = this.locales[this.defaultLocale];
    var result = loc[strName];
    if(result === undefined) {
      result = this.locales["zh-cn"][strName];
    }
    return result;
  },
  getLocales: function(): Array<string> {
    var res = [];
    res.push("");
    if (this.supportedLocales && this.supportedLocales.length > 0) {
      for (var i = 0; i < this.supportedLocales.length; i++) {
        res.push(this.supportedLocales[i]);
      }
    } else {
      for (var key in this.locales) {
        res.push(key);
      }
    }
    res.sort();
    return res;
  }
};

export var surveyStrings = simplifiedChineseSurveyStrings;
(<any>surveyLocalization).locales["zh-cn"] = simplifiedChineseSurveyStrings;
(<any>surveyLocalization).localeNames["zh-cn"] = "simplifiedChinese";
