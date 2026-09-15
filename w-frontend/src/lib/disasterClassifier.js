export const INCIDENT_COVERS = {
  earthquake: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/San_Francisco_in_ruins_1906.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/2017_Kermanshah_earthquake_by_Farzad_Menati_-_Sarpol-e_Zahab_(44).jpg'
  ],

  flood: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Flooded_street_in_NSB.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Flooded_home.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Flooded-nh544-companypady-2018-kerala-floods.jpg'
  ],

  cyclone: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/1919_hurricane_damage_1_-_Texas.webp',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/1998_Central_America_Hurricane_Mitch_Damage_(30249736283).jpg'
  ],

  wildfire: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Wildfire_in_India.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Fire_burning.jpg'
  ],

  landslide: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Landslide_(15339626638).jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Landslide_on_the_road_to_Kitt_Peak_(noirlab2213w).jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Aftermath_of_Landslide_dated_1st_August_2022_on_Nedumpoil_ghat_road_(120).jpg'
  ],

  volcano: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Halema%CA%BBuma%CA%BBu_crater_during_the_1967-1968_eruption_(3cd06e0b-b4d8-419a-ba33-3f1e99bedd3c).jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Shetani_lava_flow.jpg'
  ],

  drought: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cracked_earth_after_prolonged_drought._2020.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dry_land_(cracked)_5.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Drought.jpg'
  ],

  tsunami: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/2004_Indian_Ocean_earthquake_Maldives_tsunami_wave.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tanjungtokongwave.png'
  ],

  storm: [
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Thunderstorm_Over_the_City.jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Storm_clouds_(7462161170).jpg',
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Storm_Clouds_(9036289749).jpg'
  ]
};



export function getDisasterCategory(item) {
  if (!item) return 'storm';

  const categoryStr = (typeof item === 'object' ? item.category || '' : item).toLowerCase();
  const text = (
    typeof item === 'object'
      ? `${item.category || ''} ${item.title || ''} ${item.summary || ''} ${item.description || ''}`
      : item
  ).toLowerCase();

  // 1. Explicit Category checks
  if (categoryStr.includes('earthquake') || categoryStr.includes('seismic')) return 'earthquake';
  if (categoryStr.includes('flood') || categoryStr.includes('inundat')) return 'flood';
  if (
    categoryStr.includes('cyclone') ||
    categoryStr.includes('hurricane') ||
    categoryStr.includes('typhoon') ||
    categoryStr.includes('tornado') ||
    categoryStr.includes('twister')
  ) {
    return 'cyclone';
  }
  if (
    categoryStr.includes('wildfire') ||
    categoryStr.includes('forest fire') ||
    categoryStr.includes('bushfire')
  ) {
    return 'wildfire';
  }
  if (categoryStr.includes('volcano') || categoryStr.includes('eruption')) return 'volcano';
  if (
    categoryStr.includes('landslide') ||
    categoryStr.includes('mudslide') ||
    categoryStr.includes('rockslide')
  ) {
    return 'landslide';
  }
  if (categoryStr.includes('tsunami') || categoryStr.includes('tidal wave')) return 'tsunami';
  if (
    categoryStr.includes('drought') ||
    categoryStr.includes('heatwave') ||
    categoryStr.includes('heat wave') ||
    categoryStr.includes('arid') ||
    categoryStr.includes('water crisis')
  ) {
    return 'drought';
  }

  // 2. High-precision keyword check across title, summary, and description
  if (/tsunami|tidal wave/.test(text)) return 'tsunami';
  if (/volcan|eruption|lava|magma|ash plume/.test(text)) return 'volcano';
  if (/tornado|twister|funnel cloud/.test(text)) return 'cyclone';
  if (/hurricane|cyclone|typhoon/.test(text)) return 'cyclone';
  if (/\bquake\b|earthquake|tremor|seismic|aftershock|\bmagnitude\b|\brichter\b/.test(text)) return 'earthquake';
  if (/landslide|mudslide|rockslide|debris flow/.test(text)) return 'landslide';
  if (/wildfire|forest fire|bushfire|brush fire|\bblaze\b/.test(text)) return 'wildfire';
  if (/\bflood\b|flooding|inundat|deluge|river overflow|heavy rain|monsoon|submerged/.test(text)) return 'flood';
  if (/drought|heatwave|heat dome|water crisis|water shortage|\barid\b/.test(text)) return 'drought';

  return 'storm';
}

/**
 * Returns a stable incident cover image for an article based on its standardized category
 *
 * @param {Object|string} article - The article object or title
 * @returns {string} Fallback cover image URL
 */
export function getIncidentCoverImage(article) {
  if (!article) return INCIDENT_COVERS.storm[0];
  const cat = getDisasterCategory(article);
  const pool = INCIDENT_COVERS[cat] || INCIDENT_COVERS.storm;
  const seed = ((typeof article === 'object' ? article.id || article.title : article) || '1')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return pool[seed % pool.length];
}
