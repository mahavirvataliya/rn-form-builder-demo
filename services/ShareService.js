import RNFetchBlob from 'rn-fetch-blob';
import {
  DeviceEventEmitter,
} from 'react-native';
import Share from 'react-native-share';

import { Platform } from 'react-native';
import ViewerService from './Viewer';

const isIOS = Platform.OS === 'ios';

let isFileOpen = false;
const openToken = {};

function getLocalPath(url, file, filename = null) {
  if (filename === null) {
    filename = getFileName(url, file);
  }
  return `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`;
}

function getFileName(url, file) {
  let filename;
  const fileUrl = file.attachments || file.file || file.value || file.fileURL;
  if (fileUrl) {
    filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.length);
  }
  return `${filename}`;
}

const shareFile = async (file) => {
  let cancelled = false;

  console.log('1. File', file);
  openToken.cancel = () => {
    cancelled = true;
  };

  function wrapWithCancel(fn) {
    return (data, fs) => {
      if (!cancelled) {
        return fn(data, fs);
      }
      return 'canceled';
    };
  }

  try {
    const url = file.fileURL;
    if (url == null || url === undefined) {
      return;
    }

    const downloadedFilePath = getLocalPath(url, file);
    const isFileExists = await RNFetchBlob.fs.exists(downloadedFilePath);
    
    if (isFileExists && file) {
      file.path = downloadedFilePath;
      file.name = getFileName(url, file);
      shareLocalFile(file);
      console.log('**. Already Downloaded File', file);
      return;
    }

    const isDownloaded = await ViewerService.downloadFile(file);
    console.log('Downloaded', isDownloaded);
    if (isDownloaded) {
      setTimeout(async () => {
        console.log('FILE BEFORE OPEN...', file);
        file.path = downloadedFilePath;
        file.name = getFileName(url, file);
        await wrapWithCancel(shareLocalFile)(file);
      }, 1000);
    } 

    if (cancelled) {
      // eslint-disable-next-line no-throw-literal
      throw { reason: 'Canceled' };
    }
  } catch (error) {
    console.log(error);
  }
};

const shareLocalFile = async (file) => {
  let path = file.path;
  const isFileExists = await RNFetchBlob.fs.exists(file.path);

  const options = {
    url: path,
  };
  console.log('2. File', file, path);
  if (file.name) {
    options.message = file.name;
  }

  if (isFileExists && file) {
    try {
      const fileShared = await Share.open(options);
      if (fileShared) {
        console.log('3. File opened');
      }
      return true;
    } catch (error) {
      console.log(error);
      console.log('3. File Share error');
      return false;
    }
  }
  return false;
};

const ShareService = {
  shareFile,
  shareLocalFile,
};

export default ShareService;
