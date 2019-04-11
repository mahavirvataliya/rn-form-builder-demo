import Permissions from 'react-native-permissions';
import { Alert, Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

function showAlert(msg) {
  Alert.alert(
    '',
    msg,
    [
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ],
  );
}

const requestPermissions = async () => {
  try {
    const response = await Permissions.checkMultiple(['camera', 'photo', 'microphone', 'location']);
    let camera;
    let photo;
    let microphone;
    let location;
    if (response.camera !== 'authorized') {
      camera = await Permissions.request('camera');
    }
    if (response.photo !== 'authorized') {
      photo = await Permissions.request('photo');
    }
    if (response.microphone !== 'authorized') {
      microphone = await Permissions.request('microphone');
    }
    if (response.location !== 'authorized') {
      location = await Permissions.request('location');
    }
    OneSignal.registerForPushNotifications();

    if (camera === 'denied' || photo === 'denied' || microphone === 'denied' || location === 'denied') {
      // showAlert('You will not be able to complete task.');
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const requestLocationPermissions = async () => {
  try {
    const response = await Permissions.check('location', { type: 'whenInUse' });
    let location;
    if (response !== 'authorized') {
      location = await Permissions.request('location');
    }
    if (location === 'denied') {
      // showAlert('You will not be able to access location');
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const requestVideoCapturePermissions = async (withAlert = true) => {
  try {
    const response = await Permissions.checkMultiple(['camera', 'microphone']);
    let camera;
    let microphone;
    if (response.camera !== 'authorized') {
      camera = await Permissions.request('camera');
    }
    if (response.microphone !== 'authorized') {
      microphone = await Permissions.request('microphone');
    }
    if (camera === 'denied' || microphone === 'denied') {
      // showAlert('You will not be able to capture video.');
      if (withAlert) {
        showAlert('Permission not granted for video. You will not able to capture video in this application.');
      }
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};


const hasCameraPermission = async (withAlert = true) => {
  try {
    const response = await Permissions.checkMultiple(['camera']);
    let camera;
    if (response.camera !== 'authorized') {
      camera = await Permissions.request('camera');
    }

    if (camera === 'denied') {
      if (withAlert) {
        showAlert('Permission not granted for camera. You will not able to use camera in this application.');
      }
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const hasPhotoPermission = async (withAlert = true) => {
  try {
    const response = await Permissions.checkMultiple(['photo']);
    let photo;
    if (response.photo !== 'authorized') {
      photo = await Permissions.request('photo');
    }
    if (photo === 'denied') {
      if (withAlert) {
        showAlert('Permission not granted for photos. You will not able to get photos in this application.');
      }
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const hasPermissions = async () => {
  try {
    const response = await Permissions.checkMultiple(['camera', 'photo', 'microphone', 'location']);
    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
};


const showMediaPermissionAlert = async () => {
  const response = await Permissions.checkMultiple(['camera', 'photo', 'microphone']);
  const camera = response.camera === 'authorized';
  const photo = response.photo === 'authorized';
  const microphone = response.microphone === 'authorized';
  let message = 'Permission not granted for media.\nYou will not able to access:';
  if (!camera) {
    message += '\n1. Camera Capture';
  }
  if (!camera || !microphone) {
    message += '\n2. Video Capture';
  }

  if (!photo) {
    message += '\n3. Photos';
  }
  if (!camera || !microphone || !photo) {
    Alert.alert(
      '',
      message,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
    );
    return false;
  }
  return true;
};

const PermissionsService = {
  requestPermissions,
  hasPermissions,
  hasCameraPermission,
  hasPhotoPermission,
  requestLocationPermissions,
  requestVideoCapturePermissions,
  showMediaPermissionAlert,
};

export default PermissionsService;
