const { logger } = require("../utils/logger");

/**
 * HTTP-based broker detection engine.
 * Each strategy fetches the broker's public search page and checks
 * whether results exist for the given name.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TIMEOUT = 15000;

async function safeFetch(url) {
  const resp = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(TIMEOUT),
    redirect: "follow",
  });
  if (!resp.ok) return { ok: false, error: "HTTP " + resp.status };
  return { ok: true, html: await resp.text() };
}

function makeStrategy(buildUrl, hasResultsFn, dataTypes) {
  return async function (firstName, lastName, state) {
    try {
      const url = buildUrl(firstName, lastName, state);
      const result = await safeFetch(url);
      if (!result.ok) return { detected: false, error: result.error };
      const detected = hasResultsFn(result.html);
      return {
        detected,
        profileUrl: detected ? url : null,
        dataFound: detected ? dataTypes : [],
      };
    } catch (e) {
      return { detected: false, error: e.message };
    }
  };
}

const slug = (f, l) => `${f}-${l}`.toLowerCase().replace(/\s+/g, "-");
const enc = (s) => encodeURIComponent(s);

const detectionStrategies = {
  // ─── Original 5 ───
  fastpeoplesearch: makeStrategy(
    (f, l, st) => `https://www.fastpeoplesearch.com/name/${slug(f, l)}${st ? "_" + st : ""}`,
    (html) => html.includes("listing-name") && !html.includes("did not return any results"),
    ["name", "address", "phone"]
  ),

  thatsthem: makeStrategy(
    (f, l) => `https://thatsthem.com/name/${slug(f, l)}`,
    (html) => html.includes("ThatsThem-people-record") || html.includes("result-list"),
    ["name", "address", "phone", "email"]
  ),

  nuwber: makeStrategy(
    (f, l) => `https://nuwber.com/search?name=${enc(f + " " + l)}`,
    (html) => html.includes("person-card") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  clustrmaps: makeStrategy(
    (f, l) => `https://clustrmaps.com/persons/${enc(f)}-${enc(l)}`,
    (html) => html.includes("person-item") || html.includes("search-results"),
    ["name", "address"]
  ),

  cyberbackgroundchecks: makeStrategy(
    (f, l) => `https://www.cyberbackgroundchecks.com/people/${enc(f)}-${enc(l)}`,
    (html) => html.includes("record-list") || html.includes("people-list"),
    ["name", "address", "phone", "relatives"]
  ),

  // ─── People Search Sites ───
  spokeo: makeStrategy(
    (f, l) => `https://www.spokeo.com/${enc(f)}-${enc(l)}`,
    (html) => html.includes("result-item") || html.includes("result_card") || html.includes("people-result"),
    ["name", "address", "phone", "email"]
  ),

  beenverified: makeStrategy(
    (f, l) => `https://www.beenverified.com/people/${slug(f, l)}/`,
    (html) => html.includes("card-block") || html.includes("people-results") || html.includes("person-card"),
    ["name", "address", "phone", "email"]
  ),

  whitepages: makeStrategy(
    (f, l) => `https://www.whitepages.com/name/${enc(f)}-${enc(l)}`,
    (html) => html.includes("serp-card") || html.includes("result-name") || html.includes("people-result"),
    ["name", "address", "phone"]
  ),

  truthfinder: makeStrategy(
    (f, l) => `https://www.truthfinder.com/results/?firstName=${enc(f)}&lastName=${enc(l)}`,
    (html) => html.includes("record-card") || html.includes("search-results") || html.includes("person-card"),
    ["name", "address", "phone", "email"]
  ),

  instantcheckmate: makeStrategy(
    (f, l) => `https://www.instantcheckmate.com/people/${slug(f, l)}/`,
    (html) => html.includes("result-card") || html.includes("record-card") || html.includes("search-result"),
    ["name", "address", "phone", "criminal"]
  ),

  intelius: makeStrategy(
    (f, l) => `https://www.intelius.com/people-search/${enc(f)}-${enc(l)}/`,
    (html) => html.includes("record-card") || html.includes("search-result") || html.includes("person-card"),
    ["name", "address", "phone", "relatives"]
  ),

  radaris: makeStrategy(
    (f, l) => `https://radaris.com/p/${enc(f)}/${enc(l)}/`,
    (html) => html.includes("card-block") || html.includes("person-info") || html.includes("profile-card"),
    ["name", "address", "phone", "social"]
  ),

  mylife: makeStrategy(
    (f, l) => `https://www.mylife.com/pub/name/${enc(f)}+${enc(l)}`,
    (html) => html.includes("reputation-score") || html.includes("profile-card") || html.includes("person-card"),
    ["name", "address", "reputation"]
  ),

  peoplefinder: makeStrategy(
    (f, l) => `https://www.peoplefinder.com/results.php?N=${enc(f)}+${enc(l)}`,
    (html) => html.includes("record-card") || html.includes("result-item") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  peoplesmart: makeStrategy(
    (f, l) => `https://www.peoplesmart.com/people/${slug(f, l)}/`,
    (html) => html.includes("result-card") || html.includes("search-result") || html.includes("person-item"),
    ["name", "address", "phone"]
  ),

  golookup: makeStrategy(
    (f, l) => `https://golookup.com/people-search/${slug(f, l)}`,
    (html) => html.includes("result-card") || html.includes("search-results") || html.includes("person-record"),
    ["name", "address", "phone"]
  ),

  peekyou: makeStrategy(
    (f, l) => `https://www.peekyou.com/${enc(f)}_${enc(l)}`,
    (html) => html.includes("result-card") || html.includes("search-result") || html.includes("entity-result"),
    ["name", "social", "email"]
  ),

  privateeye: makeStrategy(
    (f, l) => `https://www.privateeye.com/people/${slug(f, l)}/`,
    (html) => html.includes("record-card") || html.includes("result-item") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  searchpeoplefree: makeStrategy(
    (f, l) => `https://www.searchpeoplefree.com/find/${slug(f, l)}`,
    (html) => html.includes("result-card") || html.includes("people-result") || html.includes("record-list"),
    ["name", "address", "phone"]
  ),

  addressescom: makeStrategy(
    (f, l) => `https://www.addresses.com/people/${slug(f, l)}/`,
    (html) => html.includes("card-block") || html.includes("result-item") || html.includes("person-card"),
    ["name", "address"]
  ),

  publicrecordsnow: makeStrategy(
    (f, l) => `https://www.publicrecordsnow.com/people/${slug(f, l)}/`,
    (html) => html.includes("record-card") || html.includes("result-item") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  usapeoplesearch: makeStrategy(
    (f, l) => `https://www.usa-people-search.com/name/${enc(f)}-${enc(l)}/`,
    (html) => html.includes("result-card") || html.includes("person-card") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  ussearch: makeStrategy(
    (f, l) => `https://www.ussearch.com/people/${slug(f, l)}/`,
    (html) => html.includes("result-card") || html.includes("person-card") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  cubib: makeStrategy(
    (f, l) => `https://cubib.com/search/${enc(f)}+${enc(l)}`,
    (html) => html.includes("result-card") || html.includes("person-card") || html.includes("search-results"),
    ["name", "address"]
  ),

  checkpeople: makeStrategy(
    (f, l) => `https://checkpeople.com/result?firstName=${enc(f)}&lastName=${enc(l)}`,
    (html) => html.includes("result-card") || html.includes("search-result") || html.includes("person-card"),
    ["name", "address", "phone"]
  ),

  familytreenow: makeStrategy(
    (f, l) => `https://www.familytreenow.com/search/people?first=${enc(f)}&last=${enc(l)}`,
    (html) => html.includes("result-card") || html.includes("person-record") || html.includes("search-result"),
    ["name", "address", "relatives"]
  ),

  advancedbackgroundchecks: makeStrategy(
    (f, l) => `https://www.advancedbackgroundchecks.com/names/${slug(f, l)}`,
    (html) => html.includes("result-card") || html.includes("record-list") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  telephonedirectories: makeStrategy(
    (f, l) => `https://www.telephonedirectories.us/people/${slug(f, l)}`,
    (html) => html.includes("result-card") || html.includes("person-item") || html.includes("search-result"),
    ["name", "phone"]
  ),

  voterrecords: makeStrategy(
    (f, l) => `https://voterrecords.com/voters/${slug(f, l)}`,
    (html) => html.includes("result-card") || html.includes("voter-info") || html.includes("search-result"),
    ["name", "address", "voter"]
  ),

  newenglandfacts: makeStrategy(
    (f, l) => `https://newenglandfacts.com/people/${slug(f, l)}`,
    (html) => html.includes("result-card") || html.includes("person-card") || html.includes("search-result"),
    ["name", "address"]
  ),

  officialusa: makeStrategy(
    (f, l) => `https://www.officialusa.com/names/${enc(f)}-${enc(l)}/`,
    (html) => html.includes("result-card") || html.includes("person-card") || html.includes("search-result"),
    ["name", "address"]
  ),

  truecaller: makeStrategy(
    (f, l) => `https://www.truecaller.com/search/us/${slug(f, l)}`,
    (html) => html.includes("profile-card") || html.includes("search-result") || html.includes("result-card"),
    ["name", "phone"]
  ),

  // ─── Enterprise / No public search — still attempt but expect no results ───
  zoominfo: makeStrategy(
    (f, l) => `https://www.zoominfo.com/p/${enc(f)}-${enc(l)}`,
    (html) => html.includes("profile-card") || html.includes("person-profile") || html.includes("contact-info"),
    ["name", "company", "email"]
  ),

  veromi: makeStrategy(
    (f, l) => `https://www.veromi.net/people/${slug(f, l)}/`,
    (html) => html.includes("result-card") || html.includes("person-card") || html.includes("search-result"),
    ["name", "address", "phone"]
  ),

  acxiom: makeStrategy(
    (f, l) => `https://www.acxiom.com/`,
    (_html) => false, // Enterprise only — no public search
    []
  ),

  lexisnexis: makeStrategy(
    (f, l) => `https://www.lexisnexis.com/`,
    (_html) => false, // Enterprise only — no public search
    []
  ),

  oracledatacloud: makeStrategy(
    (f, l) => `https://www.oracle.com/data/`,
    (_html) => false, // Enterprise only — no public search
    []
  ),

  epsilon: makeStrategy(
    (f, l) => `https://www.epsilon.com/`,
    (_html) => false, // Enterprise only — no public search
    []
  ),
};

// Map broker names from DB → strategy keys
const brokerStrategyMap = {
  fastpeoplesearch: "fastpeoplesearch",
  "fast people search": "fastpeoplesearch",
  thatsthem: "thatsthem",
  "thats them": "thatsthem",
  nuwber: "nuwber",
  clustrmaps: "clustrmaps",
  cyberbackgroundchecks: "cyberbackgroundchecks",
  "cyber background checks": "cyberbackgroundchecks",
  spokeo: "spokeo",
  beenverified: "beenverified",
  "been verified": "beenverified",
  whitepages: "whitepages",
  "white pages": "whitepages",
  truthfinder: "truthfinder",
  "truth finder": "truthfinder",
  instantcheckmate: "instantcheckmate",
  "instant checkmate": "instantcheckmate",
  intelius: "intelius",
  radaris: "radaris",
  mylife: "mylife",
  "my life": "mylife",
  peoplefinder: "peoplefinder",
  "people finder": "peoplefinder",
  peoplesmart: "peoplesmart",
  "people smart": "peoplesmart",
  golookup: "golookup",
  "go look up": "golookup",
  peekyou: "peekyou",
  "peek you": "peekyou",
  privateeye: "privateeye",
  "private eye": "privateeye",
  searchpeoplefree: "searchpeoplefree",
  "search people free": "searchpeoplefree",
  addressescom: "addressescom",
  "addresses.com": "addressescom",
  publicrecordsnow: "publicrecordsnow",
  "public records now": "publicrecordsnow",
  "usa people search": "usapeoplesearch",
  usapeoplesearch: "usapeoplesearch",
  ussearch: "ussearch",
  "us search": "ussearch",
  cubib: "cubib",
  checkpeople: "checkpeople",
  "check people": "checkpeople",
  familytreenow: "familytreenow",
  "family tree now": "familytreenow",
  advancedbackgroundchecks: "advancedbackgroundchecks",
  "advanced background checks": "advancedbackgroundchecks",
  telephonedirectories: "telephonedirectories",
  "telephone directories": "telephonedirectories",
  voterrecords: "voterrecords",
  "voter records": "voterrecords",
  newenglandfacts: "newenglandfacts",
  "new england facts": "newenglandfacts",
  officialusa: "officialusa",
  "official usa": "officialusa",
  truecaller: "truecaller",
  "true caller": "truecaller",
  zoominfo: "zoominfo",
  "zoom info": "zoominfo",
  veromi: "veromi",
  acxiom: "acxiom",
  lexisnexis: "lexisnexis",
  "lexis nexis": "lexisnexis",
  oracledatacloud: "oracledatacloud",
  "oracle data cloud": "oracledatacloud",
  epsilon: "epsilon",
};

async function detectBroker(brokerName, userInfo) {
  const key = brokerName.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const strategyName = brokerStrategyMap[key];

  if (!strategyName || !detectionStrategies[strategyName]) {
    return { detected: false, error: "No detection strategy", unsupported: true };
  }

  return detectionStrategies[strategyName](userInfo.firstName, userInfo.lastName, userInfo.state);
}

async function detectAllBrokers(userInfo, brokers) {
  const results = [];

  for (const broker of brokers) {
    const result = await detectBroker(broker.name, userInfo);
    results.push({
      brokerId: broker.id,
      brokerName: broker.name,
      ...result,
    });

    // Rate limit: 2s between requests to avoid being blocked
    await new Promise((r) => setTimeout(r, 2000));
  }

  return results;
}

module.exports = { detectBroker, detectAllBrokers, detectionStrategies };
