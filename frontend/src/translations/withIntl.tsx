import { type ComponentType } from "react";

import { IntlProvider } from "react-intl";

import { LocaleUtils } from "./locale.utils";

export function withIntl<P extends React.JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
): ComponentType<P> {
  const ComponentWithIntl = (props: P) => {
    const urlParams = new URLSearchParams(window.location.search);
    const locale = LocaleUtils.getLocale(urlParams.get("locale"));

    return (
      <IntlProvider
        locale={locale.value}
        key={locale.value}
        messages={locale.messages}
      >
        <WrappedComponent {...props} />
      </IntlProvider>
    );
  };

  return ComponentWithIntl;
}
