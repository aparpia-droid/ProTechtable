const { logger } = require("../utils/logger");

const detectionStrategies = {
  async fastpeoplesearch(firstName, lastName, state) {
    try {
      const name = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, "-");
      const url = `https://www.fastpeoplesearch.com/name/${name}_${state || ""}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) return { detected: false, error: "HTTP " + resp.status };
      const html = await resp.text();
      const hasResults = html.includes("listing-name") && !html.includes("did not return any results");
      return {
        detected: hasResults,
        profileUrl: hasResults ? url : null,
        dataFound: hasResults ? ["name", "address", "phone"] : [],
      };
    } catch (e) {
      logger.warn("FastPeopleSearch detection failed", { error: e.message });
      return { detected: false, error: e.message };
    }
  },

  async thatsthem(firstName, lastName) {
    try {
      const name = `${firstName}-${lastName}`.toLowerCase();
      const url = `https://thatsthem.com/name/${name}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) return { detected: false, error: "HTTP " + resp.status };
      const html = await resp.text();
      const hasResults = html.includes("ThatsThem-people-record") || html.includes("result-list");
      return {
        detected: hasResults,
        profileUrl: hasResults ? url : null,
        dataFound: hasResults ? ["name", "address", "phone", "email"] : [],
      };
    } catch (e) {
      logger.warn("ThatsThem detection failed", { error: e.message });
      return { detected: false, error: e.message };
    }
  },

  async nuwber(firstName, lastName) {
    try {
      const url = `https://nuwber.com/search?name=${encodeURIComponent(firstName + " " + lastName)}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) return { detected: false, error: "HTTP " + resp.status };
      const html = await resp.text();
      const hasResults = html.includes("person-card") || html.includes("search-result");
      return {
        detected: hasResults,
        profileUrl: hasResults ? url : null,
        dataFound: hasResults ? ["name", "address", "phone"] : [],
      };
    } catch (e) {
      logger.warn("Nuwber detection failed", { error: e.message });
      return { detected: false, error: e.message };
    }
  },

  async clustrmaps(firstName, lastName) {
    try {
      const url = `https://clustrmaps.com/persons/${encodeURIComponent(firstName)}-${encodeURIComponent(lastName)}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) return { detected: false, error: "HTTP " + resp.status };
      const html = await resp.text();
      const hasResults = html.includes("person-item") || html.includes("search-results");
      return {
        detected: hasResults,
        profileUrl: hasResults ? url : null,
        dataFound: hasResults ? ["name", "address"] : [],
      };
    } catch (e) {
      logger.warn("ClustrMaps detection failed", { error: e.message });
      return { detected: false, error: e.message };
    }
  },

  async cyberbackgroundchecks(firstName, lastName) {
    try {
      const url = `https://www.cyberbackgroundchecks.com/people/${encodeURIComponent(firstName)}-${encodeURIComponent(lastName)}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) return { detected: false, error: "HTTP " + resp.status };
      const html = await resp.text();
      const hasResults = html.includes("record-list") || html.includes("people-list");
      return {
        detected: hasResults,
        profileUrl: hasResults ? url : null,
        dataFound: hasResults ? ["name", "address", "phone", "relatives"] : [],
      };
    } catch (e) {
      logger.warn("CyberBackgroundChecks detection failed", { error: e.message });
      return { detected: false, error: e.message };
    }
  },
};

const brokerStrategyMap = {
  fastpeoplesearch: "fastpeoplesearch",
  "fast people search": "fastpeoplesearch",
  thatsthem: "thatsthem",
  "thats them": "thatsthem",
  nuwber: "nuwber",
  clustrmaps: "clustrmaps",
  cyberbackgroundchecks: "cyberbackgroundchecks",
  "cyber background checks": "cyberbackgroundchecks",
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

    await new Promise((r) => setTimeout(r, 2000));
  }

  return results;
}

module.exports = { detectBroker, detectAllBrokers, detectionStrategies };
