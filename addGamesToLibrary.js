const playwright = require("playwright");

const launchBrowser = async () => {
  const launchOptions = {
    headless: false,
    channel: "chrome",
  };

  const userDataDir = "/home/tomeraz/.config/google-chrome";
  const browser = await playwright.chromium.launchPersistentContext(
    userDataDir,
    {
      ignoreDefaultArgs: true,
      // ignoreDefaultArgs: ["--no-first-run"],
      channel: "chrome",
      headless: false,
      // slowMo: 1000,
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

  return browser;
};

const getGames = async (browser) => {
  const page = await browser.newPage();
  await page.goto("https://www.playstation.com/en-us/ps-plus/games/");
  const gameCssSelector =
    ".autogameslist div.contentgrid:has(h3.txt-block-paragraph__title) p.txt-style-base";
  const games = await page.$$eval(gameCssSelector, (gameNodes) => {
    return Array.from(gameNodes, (node) => node.innerText);
  });

  // list games
  games.forEach((game) => console.log(game));

  return games;
};

const addGames = async (browser, games) => {
  // for all games
  for (const game of games) {
    try {
      // search game
      const page = await browser.newPage();
      const searchUrl = `https://store.playstation.com/en-us/search/${game}`;
      await page.goto(searchUrl);

      // if game is included in playstation plus subscription
      const includedGames = await page.getByRole("listitem", { hasText: "Included"})
        .filter({ has: page.locator("span.psw-icon--ps-plus") });
      const includedGamesCount = await includedGames.count();

      if (includedGamesCount > 0) {
        // enter game page
        await includedGames.first().click();

// =====
// This causes some weird loop of scrolling without actually clicking the correct button.
// =====

        // add game to library
        // inspired by: https://stackoverflow.com/a/75548169
        await page.getByRole("article")
          .filter({ hasText: "Included with the Game Catalog in your PlayStation Plus subscription"})
          .locator("button")
          .filter({ hasText: "Add to Library"})
          .first()
          .click();
     await new Promise((r) => setTimeout(r, 30000));

        // const nisuy = await page.locator("text=Included with the Game Catalog in your PlayStation Plus subscription");
        // const addToLibrary = await page.locator("text=Add to Library");
        // if (addToLibrary) {
        //   // only add to library the game next to included in plus subscription yellow text
        //   await page.getByText("Add to Library").first().click();
        // }
      }

      // close page
      await page.close();
    } catch (error) {
      console.error(`Error adding the game '${game}'`);
      throw error;
    }
  }
};

const filterGames = (allGames) => {
  const gameToContinueFrom = "Outriders";
  let games;
  if (gameToContinueFrom) {
    games = allGames.slice(
      allGames.findIndex((game) => game == gameToContinueFrom),
    );
  } else {
    // !gameToContinueFrom
    games = allGames;
  }

  return games;
};

(async () => {
  const browser = await launchBrowser();
  const allGames = await getGames(browser);
  // const games = filterGames(allGames);
  games = ["Outriders"];

  await addGames(browser, games);

  await new Promise((r) => setTimeout(r, 30000));
  await browser.close();
})();
