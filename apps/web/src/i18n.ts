// i18next with the English message file as the only shipped locale (PRD 2.4). Components read
// text with `useTranslation()`; keys are typed from `messages/en.json`. Message keys are flat
// ("nav.home"), so the key separator is off.
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./messages/en.json";

export type MessageKey = keyof typeof en;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
    keySeparator: false;
    nsSeparator: false;
  }
}

export const resources = { en: { translation: en } };

export const i18n = i18next.createInstance();

// Resources are bundled, so `initAsync: false` makes init synchronous: the first render,
// server included, already has the text.
void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  initAsync: false,
});
