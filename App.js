import React, { Component } from "react";
import { AppRegistry, ScrollView, ActivityIndicator } from "react-native";
import { View, Text, Button, StyleProvider } from "native-base";
import GenerateForm from "@infobizzs/rn-form-builder";
import getTheme from "./native-base-theme/components";
import LogicResolver from "./lib/logic-resolver";
import customFields from './lib/custom-fields';
import * as data from './data.json';
import { Root } from "native-base";
import { Container, Header, Left, Body, Right, Title } from 'native-base';
import RNFetchBlob from 'rn-fetch-blob'

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
      orginalForm: false,
      values: false,
    };
  }

  componentWillMount() {
   
  }

  componentDidMount() {
    // RNFetchBlob.fetch('GET',"http://192.168.0.128:8000/example")
    // .then(resp => resp.json())
    // .then(response => {
    //   this.setState({
    //     form: response.fields,
    //     logics: response.logic,
    //     orginalForm: response.fields,
    //     values: response.values
    //   });
    // });

    const response = data;
    this.setState({
      form: response.fields,
      logics: response.logic,
      orginalForm: response.fields,
      values: response.values
    });
    setTimeout(() => {
      // this.onValueChange();
    }, 100);
  }

  onValueChange(formFields) {
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
      }else{
        fields[index] = formFields[item.name]
      }
    });

    this.setState({ form: fields });  
  }

  onSubmit() {
    const formValues = this.formGenerator.getValues();
    console.log("FORM VALUES", formValues);
    let data = [];
    const names = Object.keys(formValues);
    names.forEach(name => {
      if(formValues[name] && formValues[name]['isLocal'])
      {
        data.push({
          name: name,
          filename: formValues[name]['filename'],
          data: RNFetchBlob.wrap(formValues[name]['path'])
        });
      } else {
        data.push({
          name: name,
          data: formValues[name]
        });
      }
    });
    console.log(formValues);
    RNFetchBlob.fetch('POST',"http://192.168.0.128:8000/api/example", {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
      'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjA4NDNhMzczNWUxMGJiZDcxODcyNjEyYjk3YmM5NmQyMWZhNTlkYzI1OWViM2MxNTM5NjkxMGY5ODhjMGFhMTY5NzQwYTEzZjM1YjM4MTdhIn0.eyJhdWQiOiIyIiwianRpIjoiMDg0M2EzNzM1ZTEwYmJkNzE4NzI2MTJiOTdiYzk2ZDIxZmE1OWRjMjU5ZWIzYzE1Mzk2OTEwZjk4OGMwYWExNjk3NDBhMTNmMzViMzgxN2EiLCJpYXQiOjE1NTU1MTA2MDIsIm5iZiI6MTU1NTUxMDYwMiwiZXhwIjoxNTg3MTMzMDAyLCJzdWIiOiIxIiwic2NvcGVzIjpbIioiXX0.HQHVQdQwMDLh_OAdQorHfV0mpOr7-z1hYdQj8wKwgc3QdBJpkiQeR5_J783EfdNllpo1cm1nB16i6RbV4Xt2qhJXo4OkRhs_h49OCgrUMh4blqYuMOc5i0xMX6NiKw_rJuajBDhhxoF8yJaJofUhb5zhtwgLEJx1fN5Ap6sMtI50FqmsuLkqy9IaxmBUHGA6chynV1Firz4oJ8pi--9uEjVR6yA7szhhsOgx7vvz-Uart6jFwqBpc9RWfcS4620S8yaIP7GOjbdCWsyeUmGLiB_eGaTOIHkLUmB-lWap9gV33R3IvUEfaiLRl7EUU1qpPBWOwlo1CbvCKP-GTE459iyhoWCFVg24PbEYWGrLgBf_EIgXzSPhHSo0MeHIpWVNyMBrGerbUxbk0KdqFRp3TwOAH0WFrKLgHVTKTGLhZcIqT124oD1PDKqO441fntCaKaNp5v0vMgfX8qIocCWGE6G51Zwc534_bkRJDviHlnS4vKlMQ6oirrJDpa-yIUQEur3slcS5M-He-LsX8yfgXoTEPe67s5zyHpIDUFZuJN1i57FaalS4s-FFBC1LIa8UbAvIQ2mkaKM_JalAX-eOFGpddQJ2_lC4aDni7mnScXk-HcJGbS0uoGvkD7fssM_kLliH_JvRs2gvWudKvudSNC_hz8mVCDeoQ4CCA6ePxv8`,
    },data)
    .then(response => {
      console.log("RESPONSE", response, response.json())
    }).catch(e => {
      console.log(e);
      
    });
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
              // onValueChange={name => this.onValueChange(name)}
              fields={this.state.form}
              logics={this.state.logics}
              orginalForm={this.state.orginalForm}
              formData={this.state.values}
            />

            <View style={styles.submitButton}>
              <Button block onPress={() => this.onSubmit()}>
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