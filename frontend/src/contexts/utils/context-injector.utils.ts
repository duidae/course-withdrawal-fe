// Component props type is not important here.
/* eslint-disable @typescript-eslint/no-explicit-any */

type ContextInjector<T = any> = (
  component: React.ComponentType<T>,
) => React.ComponentType<T>;

export function combineContextInjectors<T = any>(
  injects: ContextInjector[],
): ContextInjector<T> {
  return (wrapComponent: React.ComponentType<T>) => {
    return injects.reduce(
      (component, injector) => injector(component),
      wrapComponent,
    );
  };
}
