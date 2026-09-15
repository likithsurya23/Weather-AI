let cache = null;
let cacheTime = 0;
const CACHE = 60 * 1000;

const IMAGES = {
  earthquake: "https://images.unsplash.com/photo-1589824783837-6169889fa20f?w=800&q=80",
  flood: "https://images.unsplash.com/photo-1514632595-4944383f2737?w=800&q=80",
  cyclone: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80",
  hurricane: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80",
  tsunami: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80",
  wildfire: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
  landslide: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  volcano: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
  tornado: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80",
  drought: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80",
  storm: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80"
};

function category(text = "") {
  const t = text.toLowerCase();

  if (t.includes("tsunami")) return "tsunami";
  if (t.includes("hurricane")) return "hurricane";
  if (t.includes("cyclone") || t.includes("typhoon")) return "cyclone";
  if (t.includes("tornado") || t.includes("twister")) return "tornado";
  if (/volcan|eruption|lava|magma|ash plume/.test(t)) return "volcano";
  if (/earthquake|quake|tremor|seismic/.test(t)) return "earthquake";
  if (/landslide|mudslide|rockslide|debris flow/.test(t)) return "landslide";
  if (/wildfire|forest fire|bushfire|brush fire/.test(t)) return "wildfire";
  if (/flood|inundat|deluge|river overflow/.test(t)) return "flood";
  if (/drought|heatwave|heat dome|arid|water shortage/.test(t)) return "drought";
  return "storm";
}

function severity(text = "", alert = "") {
  const t = text.toLowerCase();

  if (
    alert === "red" ||
    /deadly|catastrophic|killed|emergency|massive|hundreds dead|submerged/.test(t)
  )
    return ["danger", "Red Alert"];

  if (
    alert === "orange" ||
    /warning|severe|evacuat|injur|major|devastat/.test(t)
  )
    return ["warning", "Orange Alert"];

  return ["info", "Advisory"];
}

function checkTrending(text = "") {
  const t = text.toLowerCase();
  return /nepal|deadly|killed|catastrophic|state of emergency|evacuation|massive|submerged|hundreds dead|inundation|relief mission|death toll|major disaster|cyclone|hurricane|red alert|flooding/.test(t);
}

async function getJSON(url, timeout = 6000) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(timeout)
    });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

async function getText(url, timeout = 6000) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(timeout)
    });
    return r.ok ? await r.text() : "";
  } catch {
    return "";
  }
}

/* GDELT */
async function gdelt() {
  try {
    const q = encodeURIComponent(
      "(earthquake OR flood OR cyclone OR hurricane OR tsunami OR wildfire OR landslide OR volcano OR tornado OR drought OR storm OR \"Nepal flood\")"
    );

    const data = await getJSON(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&format=json&maxrecords=50&sort=DateDesc`
    );

    return (data?.articles || []).map((a, i) => {
      const title = a.title || "Natural Disaster Update";
      const cat = category(title);
      const [sev, alert] = severity(title);
      const isTrending = checkTrending(title);

      return {
        id: `gdelt_${i}_${Date.now()}`,
        title,
        category: cat,
        severity: isTrending && sev === 'info' ? 'warning' : sev,
        alertLevel: isTrending && alert === 'Advisory' ? 'Orange Alert' : alert,
        isTrending,
        location: a.sourcecountry || a.domain || "Global",
        summary: `Live dispatch reported via ${a.domain || "GDELT"}: ${title}`,
        source: a.domain || "GDELT",
        publishedAt: a.seendate
          ? new Date(
              `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T${a.seendate.slice(9, 11) || '12'}:${a.seendate.slice(11, 13) || '00'}:00Z`
            ).toISOString()
          : new Date().toISOString(),
        url: a.url,
        imageUrl: a.socialimage || IMAGES[cat]
      };
    });
  } catch {
    return [];
  }
}

/* NewsData */
async function newsData(selected) {
  const key = process.env.NEWSDATA_API_KEY;
  if (!key) return [];

  let q =
    "earthquake OR flood OR cyclone OR storm OR wildfire OR tsunami OR disaster";

  if (selected && selected !== "all") {
    q =
      selected === "volcano"
        ? "volcano"
        : selected === "storm" || selected === "severe_weather"
        ? "storm OR thunderstorm"
        : selected;
  }

  const data = await getJSON(
    `https://newsdata.io/api/1/news?apikey=${key}&q=${encodeURIComponent(q)}&language=en`
  );

  return (data?.results || []).map(a => {
    const title = a.title || "Disaster News";
    const desc = a.description || "";
    const combined = `${title} ${desc}`;
    const cat = category(combined);
    const [sev, alert] = severity(combined);
    const isTrending = checkTrending(combined);

    return {
      id: `newsdata_${a.article_id || title}`,
      title,
      category: cat,
      severity: isTrending && sev === 'info' ? 'warning' : sev,
      alertLevel: isTrending && alert === 'Advisory' ? 'Orange Alert' : alert,
      isTrending,
      location: a.country?.[0] ? a.country[0].toUpperCase() : (a.source_name || "Global"),
      summary: desc || title,
      source: a.source_name || a.source_id || "NewsData",
      publishedAt: a.pubDate
        ? new Date(a.pubDate.replace(" ", "T")).toISOString()
        : new Date().toISOString(),
      url: a.link,
      imageUrl: a.image_url || IMAGES[cat]
    };
  }).filter(a => a.url);
}

/* GDACS */
function gdacs(xml = "") {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .slice(0, 25)
    .map(([, item], i) => {
      const get = tag => {
        const m =
          item.match(
            new RegExp(
              `<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
              "i"
            )
          );
        return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
      };

      const title = get("title") || "Natural Disaster Alert";
      const desc = get("description");
      const combined = `${title} ${desc}`;
      const type = get("gdacs:eventtype").toUpperCase();
      const rawAlert = get("gdacs:alertlevel").toLowerCase();

      const map = {
        TC: title.toLowerCase().includes("hurricane")
          ? "hurricane"
          : "cyclone",
        FL: "flood",
        EQ: "earthquake",
        WF: "wildfire",
        VO: "volcano",
        DR: "drought",
        TS: "tsunami"
      };

      const cat = map[type] || category(combined);
      const isTrending = rawAlert === 'red' || checkTrending(combined);
      const [sev, alert] =
        rawAlert === "red"
          ? ["danger", "Red Alert"]
          : rawAlert === "green"
          ? ["info", "Advisory"]
          : ["warning", "Orange Alert"];

      return {
        id: `gdacs_${type}_${i}`,
        title,
        category: cat,
        severity: sev,
        alertLevel: alert,
        isTrending,
        location: get("gdacs:country") || "Global",
        summary: desc.slice(0, 260),
        source: "UN GDACS / EC",
        publishedAt: new Date(
          get("pubDate") || Date.now()
        ).toISOString(),
        url: get("link") || "https://www.gdacs.org",
        imageUrl: IMAGES[cat]
      };
    });
}

/* USGS */
async function usgs(url) {
  const data = await getJSON(url, 5000);

  return (data?.features || []).slice(0, 15).map(f => {
    const p = f.properties;
    const mag = Number(p.mag);
    const cat = "earthquake";
    const isTrending = mag >= 5.5;

    return {
      id: `usgs_${f.id}`,
      title: `Magnitude ${mag.toFixed(1)} Earthquake - ${p.place}`,
      category: cat,
      severity: mag >= 6 ? "danger" : mag >= 5 ? "warning" : "info",
      alertLevel: mag >= 6 ? "Red Alert" : mag >= 5 ? "Orange Alert" : "Advisory",
      isTrending,
      location: p.place || "Seismic Zone",
      summary: `Magnitude ${mag.toFixed(1)} earthquake detected at a depth of ${
        f.geometry?.coordinates?.[2] ?? 10
      }km.`,
      source: "USGS Seismology",
      publishedAt: new Date(p.time).toISOString(),
      url: p.url,
      imageUrl: IMAGES[cat]
    };
  });
}

/* NewsAPI */
async function newsApi() {
  const key = process.env.NEWS_API_KEY;
  if (!key) return [];

  const q =
    "earthquake OR flood OR cyclone OR hurricane OR tsunami OR wildfire OR landslide OR volcano OR tornado OR drought OR storm";

  const data = await getJSON(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      q
    )}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${key}`
  );

  return (data?.articles || []).map((a, i) => {
    const title = a.title || "";
    const desc = a.description || "";
    const combined = `${title} ${desc}`;
    const cat = category(combined);
    const [sev, alert] = severity(title);
    const isTrending = checkTrending(combined);

    return {
      id: `newsapi_${i}_${Date.now()}`,
      title,
      category: cat,
      severity: isTrending && sev === 'info' ? 'warning' : sev,
      alertLevel: isTrending && alert === 'Advisory' ? 'Orange Alert' : alert,
      isTrending,
      location: a.source?.name || "Global",
      summary: desc || a.content || title,
      source: a.source?.name || "NewsAPI",
      publishedAt: a.publishedAt || new Date().toISOString(),
      url: a.url,
      imageUrl: a.urlToImage || IMAGES[cat]
    };
  }).filter(a => a.url);
}

/* Controller */
exports.getDisasterNews = async (req, res) => {
  const { category: filter, search, limit, refresh, trending } = req.query;
  const now = Date.now();

  try {
    let news;

    if (!refresh && cache && now - cacheTime < CACHE) {
      news = cache;
    } else {
      const results = await Promise.all([
        newsData(filter),
        gdelt(),
        getText("https://www.gdacs.org/xml/rss.xml").then(gdacs),
        usgs(
          "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
        ),
        usgs(
          "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
        ),
        newsApi()
      ]);

      const seen = new Set();

      news = results
        .flat()
        .filter(item => {
          if (!item.title || !item.url) return false;

          const key = item.title
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80);

          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.publishedAt) -
            new Date(a.publishedAt)
        );

      cache = news;
      cacheTime = now;
    }

    let filtered = news;

    if (trending === 'true') {
      filtered = filtered.filter(item => item.isTrending);
    }

    if (filter && filter !== "all") {
      filtered = filtered.filter(
        item => item.category === filter
      );
    }

    if (search?.trim()) {
      const q = search.toLowerCase().trim();

      filtered = filtered.filter(item =>
        `${item.title} ${item.summary} ${item.location}`
          .toLowerCase()
          .includes(q)
      );
    }

    const n = parseInt(limit, 10);

    if (n > 0) {
      filtered = filtered.slice(0, n);
    }

    res.json({
      success: true,
      count: filtered.length,
      total: news.length,
      filteredTotal: filtered.length,
      trendingCount: news.filter(x => x.isTrending).length,
      data: filtered
    });
  } catch (error) {
    console.error("[DisasterNews]", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve disaster news",
      error: error.message
    });
  }
};