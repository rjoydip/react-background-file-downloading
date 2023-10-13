import {
  RESET,
  COMPLETE_DOWNLOAD,
  DOWNLOAD_ERROR,
  START_DOWNLOAD,
  UPDATE_PROGRESS,
} from './actionTypes';

export const startDownloadWithoutWorker = (downloadUrl) => {
  return async (dispatch) => {
    try {
      dispatch({ type: START_DOWNLOAD });

      // Perform the download using fetch or any other suitable library
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const totalSize = Number(response.headers.get('content-length'));
      let downloadedSize = 0;

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        downloadedSize += value.length;
        const downloadProgressNumber = (downloadedSize / totalSize) * 100;

        dispatch({
          type: UPDATE_PROGRESS,
          progress: !isNaN(downloadProgressNumber) ? 0 : downloadProgressNumber,
        });
      }

      dispatch({ type: COMPLETE_DOWNLOAD });
    } catch (error) {
      dispatch({ type: DOWNLOAD_ERROR, error: error.message });
    }
  };
};

export const startDownloadWithWorker = (downloadUrl) => {
  return async (dispatch) => {
    let downloadProgressNumber = 0;

    const cleanupWorker = (worker) => {
      worker.terminate();
      window.removeEventListener('beforeunload', () => {
        console.log('Removed event listener');
      });
    };

    const workerCode = `
    onmessage = async (event) => {
      if (event.data.type === "startDownload") {
        const { downloadUrl } = event.data;

        try {
          const response = await fetch(downloadUrl);

          const totalSize = Number(response.headers.get('content-length'));
          let downloadedSize = downloadProgress = 0;

          const reader = response.body.getReader();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Download completed
              self.postMessage({ type: 'complete' });
              break;
            } else {
              downloadedSize += value.length;
              downloadProgress = (downloadedSize / totalSize) * 100;

              // TODO: comment out below code because it was intentionally added just to test the navigation
              await new Promise(r => setTimeout(r, 2000));

              // Send progress update to the main thread
              self.postMessage({ type: 'progress', progress: downloadProgress });
            }
          }
        } catch (error) {
          console.error('Download error:', error);
        }
      }
    };    
  `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerURL = URL.createObjectURL(blob);
    const worker = new Worker(workerURL);

    try {
      dispatch({ type: START_DOWNLOAD });

      worker.onmessage = (e) => console.log(e.data);
      worker.postMessage({ type: 'startDownload', downloadUrl });

      worker.onmessage = (event) => {
        if (event.data.type === 'progress') {
          downloadProgressNumber = event.data.progress;
          dispatch({
            type: UPDATE_PROGRESS,
            progress: !isNaN(downloadProgressNumber)
              ? 0
              : downloadProgressNumber,
          });
        } else if (event.data.type === 'complete') {
          console.log('completed');
          dispatch({ type: COMPLETE_DOWNLOAD });
          cleanupWorker(worker);
        } else {
        }
      };

      window.addEventListener('beforeunload', (e) => {
        if (downloadProgressNumber > 0) {
          e.returnValue =
            'Download is in progress. Are you sure you want to leave?';
          dispatch({ type: DOWNLOAD_ERROR, error: e.returnValue });
          cleanupWorker(worker);
        }
      });
    } catch (error) {
      dispatch({ type: DOWNLOAD_ERROR, error: error.message });
      cleanupWorker(worker);
    }
  };
};

export const reset = () => {
  return async (dispatch) => {
    dispatch({ type: RESET });
  };
};
