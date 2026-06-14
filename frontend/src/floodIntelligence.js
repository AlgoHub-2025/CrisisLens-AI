/**
 * CrisisLens AI — Flood Intelligence Database
 * Water flow paths and evacuation exit points for major Pakistani flood zones.
 * Flow paths trace the downstream river route floodwaters travel.
 * Exit points mark safe evacuation destinations.
 */

// ─── Exit Point Type Colors ──────────────────────────────────────────────────
export const EXIT_TYPE_COLORS = {
  highland:   '#10b981',  // Green   — safe high ground
  evacuation: '#3b82f6',  // Blue    — evacuation route exit
  hub:        '#06b6d4',  // Cyan    — major city / full facilities
  camp:       '#f59e0b',  // Amber   — emergency shelter camp
  transit:    '#8b5cf6',  // Purple  — intermediate transit point
  safe_zone:  '#10b981',  // Green   — designated safe zone
};

export const EXIT_TYPE_ICONS = {
  highland:   '🏔️',
  evacuation: '🚗',
  hub:        '🏥',
  camp:       '⛺',
  transit:    '🔄',
  safe_zone:  '✅',
};

// ─── Flood Zones Database ────────────────────────────────────────────────────
export const FLOOD_ZONES = {

  // ═══════════════════════════════════════════════
  // SWAT RIVER BASIN — KPK
  // River flows North → South from Hindu Kush to Chakdara
  // ═══════════════════════════════════════════════
  kalam: {
    label: 'Kalam — Upper Swat Valley',
    region: 'KPK — Swat District',
    color: '#ef4444',
    // Exact downstream water flow: Kalam → Pizagut → Bahrain → Bariot → Madyan → Khwazakhela → Matta → Mingora
    waterFlowPath: [
      [35.4882, 72.5755], // Kalam (origin)
      [35.3900, 72.5640], // Pizagut area
      [35.3000, 72.5450], // Upper Swat gorge
      [35.2052, 72.5288], // Bahrain
      [35.1500, 72.5250], // Bariot / Barwa
      [35.0777, 72.5228], // Madyan
      [34.9600, 72.5300], // Imam Dheri
      [34.9253, 72.5360], // Khwazakhela
      [34.8700, 72.5100], // Charbagh
      [34.8474, 72.4700], // Matta
      [34.7793, 72.3605], // Mingora / Saidu Sharif
    ],
    exitPoints: [
      {
        name: 'Mahodand Lake Road (N)',
        coords: [35.5800, 72.5000],
        type: 'highland',
        desc: 'Highland refuge 15km north. Move to Mahodand plateau before routes are cut.',
      },
      {
        name: 'Utror Valley Exit',
        coords: [35.5200, 72.4600],
        type: 'highland',
        desc: 'Safe highland route via Ushu Forest. 20km northwest of Kalam.',
      },
      {
        name: 'Bahrain Transit Camp',
        coords: [35.2052, 72.5288],
        type: 'transit',
        desc: '37km south on N-95. Emergency transit hub before road cuts.',
      },
      {
        name: 'Malam Jabba (High Ground)',
        coords: [34.8167, 72.5583],
        type: 'highland',
        desc: '2804m elevation — above flood line. Ski resort area refuge.',
      },
      {
        name: 'Khwazakhela Shelter',
        coords: [34.9253, 72.5360],
        type: 'camp',
        desc: '100km south. Emergency camp on higher embankment.',
      },
      {
        name: 'Mingora Evacuation Hub',
        coords: [34.7793, 72.3605],
        type: 'hub',
        desc: '130km south. District HQ — hospital, shelter, Peshawar road access.',
      },
      {
        name: 'Besham — KKH East Exit',
        coords: [34.9100, 72.8670],
        type: 'evacuation',
        desc: 'Alternate east exit via Shangla Pass to Karakoram Highway.',
      },
    ],
    warningZones: ['Pizagut', 'Bahrain', 'Bariot', 'Madyan', 'Khwazakhela', 'Matta', 'Mingora'],
    alertMessage: 'KALAM FLOOD ALERT: Water flow Kalam → Pizagut → Bahrain → Bariot → Madyan → Khwazakhela → Mingora. EVACUATE SOUTH via N-95 or go to Mahodand Highland IMMEDIATELY.',
  },

  pizagut: {
    label: 'Pizagut — Swat Valley',
    region: 'KPK — Swat District',
    color: '#ef4444',
    waterFlowPath: [
      [35.3900, 72.5640], // Pizagut
      [35.2052, 72.5288], // Bahrain
      [35.1500, 72.5250], // Bariot
      [35.0777, 72.5228], // Madyan
      [34.9253, 72.5360], // Khwazakhela
      [34.7793, 72.3605], // Mingora
    ],
    exitPoints: [
      { name: 'Kalam (North Highland)', coords: [35.4882, 72.5755], type: 'highland', desc: 'Move north to higher Kalam valley.' },
      { name: 'Bahrain Transit Camp', coords: [35.2052, 72.5288], type: 'transit', desc: '10km south transit point.' },
      { name: 'Mingora Hub', coords: [34.7793, 72.3605], type: 'hub', desc: '90km south — full evacuation hub.' },
    ],
    warningZones: ['Bahrain', 'Bariot', 'Madyan', 'Khwazakhela'],
    alertMessage: 'Pizagut flooding. Flow continues to Bahrain → Bariot → Madyan → Mingora.',
  },

  bahrain: {
    label: 'Bahrain — Swat River',
    region: 'KPK — Swat District',
    color: '#ef4444',
    waterFlowPath: [
      [35.2052, 72.5288], // Bahrain
      [35.1500, 72.5250], // Bariot
      [35.0777, 72.5228], // Madyan
      [34.9253, 72.5360], // Khwazakhela
      [34.8700, 72.5100], // Charbagh
      [34.8474, 72.4700], // Matta
      [34.7793, 72.3605], // Mingora
    ],
    exitPoints: [
      { name: 'Malam Jabba (High Ground)', coords: [34.8167, 72.5583], type: 'highland', desc: '2804m elevation — safe above flood line.' },
      { name: 'Madyan Higher Ground', coords: [35.0777, 72.5228], type: 'transit', desc: 'Temporary transit if southern route open.' },
      { name: 'Besham — East Exit via Shangla', coords: [34.9100, 72.8670], type: 'evacuation', desc: 'East alternate via Shangla Pass — safer route.' },
      { name: 'Khwazakhela Shelter', coords: [34.9253, 72.5360], type: 'camp', desc: '30km south — shelter on higher embankment.' },
      { name: 'Mingora Evacuation Hub', coords: [34.7793, 72.3605], type: 'hub', desc: '60km south — full city facilities.' },
    ],
    warningZones: ['Bariot', 'Madyan', 'Khwazakhela', 'Matta', 'Mingora'],
    alertMessage: 'BAHRAIN FLOOD: Flow → Bariot → Madyan → Khwazakhela → Matta → Mingora. Exit east via Shangla or south to Mingora hub.',
  },

  bariot: {
    label: 'Bariot — Swat Valley',
    region: 'KPK — Swat District',
    color: '#ef4444',
    waterFlowPath: [
      [35.1500, 72.5250], // Bariot
      [35.0777, 72.5228], // Madyan
      [34.9253, 72.5360], // Khwazakhela
      [34.8474, 72.4700], // Matta
      [34.7793, 72.3605], // Mingora
    ],
    exitPoints: [
      { name: 'Malam Jabba Highland', coords: [34.8167, 72.5583], type: 'highland', desc: 'Elevated escape route east.' },
      { name: 'Khwazakhela Camp', coords: [34.9253, 72.5360], type: 'camp', desc: '25km south transit camp.' },
      { name: 'Mingora Hub', coords: [34.7793, 72.3605], type: 'hub', desc: '50km south city hub.' },
    ],
    warningZones: ['Madyan', 'Khwazakhela', 'Matta', 'Mingora'],
    alertMessage: 'Bariot flood flow: Bariot → Madyan → Khwazakhela → Matta → Mingora.',
  },

  madyan: {
    label: 'Madyan — Swat Valley',
    region: 'KPK — Swat District',
    color: '#ef4444',
    waterFlowPath: [
      [35.0777, 72.5228], // Madyan
      [34.9253, 72.5360], // Khwazakhela
      [34.8700, 72.5100], // Charbagh
      [34.8474, 72.4700], // Matta
      [34.7793, 72.3605], // Mingora
    ],
    exitPoints: [
      { name: 'Malam Jabba (Highland)', coords: [34.8167, 72.5583], type: 'highland', desc: '2804m — above flood line. Ski resort area.' },
      { name: 'Khwazakhela Shelter', coords: [34.9253, 72.5360], type: 'camp', desc: '15km south, higher embankment.' },
      { name: 'Besham East Exit', coords: [34.9100, 72.8670], type: 'evacuation', desc: 'East via Shangla to KKH.' },
      { name: 'Mingora Main Hub', coords: [34.7793, 72.3605], type: 'hub', desc: '40km south — full facilities.' },
    ],
    warningZones: ['Khwazakhela', 'Charbagh', 'Matta', 'Mingora'],
    alertMessage: 'Madyan flooding: Madyan → Khwazakhela → Matta → Mingora. Exit via Malam Jabba or Besham east route.',
  },

  mingora: {
    label: 'Mingora — Saidu Sharif',
    region: 'KPK — Swat District',
    color: '#f59e0b',
    waterFlowPath: [
      [34.7793, 72.3605], // Mingora
      [34.7500, 72.2500], // Landai downstream
      [34.7000, 72.1000], // Barikot
      [34.6870, 71.9940], // Chakdara
      [34.6500, 71.8000], // Dir road junction
    ],
    exitPoints: [
      { name: 'Malam Jabba (NE Highland)', coords: [34.8167, 72.5583], type: 'highland', desc: 'Northeast highland safe zone.' },
      { name: 'Chakdara Exit (S)', coords: [34.6870, 71.9940], type: 'evacuation', desc: 'South exit to Dir road junction.' },
      { name: 'Mardan via N-45', coords: [34.1989, 72.0397], type: 'hub', desc: '70km south — major city safe zone.' },
      { name: 'Peshawar (Main City)', coords: [33.9892, 71.6818], type: 'hub', desc: '170km south via M-1 highway.' },
    ],
    warningZones: ['Chakdara', 'Mardan (partial)'],
    alertMessage: 'Mingora high water. Exit NE to Malam Jabba highland or south via Chakdara → Mardan → Peshawar.',
  },

  swat: {
    label: 'Swat District — River Basin',
    region: 'KPK',
    color: '#ef4444',
    waterFlowPath: [
      [35.4882, 72.5755], // Kalam
      [35.3900, 72.5640], // Pizagut
      [35.2052, 72.5288], // Bahrain
      [35.1500, 72.5250], // Bariot
      [35.0777, 72.5228], // Madyan
      [34.9253, 72.5360], // Khwazakhela
      [34.8474, 72.4700], // Matta
      [34.7793, 72.3605], // Mingora
      [34.6870, 71.9940], // Chakdara
    ],
    exitPoints: [
      { name: 'Mahodand Plateau (N)', coords: [35.5800, 72.5000], type: 'highland', desc: 'Northern highland refuge.' },
      { name: 'Malam Jabba (E Highland)', coords: [34.8167, 72.5583], type: 'highland', desc: '2804m — above all flood levels.' },
      { name: 'Besham via KKH (E)', coords: [34.9100, 72.8670], type: 'evacuation', desc: 'East exit — Karakoram Highway.' },
      { name: 'Mingora Hub', coords: [34.7793, 72.3605], type: 'hub', desc: 'District HQ — medical & shelter.' },
      { name: 'Peshawar (Safe City)', coords: [33.9892, 71.6818], type: 'hub', desc: '170km south — full emergency services.' },
    ],
    warningZones: ['Pizagut', 'Bahrain', 'Bariot', 'Madyan', 'Khwazakhela', 'Matta', 'Mingora', 'Chakdara'],
    alertMessage: 'SWAT FLOOD: Full basin alert. Flow: Kalam → Pizagut → Bahrain → Bariot → Madyan → Khwazakhela → Mingora → Chakdara.',
  },

  // ═══════════════════════════════════════════════
  // CHITRAL RIVER — KPK
  // Flows: Mastuj → Chitral → Drosh → Arandu South
  // ═══════════════════════════════════════════════
  chitral: {
    label: 'Chitral River Basin',
    region: 'KPK — Chitral District',
    color: '#ef4444',
    waterFlowPath: [
      [36.2780, 72.5190], // Mastuj
      [36.0800, 72.1200], // Reshun
      [35.8510, 71.7864], // Chitral City
      [35.5630, 71.7890], // Drosh
      [35.3500, 71.8300], // Arandu area
    ],
    exitPoints: [
      { name: 'Shandur Pass (Highland)', coords: [36.0639, 72.5333], type: 'highland', desc: '3734m — highest safe ground. Shandur plateau refuge.' },
      { name: 'Drosh Shelter Camp', coords: [35.5630, 71.7890], type: 'camp', desc: '30km south of Chitral on higher ground.' },
      { name: 'Dir via Lowari Tunnel', coords: [35.2000, 71.9000], type: 'evacuation', desc: 'PRIMARY EXIT — Lowari Tunnel to Dir and Peshawar. Check tunnel status first.' },
      { name: 'Peshawar (Safe City)', coords: [33.9892, 71.6818], type: 'hub', desc: '300km south via Dir — full emergency services.' },
    ],
    warningZones: ['Reshun', 'Drosh', 'Arandu'],
    alertMessage: 'CHITRAL FLOOD: Flow south from Mastuj → Reshun → Chitral → Drosh. Exit via Lowari Tunnel to Dir. Do NOT use mountain footpaths.',
  },

  // ═══════════════════════════════════════════════
  // NOWSHERA / KABUL RIVER — KPK
  // Kabul River joins Indus near Attock
  // ═══════════════════════════════════════════════
  nowshera: {
    label: 'Nowshera — Kabul River',
    region: 'KPK — Nowshera District',
    color: '#ef4444',
    waterFlowPath: [
      [34.1800, 71.9800], // Upper Kabul River (Peshawar valley)
      [34.0130, 71.9850], // Nowshera City
      [33.9700, 71.7500], // Charsadda confluence
      [33.9500, 71.5500], // Peshawar plains (downstream)
    ],
    exitPoints: [
      { name: 'Mardan (Higher Ground)', coords: [34.1989, 72.0397], type: 'safe_zone', desc: 'Higher ground, 20km north — safer position.' },
      { name: 'Peshawar City Hub', coords: [33.9892, 71.6818], type: 'hub', desc: '30km west — major emergency services.' },
      { name: 'Attock Exit (E — GT Road)', coords: [33.7667, 72.3600], type: 'evacuation', desc: 'East via Grand Trunk Road to Punjab.' },
    ],
    warningZones: ['Charsadda', 'Prang', 'Peshawar lowlands'],
    alertMessage: 'Kabul River flooding Nowshera. Move north to Mardan or exit east to Attock via GT Road. Avoid all riverside areas.',
  },

  // ═══════════════════════════════════════════════
  // MUZAFFARABAD — JHELUM + NEELUM — AJK
  // ═══════════════════════════════════════════════
  muzaffarabad: {
    label: 'Muzaffarabad — Jhelum/Neelum Rivers',
    region: 'Azad Kashmir',
    color: '#ef4444',
    waterFlowPath: [
      [34.5700, 73.6500], // Upper Neelum
      [34.3700, 73.4711], // Muzaffarabad
      [34.2500, 73.4800], // Kohala area
      [34.1680, 73.5070], // Kohala Bridge
      [33.9500, 73.6000], // Downstream Jhelum
    ],
    exitPoints: [
      { name: 'Upper Neelum Valley', coords: [34.5700, 73.7200], type: 'highland', desc: 'Higher ground — move up the Neelum Valley.' },
      { name: 'Kohala Bridge → N-75', coords: [34.1680, 73.5070], type: 'evacuation', desc: 'Exit south to Abbottabad via N-75 highway.' },
      { name: 'Abbottabad Safe Zone', coords: [34.1688, 73.2215], type: 'hub', desc: '60km south — full facilities, hospital, shelter.' },
      { name: 'Islamabad (Main Hub)', coords: [33.6844, 73.0479], type: 'hub', desc: '150km south — NDMA operations center.' },
    ],
    warningZones: ['Kohala', 'Azad Pattan', 'Rawalakot area (partial)'],
    alertMessage: 'Jhelum/Neelum flooding at Muzaffarabad. Exit via Kohala Bridge south to Abbottabad. Avoid valley floor. Move to Neelum Valley higher ground.',
  },

  // ═══════════════════════════════════════════════
  // GILGIT / UPPER INDUS — GB
  // ═══════════════════════════════════════════════
  gilgit: {
    label: 'Gilgit — Gilgit/Indus Rivers',
    region: 'Gilgit-Baltistan',
    color: '#f59e0b',
    waterFlowPath: [
      [35.9184, 74.3124], // Gilgit City
      [35.5700, 74.2000], // Chilas approach
      [35.4167, 74.1000], // Chilas
      [35.2830, 73.2330], // Dasu
      [34.9100, 72.8670], // Besham
    ],
    exitPoints: [
      { name: 'Naltar Valley (Highland)', coords: [36.1667, 74.1833], type: 'highland', desc: '3100m — high altitude safe valley north of Gilgit.' },
      { name: 'Chilas KKH Transit', coords: [35.4167, 74.1000], type: 'transit', desc: 'KKH waypoint — proceed south toward Besham.' },
      { name: 'Besham — Punjab Road', coords: [34.9100, 72.8670], type: 'evacuation', desc: 'Exit to Islamabad via Hazara Highway.' },
    ],
    warningZones: ['Chilas', 'Dasu', 'Komila', 'Besham'],
    alertMessage: 'GILGIT FLOOD: Gilgit/Indus in spate. Move to Naltar Highland or evacuate south via KKH → Besham → Islamabad.',
  },

  // ═══════════════════════════════════════════════
  // QUETTA — BALOCHISTAN FLASH FLOOD
  // ═══════════════════════════════════════════════
  quetta: {
    label: 'Quetta — Flash Flood Drainage',
    region: 'Balochistan',
    color: '#f59e0b',
    waterFlowPath: [
      [30.4000, 67.1500], // Zarghun / upper catchment
      [30.1798, 66.9750], // Quetta City
      [29.9500, 66.6000], // Kuchlak south
      [29.7985, 66.8466], // Mastung south
    ],
    exitPoints: [
      { name: 'Hanna Lake Elevated Road', coords: [30.1667, 67.1167], type: 'highland', desc: 'East exit via RCD Highway to Kalat.' },
      { name: 'Mastung Safe Area (S)', coords: [29.7985, 66.8466], type: 'safe_zone', desc: '40km south on higher ground.' },
      { name: 'Sibi Eastern Exit', coords: [29.5431, 67.8773], type: 'evacuation', desc: 'Far east exit to Punjab via N-70.' },
      { name: 'Pishin (North Exit)', coords: [30.5828, 66.9964], type: 'evacuation', desc: 'North exit via N-25 away from drainage.' },
    ],
    warningZones: ['Sariab', 'Satellite Town', 'Kuchlak lowlands'],
    alertMessage: 'QUETTA FLASH FLOOD: Move to Hanna Lake east road or Mastung south. Avoid Sariab road and all low-lying areas.',
  },

  // ═══════════════════════════════════════════════
  // SUKKUR / LOWER INDUS — SINDH
  // ═══════════════════════════════════════════════
  sukkur: {
    label: 'Sukkur — Lower Indus River',
    region: 'Sindh',
    color: '#ef4444',
    waterFlowPath: [
      [27.7244, 68.8228], // Sukkur
      [27.6920, 68.8980], // Rohri
      [27.2500, 68.7500], // Shikarpur south
      [26.7400, 68.8600], // Larkana downstream
      [25.3956, 68.3776], // Hyderabad
    ],
    exitPoints: [
      { name: 'Rohri Embankment', coords: [27.6920, 68.8980], type: 'safe_zone', desc: 'Sukkur Barrage embankment — high ground.' },
      { name: 'Larkana (West)', coords: [27.5600, 68.2100], type: 'camp', desc: '60km west — away from main Indus channel.' },
      { name: 'Hyderabad City Exit', coords: [25.3956, 68.3776], type: 'hub', desc: 'South exit — major city, lower risk zone.' },
      { name: 'Karachi Safe City', coords: [24.8607, 67.0011], type: 'hub', desc: 'Coastal city far from Indus flooding.' },
    ],
    warningZones: ['Rohri', 'Shikarpur', 'Larkana', 'Dadu', 'Sehwan'],
    alertMessage: 'SUKKUR INDUS FLOOD: Move WEST away from Indus channel. Flow: Sukkur → Rohri → Shikarpur → Larkana → Hyderabad.',
  },

  jacobabad: {
    label: 'Jacobabad — Sindh Flash Flood',
    region: 'Sindh',
    color: '#f59e0b',
    waterFlowPath: [
      [28.2758, 68.4412], // Jacobabad
      [27.9558, 68.6381], // Shikarpur
      [27.5600, 68.2100], // Larkana
    ],
    exitPoints: [
      { name: 'Shikarpur Embankment', coords: [27.9558, 68.6381], type: 'safe_zone', desc: '50km south on higher road embankment.' },
      { name: 'Balochistan Foothills (N)', coords: [28.8000, 67.9000], type: 'highland', desc: 'North to Balochistan highlands via N-65.' },
      { name: 'Quetta Route (Far N)', coords: [30.1798, 66.9750], type: 'hub', desc: 'Far north — full emergency infrastructure.' },
    ],
    warningZones: ['Shikarpur', 'Larkana lowlands'],
    alertMessage: 'Jacobabad flooding. Exit NORTH to Balochistan foothills via N-65 or move to Shikarpur embankment.',
  },

  // ═══════════════════════════════════════════════
  // BESHAM — INDUS GORGE — KPK/GB BORDER
  // ═══════════════════════════════════════════════
  besham: {
    label: 'Besham — Indus Highway Gorge',
    region: 'KPK — Shangla/Kohistan',
    color: '#f59e0b',
    waterFlowPath: [
      [35.2830, 73.2330], // Dasu upstream
      [34.9100, 72.8670], // Besham
      [34.5000, 72.8000], // Downstream gorge
      [34.2000, 72.5000], // Tarbela approach
    ],
    exitPoints: [
      { name: 'Shangla Pass (West)', coords: [34.8500, 72.5500], type: 'evacuation', desc: 'West exit via Shangla to Swat Valley.' },
      { name: 'Alpuri Elevated Area', coords: [34.9500, 72.6500], type: 'safe_zone', desc: 'Higher ground west of KKH corridor.' },
      { name: 'Tarbela / Hazara Road (S)', coords: [33.9800, 72.6800], type: 'evacuation', desc: 'South exit to Attock and Islamabad.' },
    ],
    warningZones: ['Pattan', 'Chakesar', 'Tarbela'],
    alertMessage: 'Indus gorge flooding at Besham. Exit WEST via Shangla to Swat or SOUTH to Tarbela/Attock. KKH road may be cut.',
  },

  // ═══════════════════════════════════════════════
  // ABBOTTABAD — DOR / HAZARA FLASH FLOOD
  // ═══════════════════════════════════════════════
  abbottabad: {
    label: 'Abbottabad — Hazara Flash Flood',
    region: 'KPK — Hazara Division',
    color: '#f59e0b',
    waterFlowPath: [
      [34.1688, 73.2215], // Abbottabad
      [33.9700, 73.3000], // Haripur
      [33.7600, 72.9500], // Tarbela area
    ],
    exitPoints: [
      { name: 'Nathiagali Highland', coords: [34.0700, 73.3800], type: 'highland', desc: '2500m — Galiyat highland area safe zone.' },
      { name: 'Mansehra East Exit', coords: [34.3313, 73.1964], type: 'safe_zone', desc: 'Higher ground 30km north.' },
      { name: 'Islamabad via N-35', coords: [33.6844, 73.0479], type: 'hub', desc: '120km south — NDMA operations center.' },
    ],
    alertMessage: 'Abbottabad flash flood. Exit to Nathiagali highland (NE) or south to Islamabad via N-35.',
  },

  // ═══════════════════════════════════════════════
  // COASTAL / CYCLONE / TSUNAMI ZONES — SINDH & BALOCHISTAN
  // ═══════════════════════════════════════════════
  karachi: {
    label: 'Karachi Coastal Belt — Tsunami/Cyclone',
    region: 'Sindh — Coastal',
    color: '#ef4444',
    isCoastal: true,
    waterFlowPath: [
      [24.7937, 66.9740], // Deep sea approach
      [24.8137, 66.9940], // Clifton beach
      [24.8607, 67.0011], // City center
    ],
    // Danger bands: representing the coastline and an offshore line (sea route only)
    dangerBands: [
      [[24.8200, 66.9500], [24.7800, 67.0500], [24.7500, 67.1500]], // Coastline limit
      [[24.7800, 66.9200], [24.7400, 67.0200], [24.7100, 67.1200]], // Deep sea offshore limit (5km out)
    ],
    // Safe routes leading inland/higher ground
    safeRoutes: [
      [[24.8607, 67.0011], [24.9312, 67.0422], [24.9922, 67.0645], [25.0450, 67.1200]], // Shara-e-Faisal towards Super Highway (M-9)
      [[24.8137, 66.9940], [24.8350, 67.0300], [24.8700, 67.0800], [24.9100, 67.1500]], // Korangi to Malir
    ],
    exitPoints: [
      { name: 'M-9 Super Highway (Inland)', coords: [25.0450, 67.1200], type: 'evacuation', desc: 'Exit north via M-9 towards Hyderabad.' },
      { name: 'Northern Bypass (Safe Zone)', coords: [24.9922, 67.0645], type: 'safe_zone', desc: 'Elevated bypass away from coastal inundation.' },
      { name: 'Malir Cantonment', coords: [24.9100, 67.1500], type: 'highland', desc: 'Higher ground and secure military area.' },
    ],
    warningZones: ['Clifton', 'DHA', 'Keamari', 'Hawke\'s Bay'],
    alertMessage: 'KARACHI COASTAL ALERT: Tsunami or Storm Surge warning. Evacuate 5km inland immediately. Use M-9 Super Highway or Northern Bypass. Avoid all beaches.',
  },

  gwadar: {
    label: 'Gwadar Peninsula — Cyclone/Tsunami',
    region: 'Balochistan — Coastal',
    color: '#ef4444',
    isCoastal: true,
    waterFlowPath: [
      [25.0500, 62.3000], // Ocean approach
      [25.1130, 62.3240], // Gwadar South Port
      [25.1300, 62.3200], // Main city
    ],
    dangerBands: [
      [[25.1000, 62.2500], [25.1100, 62.3500], [25.1300, 62.4000]], // South coastline
      [[25.0500, 62.2500], [25.0600, 62.3500], [25.0800, 62.4000]], // South offshore limit
      [[25.1400, 62.2500], [25.1500, 62.3500], [25.1700, 62.4000]], // North bay coast
      [[25.1800, 62.2500], [25.1900, 62.3500], [25.2100, 62.4000]], // North bay offshore limit
    ],
    safeRoutes: [
      [[25.1300, 62.3200], [25.2000, 62.3200], [25.2800, 62.3500], [25.4000, 62.4500]], // Makran Coastal Highway Inland
    ],
    exitPoints: [
      { name: 'Koh-e-Batil (Highland)', coords: [25.1000, 62.3160], type: 'highland', desc: 'Elevated hammerhead peninsula (temporary refuge).' },
      { name: 'Makran Coastal Hwy (N-10)', coords: [25.2800, 62.3500], type: 'evacuation', desc: 'Exit north towards Turbat.' },
      { name: 'Turbat Safe City', coords: [26.0012, 63.0485], type: 'hub', desc: 'Inland city safe from coastal surges.' },
    ],
    warningZones: ['Gwadar Port', 'East Bay', 'West Bay'],
    alertMessage: 'GWADAR COASTAL ALERT: Sea level rising. Move to Koh-e-Batil heights or evacuate north via Makran Coastal Highway towards Turbat.',
  },

  thatta: {
    label: 'Thatta / Badin — Coastal Flooding',
    region: 'Sindh — Coastal',
    color: '#ef4444',
    isCoastal: true,
    waterFlowPath: [
      [24.0000, 68.0000], // Arabian Sea
      [24.5000, 68.0000], // Keti Bandar / Sir Creek
      [24.7461, 67.9243], // Thatta
      [25.3956, 68.3776], // Hyderabad
    ],
    dangerBands: [
      [[24.4000, 67.7000], [24.5000, 68.0000], [24.6000, 68.3000]], // Coastline
      [[24.3000, 67.7500], [24.4000, 68.0500], [24.5000, 68.3500]], // Offshore deep sea limit
    ],
    safeRoutes: [
      [[24.7461, 67.9243], [24.9500, 68.1000], [25.1500, 68.2500], [25.3956, 68.3776]], // Thatta to Hyderabad N-5
    ],
    exitPoints: [
      { name: 'Makli Hills (Highland)', coords: [24.7490, 67.9000], type: 'highland', desc: 'Elevated necropolis area, safe above flood waters.' },
      { name: 'Hyderabad City', coords: [25.3956, 68.3776], type: 'hub', desc: '100km north, safe inland hub.' },
    ],
    warningZones: ['Keti Bandar', 'Shah Bandar', 'Sajawal'],
    alertMessage: 'COASTAL INUNDATION: Severe flooding at coast. Move to Makli Hills immediately or evacuate north to Hyderabad via N-5.',
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Find flood zone data for a given location string.
 * Tries exact match first, then partial string matching.
 */
export const getFloodZone = (locationStr) => {
  if (!locationStr) return null;
  const lower = locationStr.toLowerCase().trim();

  // Exact match
  if (FLOOD_ZONES[lower]) return FLOOD_ZONES[lower];

  // Partial match — location contains a zone key
  const key = Object.keys(FLOOD_ZONES).find(k => lower.includes(k));
  if (key) return FLOOD_ZONES[key];

  // Reverse partial — zone key contains first word of location
  const firstWord = lower.split(/[\s,]/)[0];
  const revKey = Object.keys(FLOOD_ZONES).find(k => k.includes(firstWord) && firstWord.length > 3);
  return revKey ? FLOOD_ZONES[revKey] : null;
};

/**
 * Create a styled Leaflet divIcon for exit points.
 */
export const createExitIcon = (type) => {
  const color = EXIT_TYPE_COLORS[type] || '#10b981';
  const emoji = EXIT_TYPE_ICONS[type] || '✅';
  // We return raw data; the caller must use L.divIcon
  return { color, emoji };
};
