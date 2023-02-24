const playwright = require("playwright");

(async () => {
  const launchOptions = {
    headless: false,
    channel: "chrome",
  };

  const userDataDir = "/home/tomeraz/.config/google-chrome";
  const browser = await playwright.chromium.launchPersistentContext(
    userDataDir,
    {
      ignoreDefaultArgs: true,
      channel: "chrome",
      headless: false,
      args: [
        "--disable-field-trial-config",
        "--disable-background-networking",
        "--enable-features=NetworkService,NetworkServiceInProcess",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-back-forward-cache",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-extensions-with-background-pages",
        "--disable-component-update",
        "--no-default-browser-check",
        "--disable-default-apps",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-features=ImprovedCookieControls,LazyFrameLoading,GlobalMediaControls,DestroyProfileOnBrowserClose,MediaRouter,DialMediaRouteProvider,AcceptCHFrame,AutoExpandDetailsElement,CertificateTransparencyComponentUpdater,AvoidUnnecessaryBeforeUnloadCheckSync,Translate",
        "--allow-pre-commit-input",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-sync",
        "--force-color-profile=srgb",
        "--metrics-recording-only",
        "--no-first-run",
        "--enable-automation",
        // "--password-store=basic",
        "--use-mock-keychain",
        "--no-service-autorun",
        "--export-tagged-pdf",
        "--no-sandbox",
        "--start-maximized",
        "--user-data-dir=/home/tomeraz/.config/google-chrome",
        "--remote-debugging-pipe",
      ],
      no_viewport: true,
    },
  );

  const page = await browser.newPage();
  await page.goto("https://www.playstation.com/en-us/ps-plus/games/");
  const gameCssSelector =
    ".autogameslist div.contentgrid:has(h3.txt-block-paragraph__title) p.txt-style-base";
  const games = await page.$$eval(gameCssSelector, (gameNodes) => {
    return Array.from(gameNodes, (node) => node.innerText);
  });

  for (const game of games) {
    const searchUrl = `https://www.playstation.com/en-us/search/?q=${game}&category=games`;
    await page.goto(searchUrl);
    const isAddToLibrary = await page.isVisible("text='Add to Cart'");
    if (isAddToLibrary) {
      await page
        .getByRole("button", { name: "Add to Library" })
        .first()
        .click();
    }
  }

  await new Promise((r) => setTimeout(r, 30000));
  await browser.close();
})();
