import { Workbox } from 'workbox-window';

const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('New version of the app is available.');
        if (confirm('New version of the app is available. Do you want to update?')) {
          window.location.reload();
        }
      }
    });

    wb.register();
  }
};

export default registerServiceWorker;
