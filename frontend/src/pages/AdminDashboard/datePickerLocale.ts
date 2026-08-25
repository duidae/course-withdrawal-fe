import "dayjs/locale/zh-tw";
import { zhTW } from "@mui/x-date-pickers/locales";

// The MUI DateTimePicker's own UI text (calendar nav, OK/Cancel, etc.) is
// always zh-TW here, independent of the app's react-intl locale.
export const datePickerLocale = {
  adapterLocale: "zh-tw",
  localeText: zhTW.components.MuiLocalizationProvider.defaultProps.localeText,
};
