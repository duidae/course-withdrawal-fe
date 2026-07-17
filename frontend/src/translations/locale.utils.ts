import { defaultLocale, supportLocales } from "./locale.constants";
import type { Locale } from "./locale.model";

export class LocaleUtils {
  static getLocale(raw: string | undefined | null): Locale {
    if (raw === undefined || raw === null) {
      return defaultLocale;
    }

    let result: Locale | undefined = undefined;

    for (const supportLocale of supportLocales) {
      if (supportLocale.codes.includes(raw.toLowerCase())) {
        result = supportLocale;
      }
    }

    result = result ?? defaultLocale;

    return result;
  }

  static getAllLocaleMessageById(id: string): string[] {
    const result: string[] = [];

    for (const supportLocale of supportLocales) {
      const message = supportLocale.messages[id];

      if (message !== undefined) {
        result.push(message);
      }
    }

    return result;
  }
}
