// There should be a single listener which simply prints to the
// console. We will wrap that listener in our own listener.

const listeners = window._virtualConsole.listeners('jsdomError');
const originalListener = listeners && listeners[0];

window._virtualConsole.removeAllListeners('jsdomError');

// Add a new listener to swallow JSDOM errors that originate from clicks on anchor tags.
window._virtualConsole.addListener('jsdomError', (error) => {
  if (
    error.type !== 'not implemented' &&
    error.message !== 'Not implemented: navigation (except hash changes)' &&
    originalListener
    //original listener was called here
  ) {
    originalListener(error);
  }

  // swallow error
});
