//import liraries
import React, { Component } from 'react';
import { View, StyleSheet, Image, ListView } from 'react-native';
import PropTypes from 'prop-types';
import FilePickerService from '../../services/FilePicker';
import { Container, Header, Content, List, Icon, ListItem, Thumbnail, Text, Left, Body, Right, Button } from 'native-base';
import ViewerService from '../../services/Viewer';


// create a component
class VideoField extends Component {

  static propTypes = {
    attributes: PropTypes.object,
    theme: PropTypes.object,
    updateValue: PropTypes.func,
    onSummitTextInput: PropTypes.func,
    ErrorComponent: PropTypes.func,
  }

  state = {
    images: [],
  }

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      basic: true,
      images: [],
    };
  }

  handleChange(text) {
    // this.props.updateValue(this.props.attributes.name, text);
  }

  deleteRow(secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow();
    const newData = [...this.state.images];
    newData.splice(rowId, 1);
    this.setState({ images: newData });
    this.props.updateValue(this.props.attributes.name, newData);
    
  }

  onAttachPress = async () => {
   const imagesX = await FilePickerService.pickFile(true, false, 'video');

   if(imagesX && imagesX.length == 0) {
     return;
   }
   imagesX.forEach(image => {
     image.isLocal = true;
   });
   this.setState({
     images: imagesX,
   })

   this.props.updateValue(this.props.attributes.name, this.state.images);
  }

  onViewPress = (image) => {

    if (image.isLocal) {
      ViewerService.viewLocalFile(image);
      return;
    }
    ViewerService.viewFile(image);

  }

  renderImageList = () => {
    return (
        <List
            leftOpenValue={0}
            rightOpenValue={-75}
            dataSource={this.ds.cloneWithRows(this.state.images)}
            renderRow={image =>
              <ListItem thumbnail>
                <Left style={{ paddingLeft: 18 }}>
                  <Thumbnail square source={{ uri: image.path  }} />
                </Left>
                <Body>
                  <Text>{image.name}</Text>
                </Body>
                <Right>
                  <Button transparent onPress={() => this.onViewPress(image)}>
                    <Text>View</Text>
                  </Button>
                </Right>
              </ListItem>}
            // renderLeftHiddenRow={data => 
            //   <Button full onPress={() => alert(data)}>
            //     <Icon active name="information-circle" />
            //   </Button>}
            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
              <Button full danger onPress={_ => this.deleteRow(secId, rowId, rowMap)}>
                <Icon active name="trash" />
              </Button>}
          />
    );
  }

  render() {
    const { theme, attributes, ErrorComponent } = this.props;
    return (
      <View style={styles.container}>
        <List>
        <ListItem icon>
          <Body>
            <Text style={styles.labelStyle} onPress={() => { this.handleChange("hello") }}>{`${attributes.label}`}</Text>
          </Body>
          <Right >
            <Button small info bordered onPress={() => this.onAttachPress()}>
              <Text style={{ alignSelf: 'center' }}>{this.state.images.length ? 'Change' : 'Attach'}</Text>
            </Button>
          </Right>
        </ListItem>
        </List>
        {this.renderImageList()}
        <ErrorComponent {...{ attributes, theme }} />
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0
  },
  labelStyle: {
    padding: 5,
    paddingLeft: 0,
    paddingTop: 0,
    fontSize: 16,
  }
});

//make this component available to the app
export default VideoField;
