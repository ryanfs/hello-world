InboxSDK.load('1', 'sdk_process_c2e2d66213').then(sdk =>{

  const composeViews = new Set();
  init();

  function openIframeModal() {
    var iframe = document.createElement('iframe');
    iframe.onload = function() {
      iframe.contentWindow.postMessage("greeting", "*");
    };
    function modalMessageHandler(event) {
      if (event.origin.match(/^chrome-extension:\/\//)) {
        //make sure that the message is coming from an extension and you can get more strict that the
        //extension id is the same as your public extension id
        if (event.data === 'close') {
          console.log('got close event from iframe');
          //modal.close();
        }
      }
    }
    window.addEventListener('message', modalMessageHandler, false);
    iframe.src = chrome.runtime.getURL('iframe.html'); //load the iframe.html that is in the extension bundle

    var modal = sdk.Modal.show({
      el: iframe
    });
    modal.setTitle('ProcessPure Opportunites');
    modal.on('destroy', function() {
      window.removeEventListener('message', modalMessageHandler, false);
    });
  }

  function garbageCollectEmailComposeViews() {
    sdk.Compose.registerComposeViewHandler(composeView => {
      composeViews.add(composeView);
      composeView.on('destroy', () => {
        composeViews.delete(composeView);
      });
    });
  }

  function addToolBarButton() {
    sdk.Toolbars.addToolbarButtonForApp({
      title: 'ProcessPure',
      iconUrl: 'http://processpure.co/wp-content/uploads/2017/11/processpure.png',
      onClick: function (event) {
        event.dropdown.el.innerHTML = '<p><a class="process-pure-support-link" id="pp-opportunities">💰 My Opportunites</a></p><p class="process-pure-support-link"><a id="pp-support">📧 Support & Feedback</a></p>';
        addClickHandlerToLinks();
      }
    });
  }

  function addClickHandlerToLinks() {
    document.getElementById('pp-support').addEventListener('click', event => {
      sdk.Compose.openNewComposeView().then(() => {
        const composeView = getActiveComposeView();
        if (!composeView) { return; }
        composeView.setSubject('Help me!');
        composeView.setToRecipients(['ryan@processpure.co']);
      });
    });
    document.getElementById('pp-opportunities').addEventListener('click', event => {
      openIframeModal();
    });
  }

  function getActiveComposeView() {
    // thank you Chris Cowan! https://groups.google.com/forum/#!topic/inboxsdk/4CmyKsstGzU
    const nonMinimizedComposeViews = Array.from(composeViews).filter(composeView => !composeView.isMinimized());
    if (document.activeElement) {
      for (let composeView of nonMinimizedComposeViews) {
        if (composeView.getBodyElement().contains(document.activeElement)) {
          return composeView;
        }
      }
    }
    return nonMinimizedComposeViews[0];
  }

  function init() {
    addToolBarButton();
    garbageCollectEmailComposeViews();
  }

});
