import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import PermissionsService from './Permissions';
import { ActionSheet, Toast } from "native-base";
import RNFetchBlob from 'rn-fetch-blob';
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return { size: 0, type: sizes[0] };
  const i = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`, 0);
  // eslint-disable-next-line no-restricted-properties
  return { size: Math.round(bytes / Math.pow(1024, i)), type: sizes[i] };
}

const startDocumentSelection = async (options) => new Promise((resolve, reject) => {
  try {
    DocumentPicker.pickMultiple({
      type: [DocumentPicker.types.allFiles],
    }).then((results) => {
      const images = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const res of results) {
        console.log(
          res.uri,
          res.type, // mime type
          res.name,
          res.size,
        );

        let isFile = true;
        let isImage = false;
        if (res.type.includes('png') || res.type.includes('jpg') || res.type.includes('jpeg')) {
          isFile = false;
          isImage = true;
        }
        const file = {
          size: res.size,
          mime: res.type,
          height: '',
          width: '',
          path: res.uri,
          isFile,
          isImage,
          name: res.name,
        };
        images.push(file);

        resolve(images);
      }
    }).catch((err) => {
      console.log('Error in Doc Picker', err);
      if (DocumentPicker.isCancel(err)) {
        resolve([]);
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    });
  } catch (error) {
    reject(error);
  }
});


const startImageSelection = async (options) => {
  try {
    if (!(await PermissionsService.hasPhotoPermission())) {
      return [];
    }
    let imagesSelected = await ImagePicker.openPicker({
      multiple: options.multiple,
      // cropping: isAvatar, // !isMultiple,
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 400,
      compressImageQuality: 0.7,
      // cropperCircleOverlay: isAvatar,
      forceJpg: true,
      mediaType: options.mediaType,
      maxFiles: options.maxFiles,
    });

    let maxExceeds = false;
    let lengthExceeds = false;

    if (options.multiple) {
      const promises = imagesSelected.map(image => getFileName(image.path));
      const filenames = await Promise.all(promises);
      
      imagesSelected.forEach((image, index, object) => {
        const fileSize = bytesToSize(image.size);
        if (fileSize.type === 'MB' && fileSize.size > options.maxFileSize) {
          maxExceeds = true;
          object.splice(index, 1);
        }

        image.isImage = true;

        image.name = filenames[index];
        if (isIOS) {
          image.name = image.filename;
        }
        
      });

      if (imagesSelected.length > options.maxFiles) {
        imagesSelected = imagesSelected.slice(0, options.maxFiles);
        lengthExceeds = true;
      }

      if (maxExceeds) {
        Toast.show({
          text: `Maximum size is ${options.maxFileSize}MB!`,
        })
      }

      if (lengthExceeds) {
        Toast.show({
          text: `You cannot upload more than ${options.maxFiles} images at a time`,
        })
      }      
    } else {
      const images = [];
      if (imagesSelected.length > options.maxFiles) {
        Toast.show({
          text: `Maximum size is ${options.maxFileSize}MB!`,
        })
        return images;
      }
      const imageFile = await RNFetchBlob.fs.stat(imagesSelected.path);
      imagesSelected.name = imageFile.filename;
      if (isIOS) {
        imagesSelected.name = imagesSelected.filename;
      }
      imagesSelected.isImage = true;
      images.push(imagesSelected);
      return images;
    }

    return imagesSelected;
  } catch (error) {
    if (error.code === 'E_PICKER_CANCELLED') {
      return [];
    }
    throw error;
  }
};

const startCameraCapture = async (options) => {
  try {
    if (!(await PermissionsService.hasCameraPermission())) {
      return [];
    }
    const images = [];
    const image = await ImagePicker.openCamera({
      width: 300,
      height: 400,
      compressImageQuality: 0.8,
      forceJpg: true,
      mediaType: options.mediaType,
      // cropping: isAvatar,
      // cropperCircleOverlay: isAvatar,
    });

    image.isImage = true;
    const imageFile = await RNFetchBlob.fs.stat(image.path);
    image.name = imageFile.filename;
    images.push(image);

    return images;
  } catch (error) {
    if (error.code === 'E_PICKER_CANCELLED') {
      return [];
    }
    throw error;
  }
};

const pickFile = async (
  imageOnly = false,
  multiple = false,
  mediaType = 'photo',  // photo, video, any
  maxFileSize = 80, //In MB
  maxFiles = 5) => new Promise((resolve, reject) => {

  const pickOptions = ['Camera', 'Gallary', 'Documents', 'Cancel'];

  const options = {
      title: 'File select options',
      imageOnly,
      multiple,
      maxFiles,
      maxFileSize, // in MB
      mediaType
  };

  if(imageOnly) {
    options.title = 'Image select options';
  }

  if(options.imageOnly) {
    pickOptions.splice(2, 1);
  }

  const cancelButtonIndex = (pickOptions.length - 1);

  const actionOptions = {
    title: options.title,
    options: pickOptions,
    cancelButtonIndex: cancelButtonIndex,
  };

  ActionSheet.show(actionOptions,
  async (i) => {
    if (i === cancelButtonIndex) {
      return;
    }
    if (i === 0) {
      try {
        const cameraImages = await startCameraCapture(options);
        resolve(cameraImages);

      } catch (e) {
        reject(e);
      }
    } else if (i === 1) {
      try {
        const pickedImage = await startImageSelection(options);
        resolve(pickedImage);
      } catch (e) {
        reject(e);
      }
    } else if (i === 2) {
      try {
        const documents = await startDocumentSelection(options);
        resolve(documents);
      } catch (e) {
        reject(e);
      }
    }
  });
});


const profileActions = async (hasAvatar = false,
  onAvatarRemoveCallback = () => { }, onImageSelectCallback = () => { }) => {
  let options = ['Take Photo', 'Photos', 'Cancel'];
  let cancelButtonIndex = 2;

  if (hasAvatar) {
    options = ['Take Photo', 'Photos', 'Remove', 'Cancel'];
    cancelButtonIndex = 3;
  }
  ActionSheet.show({
    title: 'Set a profile photo',
    options,
    cancelButtonIndex,
  },
  async (i) => {
    if (i === 0) {
      try {
        const cameraImages = await startCameraCapture(true);
        if (cameraImages.length) {
          onImageSelectCallback(cameraImages[0]);
        }
      } catch (e) { }
    } else if (i === 1) {
      try {
        const pickedImage = await startImageSelection(false, true);
        if (pickedImage.length) {
          onImageSelectCallback(pickedImage[0]);
        }
      } catch (e) { }
    } else if (i === 2) {
      if (hasAvatar) {
        onAvatarRemoveCallback();
      }
    }
  });
};

const getFileName = async (path) => {
  const file = await RNFetchBlob.fs.stat(path);
  return file.filename;
};


const FilePickerService = {
  pickFile,
  profileActions,
  startCameraCapture,
  startImageSelection,
  startDocumentSelection,
};

export default FilePickerService;
