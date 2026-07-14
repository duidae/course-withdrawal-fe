import { jest } from '@jest/globals';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

export function resetAllMockedProperties(
  mockedObject: Record<string | number, any>,
): void {
  for (const key in mockedObject) {
    if (jest.isMockFunction(mockedObject[key])) {
      mockedObject[key].mockReset();
    } else if (
      mockedObject[key] instanceof Object &&
      !(mockedObject[key] instanceof Array)
    ) {
      resetAllMockedProperties(mockedObject[key]);
    }
  }
}
