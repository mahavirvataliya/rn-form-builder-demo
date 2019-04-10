//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';


// create a component
class ImageField extends Component {

  static propTypes = {
    attributes: PropTypes.object,
    theme: PropTypes.object,
    updateValue: PropTypes.func,
    onSummitTextInput: PropTypes.func,
    ErrorComponent: PropTypes.func,
  }
  handleChange(text) {
    this.props.updateValue(this.props.attributes.name, text);
  }

  render() {
    const { theme, attributes, ErrorComponent } = this.props;
    return (
      <View style={styles.container}>
        <Text onPress={() => { this.handleChange("hello") }}>{`My Image ${attributes.label}`}</Text>
        <ErrorComponent {...{ attributes, theme }} />
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

//make this component available to the app
export default ImageField;
