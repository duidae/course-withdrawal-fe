import { coolui_Messages_En } from "../cool-ui/translations/messages/en";
import { coolui_Messages_Zh } from "../cool-ui/translations/messages/zh-TW";
import { messages_Zh } from "../translations/messages/zh-TW";
import { messages_En } from "../translations/messages/en";
import type { Locale } from "./locale.model";

export const Locale_Zh: Locale = {
  value: "zh",
  codes: ["zh", "zh-hant", "zh-tw", "zh-hans"],
  messages: { ...messages_Zh, ...coolui_Messages_Zh },
};

export const Locale_En: Locale = {
  value: "en",
  codes: ["en", "en-us"],
  messages: { ...messages_En, ...coolui_Messages_En },
};

export const defaultLocale: Locale = Locale_Zh;
export const supportLocales: Locale[] = [Locale_Zh, Locale_En];
