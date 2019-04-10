//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
// create a component
class MessageField extends Component {

  static propTypes = {
    attributes: PropTypes.object,
    theme: PropTypes.object,
    updateValue: PropTypes.func,
    onSummitTextInput: PropTypes.func,
    ErrorComponent: PropTypes.func,
  }

  render() {
    const { attributes } = this.props;
    return (
      <View style={styles.container}>
        <Text style={{fontSize: 16}}>{attributes.message}</Text>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:18
  },
});

//make this component available to the app
export default MessageField;
