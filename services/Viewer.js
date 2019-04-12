import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import {
  DeviceEventEmitter,
} from 'react-native';

import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

let isFileOpen = false;
const openToken = {};

function getFileName(url, file) {
  let filename;
  const fileUrl = file.attachments || file.file || file.value || file.fileURL;
  if (fileUrl) {
    filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.length);
  }
  return `${filename}`;
}

function getLocalPath(url, file, filename = null) {
  if (filename === null) {
    // eslint-disable-next-line no-param-reassign
    filename = getFileName(url, file);
  }
  // return `${RNFS.DocumentDirectoryPath}/${filename}`;
  return `${RNFetchBlob.fs.dirs.DocumentDir}/${filename}`;
}

const openFile = async (downloadedFilePath, file) => {
  const isFileExists = await RNFetchBlob.fs.exists(downloadedFilePath);

  const options = {
    showAppsSuggestions: true,
    showOpenWithDialog: true,
  };
  console.log('2. File', file, downloadedFilePath);
  if (file.name) {
    options.displayName = file.name;
  }

  if (isFileExists && file) {
    try {
      const fileOpend = await FileViewer.open(downloadedFilePath, options);
      if (fileOpend) {
        isFileOpen = true;
      }
      console.log('3. File opened');

      return true;
    } catch (error) {
      console.log(error);
      console.log('3. File opened error');
      return false;
    }
  }
  return false;
};

const downloadFile = async (file) => {
  try {
    if (file == null || file === undefined) {
      return false;
    }
    const url = file.fileURL;
    if (url == null || url === undefined) {
      return false;
    }
    const downloadedFilePath = getLocalPath(url, file);
    const downloadedFileName = getFileName(url, file);
    const dateString = getCurrentDateTimeString();
    const downloadingFilename = dateString + downloadedFileName;
    const downloadingPath = getLocalPath(url, file, downloadingFilename);

    console.log(url);
    const res = await RNFetchBlob
      .config({
        path: downloadingPath,
        fileCache: false,
      })
      .fetch('GET', url, {
        'Cache-Control': 'no-store',
      })
      .progress({ interval: 5, count: 5 }, (received, total) => {
        const progress = Math.round((received / total) * 100) / 100;
        DeviceEventEmitter.emit('downloadProgress', { progress });
        console.log('progress', progress);
      });
    const moved = await RNFetchBlob.fs.mv(downloadingPath, downloadedFilePath);
    console.log('Path as : ', downloadingPath);
    console.log(moved, 'The file saved to ', res.path());
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const cancelFileOpen = () => {
  if (openToken !== {}) {
    console.log('cancel called');
    openToken.cancel();
  }
};

const viewFile = async (file) => {
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
    if (await openFile(downloadedFilePath, file)) {
      console.log('**. Already Downloaded File', file);
      return;
    }
    DeviceEventEmitter.emit('showGlobalLoader', { isLoaderVisible: true });

    const isDownloaded = await downloadFile(file);
    console.log('Downloaded', isDownloaded);
    if (isDownloaded) {
      DeviceEventEmitter.emit('showGlobalLoader', { isLoaderVisible: false });
      setTimeout(async () => {
        console.log('FILE BEFORE OPEN...', file);
        await wrapWithCancel(openFile)(downloadedFilePath, file);
      }, 1000);
    } else {
      DeviceEventEmitter.emit('showGlobalLoader', { isLoaderVisible: false });
    }

    if (cancelled) {
      // eslint-disable-next-line no-throw-literal
      throw { reason: 'Canceled' };
    }
  } catch (error) {
    DeviceEventEmitter.emit('showGlobalLoader', { isLoaderVisible: false });
    console.log(error);
  }
};

const viewLocalFile = async (file) => {
  let path = file.path;
  const isFileExists = await RNFetchBlob.fs.exists(file.path);

  const options = {
    showAppsSuggestions: true,
    showOpenWithDialog: true,
  };
  console.log('LOCAL. File', file, path);
  if (file.name) {
    options.displayName = file.name;
  }

  options.onDismiss = () => {
    console.log('Viewer Dismissed')
  };

  if(!isIOS && path && String(path).startsWith('file:///')) {
    path = path.replace('file:///', '/');
  }

  if (isFileExists && file) {
    try {
      const fileOpend = await FileViewer.open(path, options);
      if (fileOpend) {
        console.log('3. File opened');
      }
      return true;
    } catch (error) {
      console.log(error);
      console.log('3. File opened error');
      return false;
    }
  }
  return false;
};

const getCurrentDateTimeString = () => {
  let today = new Date();
  const dd = today.getDate();
  let mm = today.getMonth()+1; 
  const yyyy = today.getFullYear();
  const time = today.getTime();
  if(dd < 10) {
      dd= '0' + dd;
  } 
  if (mm < 10) {
      mm = '0' + mm;
  } 
  today = dd + '_' + mm + '_' + yyyy + '_ ' + time;
  return today;
}

const ViewerService = {
  viewFile,
  viewLocalFile,
  openFile,
  downloadFile,
  cancelFileOpen,
  isFileOpen,
};

export default ViewerService;
