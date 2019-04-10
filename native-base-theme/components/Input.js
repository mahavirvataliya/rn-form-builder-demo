// @flow

import variable from './../variables/platform';

export default (variables /*: * */ = variable) => {
  const inputTheme = {
    '.multiline': {
      height: null,
    },
    height: variables.inputHeightBase,
    color: variables.inputColor,
    paddingBottom: 10,
    flex: 1,
    fontSize: variables.inputFontSize,
  };

  return inputTheme;
};
