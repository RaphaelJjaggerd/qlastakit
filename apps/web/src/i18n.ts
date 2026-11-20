// Stub for card 1.6, which replaces this file with i18next. Shell text already goes through
// message keys, so the swap changes this file and nothing else.
import en from "./messages/en.json";

export type MessageKey = keyof typeof en;

export function t(key: MessageKey): string {
  return en[key];
}
