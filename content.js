InboxSDK.load('1', 'sdk_process_c2e2d66213').then(sdk =>{

  const composeViews = new Set();
  init();

  function garbageCollectEmailComposeViews() {
    sdk.Compose.registerComposeViewHandler(composeView => {
      composeViews.add(composeView);
      composeView.on('destroy', () => {
        composeViews.delete(composeView);
      });
    });
  }

  function addCSStoPage() {
    var cssFile = chrome.extension.getURL('styles.css');
    var css = $('<link rel="stylesheet" type="text/css">');
    css.attr('href', cssFile);
    $('head').first().append(css);
  }

  function addToolBarButton() {
    sdk.Toolbars.addToolbarButtonForApp({
      title: 'ProcessPure',
      iconUrl: 'http://processpure.co/wp-content/uploads/2017/11/processpure.png',
      onClick: function (event) {
        event.dropdown.el.innerHTML = '<p><a class="process-pure-support-link" href="https://app.processpure.co" target="_blank">💰 My Opportunites</a></p><p class="process-pure-support-link"><a id="pp-support">📧 Support & Feedback</a></p>';
        addClickHandlerToSupportButton();
      }
    });
  }

  function addClickHandlerToSupportButton() {
    document.getElementById('pp-support').addEventListener('click', event => {
      sdk.Compose.openNewComposeView().then(() => {
        const composeView = getActiveComposeView();
        if (!composeView) { return; }
        composeView.setSubject('Help me!');
        composeView.setToRecipients(['ryan@processpure.co']);
      });
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
    addCSStoPage();
    addToolBarButton();
    garbageCollectEmailComposeViews();
  }

});
