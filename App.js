import React, { Component } from "react";
import { AppRegistry, ScrollView, ActivityIndicator } from "react-native";
import { View, Text, Button, StyleProvider } from "native-base";
import GenerateForm from "@infobizzs/rn-form-builder";
import getTheme from "./native-base-theme/components";
import theme from "./form-theme";
import LogicResolver from "./lib/logic-resolver";
import customFields from './lib/custom-fields';
import * as data from './data.json';
import { Root } from "native-base";
import { Container, Header, Left, Body, Right, Title } from 'native-base';

const styles = {
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    flex: 1,
    marginTop: 80,
  },
  submitButton: {
    paddingHorizontal: 10,
    paddingTop: 20
  }
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: false,
      logics: false,
      orginalForm: false
    };
  }

  componentWillMount() {
   
  }

  componentDidMount() {
    fetch("http://192.168.0.110:8000/example")
    .then(resp => resp.json())
    .then(response => {
      this.setState({
        form: response.fields,
        logics: response.logic,
        orginalForm: response.fields
      });
       this.onValueChange();
    });

    // const response = data;
    // this.setState({
    //   form: response.fields,
    //   logics: response.logic,
    //   orginalForm: response.fields
    // });
    // setTimeout(() => {
    //   this.onValueChange();
    // }, 100);
  }

  onValueChange() {
    if (!this.formGenerator) {
      return;
    }
    const formValues = this.formGenerator.getValues();
    const logics = this.state.logics;
    let fieldsToHide = [];

    const logicResolver = new LogicResolver();
    fieldsToHide = logicResolver.getFieldsToHide(
      formValues,
      logics,
      this.state.form
    );

    // let make copy of originl form
    let fields = JSON.parse(JSON.stringify(this.state.orginalForm));

    // remove hidden fields from array
    fields.forEach((item, index) => {
      if (fieldsToHide.includes(item.key)) {
        fields.splice(index, 1);
      }
    });

    this.setState({ form: fields });
  }

  login() {
    const formValues = this.formGenerator.getValues();
    console.log("FORM VALUES", formValues);
  }
  render() {
    if (!this.state.form)
      return (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      );
    return (
      <Root>
      {/* <StyleProvider style={getTheme()}> */}
        <View style={styles.wrapper}>
          <ScrollView>
            <GenerateForm
              ref={c => {
                this.formGenerator = c;
              }}
              customComponents={customFields}
              scrollViewProps={{ scrollEnabled: false }}
              onValueChange={name => this.onValueChange(name)}
              theme={theme}
              fields={this.state.form}
              logics={this.state.logics}
              orginalForm={this.state.orginalForm}
            />

            <View style={styles.submitButton}>
              <Button block onPress={() => this.login()}>
                <Text>Submit</Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      {/* </StyleProvider> */}
      </Root>
    );
  }
}