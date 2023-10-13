import {
  RESET,
  COMPLETE_DOWNLOAD,
  DOWNLOAD_ERROR,
  START_DOWNLOAD,
  UPDATE_PROGRESS,
} from './actionTypes';

const initialState = {
  downloadProgress: 0,
  downloadStatus: 'idle', // or 'inProgress', 'completed', 'error'
  downloadError: null,
};

const downloadReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_DOWNLOAD:
      return {
        ...state,
        downloadProgress: 0,
        downloadStatus: 'inProgress',
      };
    case UPDATE_PROGRESS:
      return {
        ...state,
        downloadProgress: action.progress,
      };
    case COMPLETE_DOWNLOAD:
      return {
        ...state,
        downloadProgress: 100,
        downloadStatus: 'completed',
        downloadError: null,
      };
    case DOWNLOAD_ERROR:
      return {
        ...state,
        downloadProgress: 0,
        downloadStatus: 'error',
        downloadError: action.error,
      };
    case RESET:
      return {
        downloadProgress: 0,
        downloadStatus: 'idle',
        downloadError: null,
      };
    default:
      return state;
  }
};

export default downloadReducer;
