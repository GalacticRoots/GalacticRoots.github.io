// Estado del juego
let money = 200;
let score = 0;
let level = 1;
let selectedCountry = null;
let plantedSeeds = {};
let activeEvents = {};
let seedMarkers = {};
let countryLabels = {}; // Para almacenar los marcadores de los nombres de los países

// Misiones del juego
let missions = [
    { id: 1, description: "Plantar 5 cultivos", target: 5, progress: 0, reward: 100, completed: false },
    { id: 2, description: "Cosechar 3 cultivos", target: 3, progress: 0, reward: 200, completed: false },
    { id: 3, description: "Ganar $1000", target: 1000, progress: 0, reward: 300, completed: false },
    { id: 4, description: "Alcanza nivel 2", target: 2, progress: level, reward: 150, completed: false }
];

// Niveles del juego
const levels = [
    { id: 1, requiredScore: 0, unlocked: true, description: "Principiante" },
    { id: 2, requiredScore: 500, unlocked: false, description: "Agricultor" },
    { id: 3, requiredScore: 1500, unlocked: false, description: "Experto" },
    { id: 4, requiredScore: 3000, unlocked: false, description: "Maestro" },
    { id: 5, requiredScore: 5000, unlocked: false, description: "Leyenda" }
];

// Colores para los continentes (más distintivos)
const continentColors = {
    "default": "#888888", // Gris por defecto
    "Africa": "#FF5722",   // Naranja
    "Asia": "#FFC107",     // Amarillo
    "Europe": "#2196F3",   // Azul
    "North America": "#9C27B0", // Morado
    "South America": "#4CAF50", // Verde
    "Oceania": "#009688",  // Turquesa
    "Antarctica": "#757575" // Gris oscuro
};

// Traducción de nombres de países a español
const countryTranslations = {
    "United States of America": "Estados Unidos",
    "Mexico": "México",
    "Brazil": "Brasil",
    "Argentina": "Argentina",
    "Colombia": "Colombia",
    "Spain": "España",
    "France": "Francia",
    "Germany": "Alemania",
    "Italy": "Italia",
    "China": "China",
    "India": "India",
    "Japan": "Japón",
    "Egypt": "Egipto",
    "Nigeria": "Nigeria",
    "South Africa": "Sudáfrica",
    "Australia": "Australia",
    "Canada": "Canadá",
    "United Kingdom": "Reino Unido",
    "Russia": "Rusia",
    "Indonesia": "Indonesia",
    "Pakistan": "Pakistán",
    "Bangladesh": "Bangladés",
    "Turkey": "Turquía",
    "Iran": "Irán",
    "Thailand": "Tailandia",
    "Vietnam": "Vietnam",
    "Philippines": "Filipinas",
    "Peru": "Perú",
    "Chile": "Chile",
    "Ecuador": "Ecuador",
    "Venezuela": "Venezuela",
    "Bolivia": "Bolivia",
    "Paraguay": "Paraguay",
    "Uruguay": "Uruguay"
};

// Datos agrícolas por país
const countryData = {
    "Argentina": {
        continent: "South America",
        zone: "Templada",
        soilMoisture: 60, temperature: 18, solarRadiation: 80, soilType: "Moliso (Pampa)",
        name: "Argentina",
        suitableCrops: {
            "Soja": { minMoisture: 50, maxMoisture: 75, minTemp: 15, maxTemp: 30, minRadiation: 60, maxRadiation: 95, growthRate: 0.12, yield: 3.2, price: 450 },
            "Maíz": { minMoisture: 45, maxMoisture: 70, minTemp: 18, maxTemp: 32, minRadiation: 65, maxRadiation: 100, growthRate: 0.15, yield: 8.5, price: 550 },
            "Trigo": { minMoisture: 35, maxMoisture: 65, minTemp: 10, maxTemp: 28, minRadiation: 50, maxRadiation: 90, growthRate: 0.1, yield: 3.8, price: 380 },
            "Girasol": { minMoisture: 40, maxMoisture: 65, minTemp: 15, maxTemp: 30, minRadiation: 60, maxRadiation: 95, growthRate: 0.1, yield: 2.1, price: 280 }
        }
    },
    // ... (resto de los datos de países)
};

// Eventos aleatorios
const events = [
    { type: "sequía", effect: -0.2, duration: 15000, message: "¡Sequía! El crecimiento se reduce en 20%." },
    { type: "plaga", effect: -0.3, duration: 10000, message: "¡Plaga de insectos! El crecimiento se reduce en 30%." },
    { type: "lluvia", effect: 0.1, duration: 12000, message: "¡Lluvias intensas! El crecimiento aumenta en 10%." },
    { type: "helada", effect: -0.4, duration: 8000, message: "¡Helada! El crecimiento se reduce en 40%." },
    { type: "calor extremo", effect: -0.25, duration: 10000, message: "¡Ola de calor! El crecimiento se reduce en 25%." },
    { type: "fertilizante", effect: 0.3, duration: 10000, message: "¡Fertilizante natural! El crecimiento aumenta en 30%." },
    { type: "buen clima", effect: 0.2, duration: 15000, message: "¡Buen clima! El crecimiento aumenta en 20%." }
];

// Inicializar el mapa
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Función para obtener el centro de un país
function getCountryCenter(countryName) {
    const centers = {
        "Afghanistan": [33.9391, 67.7100],
        "Albania": [41.1533, 20.1683],
        "Algeria": [28.0339, 1.6596],
        "Andorra": [42.5075, 1.5218],
        "Angola": [-11.2027, 17.8739],
        "Antigua and Barbuda": [17.0608, -61.7964],
        "Argentina": [-34.6037, -58.3816],
        "Armenia": [40.0691, 45.0382],
        "Australia": [-25.2744, 133.7751],
        "Austria": [47.5162, 14.5501],
        "Azerbaijan": [40.1431, 47.5769],
        "Bahamas": [25.0343, -77.3963],
        "Bahrain": [26.0667, 50.5577],
        "Bangladesh": [23.6850, 90.3563],
        "Barbados": [13.1939, -59.5432],
        "Belarus": [53.7098, 27.9534],
        "Belgium": [50.5039, 4.4699],
        "Belize": [17.1899, -88.4976],
        "Benin": [9.3077, 2.3158],
        "Bhutan": [27.5142, 90.4336],
        "Bolivia": [-16.4980, -64.8428],
        "Bosnia and Herzegovina": [43.9159, 17.6791],
        "Botswana": [-22.3285, 24.6849],
        "Brazil": [-15.7797, -47.9297],
        "Brunei": [4.5353, 114.7277],
        "Bulgaria": [42.7339, 25.4858],
        "Burkina Faso": [12.2383, -1.5616],
        "Burundi": [-3.3731, 29.9189],
        "Cambodia": [12.5657, 104.9910],
        "Cameroon": [7.3697, 12.3547],
        "Canada": [56.1304, -106.3468],
        "Cape Verde": [16.0021, -24.0132],
        "Central African Republic": [6.6111, 20.9394],
        "Chad": [12.1048, 15.0246],
        "Chile": [-35.6751, -71.5430],
        "China": [35.8617, 104.1954],
        "Colombia": [4.5709, -74.2973],
        "Comoros": [-11.6455, 43.3333],
        "Congo (Brazzaville)": [-0.2280, 15.8277],
        "Congo (Kinshasa)": [-4.0383, 21.7587],
        "Costa Rica": [9.7489, -83.7534],
        "Croatia": [45.1, 15.2],
        "Cuba": [21.5218, -77.7812],
        "Cyprus": [35.1264, 33.4299],
        "Czech Republic": [49.8175, 15.4730],
        "Denmark": [56.2639, 9.5018],
        "Djibouti": [11.8251, 42.5903],
        "Dominica": [15.4150, -61.3710],
        "Dominican Republic": [18.7357, -70.1627],
        "Ecuador": [-1.8312, -78.1834],
        "Egypt": [26.8206, 30.8025],
        "El Salvador": [13.7942, -88.8965],
        "Equatorial Guinea": [1.6508, 10.2679],
        "Eritrea": [15.1794, 39.7823],
        "Estonia": [58.5953, 25.0136],
        "Eswatini": [-26.5225, 31.4659],
        "Ethiopia": [9.1450, 40.4897],
        "Fiji": [-16.5782, 179.4144],
        "Finland": [61.9241, 25.7482],
        "France": [46.6034, 1.8883],
        "Gabon": [-0.8037, 11.6094],
        "Gambia": [13.4432, -15.3101],
        "Georgia": [42.3154, 43.3569],
        "Germany": [51.1657, 10.4515],
        "Ghana": [7.9465, -1.0232],
        "Greece": [39.0742, 21.8243],
        "Grenada": [12.2628, -61.6042],
        "Guatemala": [15.7835, -90.2308],
        "Guinea": [9.9456, -9.6966],
        "Guinea-Bissau": [11.8037, -15.1804],
        "Guyana": [4.8604, -58.9302],
        "Haiti": [18.9712, -72.2852],
        "Honduras": [15.2, -86.2419],
        "Hungary": [47.1625, 19.5033],
        "Iceland": [64.9631, -19.0208],
        "India": [20.5937, 78.9629],
        "Indonesia": [-0.7893, 113.9213],
        "Iran": [32.4279, 53.6880],
        "Iraq": [33.2232, 43.6793],
        "Ireland": [53.4129, -8.2439],
        "Israel": [31.0461, 34.8516],
        "Italy": [41.8719, 12.5674],
        "Ivory Coast": [7.5400, -5.5471],
        "Jamaica": [18.1096, -77.2975],
        "Japan": [36.2048, 138.2529],
        "Jordan": [30.5852, 36.2384],
        "Kazakhstan": [48.0196, 66.9237],
        "Kenya": [-0.0236, 37.9062],
        "Kiribati": [-3.3704, -168.7340],
        "Kuwait": [29.3117, 47.4818],
        "Kyrgyzstan": [41.2044, 74.7661],
        "Laos": [19.8563, 102.4955],
        "Latvia": [56.8796, 24.6032],
        "Lebanon": [33.8547, 35.8623],
        "Lesotho": [-29.6100, 28.2336],
        "Liberia": [6.4281, -9.4295],
        "Libya": [26.3351, 17.2283],
        "Liechtenstein": [47.1660, 9.5554],
        "Lithuania": [55.1694, 23.8813],
        "Luxembourg": [49.8153, 6.1296],
        "Madagascar": [-18.7669, 46.8691],
        "Malawi": [-13.2543, 34.3015],
        "Malaysia": [4.2105, 101.9758],
        "Maldives": [3.2028, 73.2207],
        "Mali": [12.6392, -8.0029],
        "Malta": [35.9375, 14.3754],
        "Marshall Islands": [7.1315, 171.1845],
        "Mauritania": [21.0079, -10.9408],
        "Mauritius": [-20.3484, 57.5522],
        "Mexico": [19.4326, -99.1332],
        "Micronesia": [7.4256, 150.5508],
        "Moldova": [47.4116, 28.3699],
        "Monaco": [43.7503, 7.4128],
        "Mongolia": [46.8625, 103.8467],
        "Montenegro": [42.7087, 19.3744],
        "Morocco": [31.7917, -7.0926],
        "Mozambique": [-18.6657, 35.5296],
        "Myanmar": [21.9162, 95.9560],
        "Namibia": [-22.9576, 18.4904],
        "Nauru": [-0.5228, 166.9315],
        "Nepal": [28.3949, 84.1240],
        "Netherlands": [52.1326, 5.2913],
        "New Zealand": [-40.9006, 174.8860],
        "Nicaragua": [12.8654, -85.2072],
        "Niger": [17.6078, 8.0817],
        "Nigeria": [9.0820, 8.6753],
        "North Korea": [40.3399, 127.5101],
        "North Macedonia": [41.6086, 21.7453],
        "Norway": [60.4720, 8.4689],
        "Oman": [21.5126, 55.9233],
        "Pakistan": [30.3753, 69.3451],
        "Palau": [7.5150, 134.5825],
        "Panama": [8.5380, -80.7821],
        "Papua New Guinea": [-6.3149, 143.9556],
        "Paraguay": [-23.4425, -58.4438],
        "Peru": [-9.1900, -75.0156],
        "Philippines": [12.8797, 121.7740],
        "Poland": [51.9194, 19.1451],
        "Portugal": [39.3999, -8.2245],
        "Qatar": [25.3548, 51.1839],
        "Romania": [45.9432, 24.9668],
        "Russia": [61.5240, 105.3188],
        "Rwanda": [-1.9403, 29.8739],
        "Saint Kitts and Nevis": [17.3578, -62.7830],
        "Saint Lucia": [13.9094, -60.9789],
        "Saint Vincent and the Grenadines": [12.9843, -61.2872],
        "Samoa": [-13.7590, -172.1046],
        "San Marino": [43.9424, 12.4578],
        "Sao Tome and Principe": [0.1864, 6.6131],
        "Saudi Arabia": [23.8859, 45.0792],
        "Senegal": [14.4974, -14.4524],
        "Serbia": [44.0165, 21.0059],
        "Seychelles": [-4.6796, 55.4920],
        "Sierra Leone": [8.4606, -11.7799],
        "Singapore": [1.3521, 103.8198],
        "Slovakia": [48.6690, 19.6990],
        "Slovenia": [46.1512, 14.9955],
        "Solomon Islands": [-9.6457, 160.1562],
        "Somalia": [5.1521, 46.1996],
        "South Africa": [-30.5595, 22.9375],
        "South Korea": [35.9078, 127.7669],
        "South Sudan": [6.8770, 31.3070],
        "Spain": [40.4637, -3.7492],
        "Sri Lanka": [7.8731, 80.7718],
        "Sudan": [12.8628, 30.2176],
        "Suriname": [3.9193, -56.0278],
        "Sweden": [60.1282, 18.6435],
        "Switzerland": [46.8182, 8.2275],
        "Syria": [34.8021, 38.9968],
        "Taiwan": [23.6978, 120.9605],
        "Tajikistan": [38.8610, 71.2761],
        "Tanzania": [-6.3690, 34.8888],
        "Thailand": [15.8700, 100.9925],
        "Timor-Leste": [-8.8742, 125.7275],
        "Togo": [8.6195, 0.8248],
        "Tonga": [-21.1790, -175.1982],
        "Trinidad and Tobago": [10.6918, -61.2225],
        "Tunisia": [33.8869, 9.5375],
        "Turkey": [38.9637, 35.2433],
        "Turkmenistan": [38.9697, 59.5563],
        "Tuvalu": [-7.1095, 177.6493],
        "Uganda": [1.3733, 32.2903],
        "Ukraine": [48.3794, 31.1656],
        "United Arab Emirates": [23.4241, 53.8478],
        "United Kingdom": [55.3781, -3.4360],
        "United States of America": [37.0902, -95.7129],
        "Uruguay": [-32.5228, -55.7658],
        "Uzbekistan": [41.3775, 64.5853],
        "Vanuatu": [-15.3767, 166.9592],
        "Vatican City": [41.9029, 12.4534],
        "Venezuela": [6.4238, -66.5897],
        "Vietnam": [14.0583, 108.2772],
        "Yemen": [15.5527, 48.5164],
        "Zambia": [-13.1339, 27.8493],
        "Zimbabwe": [-19.0154, 29.1549]
    };
    return centers[countryName] || [0, 0];
}

// Función para obtener el continente de un país
function getContinent(countryName) {
    const continentByRegion = {
        // América
        "Argentina": "South America",
        "Bolivia": "South America",
        "Brazil": "South America",
        "Chile": "South America",
        "Colombia": "South America",
        "Ecuador": "South America",
        "Guyana": "South America",
        "Paraguay": "South America",
        "Peru": "South America",
        "Suriname": "South America",
        "Uruguay": "South America",
        "Venezuela": "South America",
        "United States of America": "North America",
        "Canada": "North America",
        "Mexico": "North America",
        "Belize": "North America",
        "Costa Rica": "North America",
        "El Salvador": "North America",
        "Guatemala": "North America",
        "Honduras": "North America",
        "Nicaragua": "North America",
        "Panama": "North America",

        // Europa
        "Albania": "Europe",
        "Andorra": "Europe",
        "Austria": "Europe",
        "Belarus": "Europe",
        "Belgium": "Europe",
        "Bosnia and Herzegovina": "Europe",
        "Bulgaria": "Europe",
        "Croatia": "Europe",
        "Czech Republic": "Europe",
        "Denmark": "Europe",
        "Estonia": "Europe",
        "Finland": "Europe",
        "France": "Europe",
        "Germany": "Europe",
        "Greece": "Europe",
        "Hungary": "Europe",
        "Iceland": "Europe",
        "Ireland": "Europe",
        "Italy": "Europe",
        "Kosovo": "Europe",
        "Latvia": "Europe",
        "Liechtenstein": "Europe",
        "Lithuania": "Europe",
        "Luxembourg": "Europe",
        "Malta": "Europe",
        "Moldova": "Europe",
        "Monaco": "Europe",
        "Montenegro": "Europe",
        "Netherlands": "Europe",
        "North Macedonia": "Europe",
        "Norway": "Europe",
        "Poland": "Europe",
        "Portugal": "Europe",
        "Romania": "Europe",
        "Russia": "Europe",
        "San Marino": "Europe",
        "Serbia": "Europe",
        "Slovakia": "Europe",
        "Slovenia": "Europe",
        "Spain": "Europe",
        "Sweden": "Europe",
        "Switzerland": "Europe",
        "Ukraine": "Europe",
        "United Kingdom": "Europe",
        "Vatican City": "Europe",

        // Asia
        "Afghanistan": "Asia",
        "Armenia": "Asia",
        "Azerbaijan": "Asia",
        "Bahrain": "Asia",
        "Bangladesh": "Asia",
        "Bhutan": "Asia",
        "Brunei": "Asia",
        "Cambodia": "Asia",
        "China": "Asia",
        "Cyprus": "Asia",
        "Georgia": "Asia",
        "India": "Asia",
        "Indonesia": "Asia",
        "Iran": "Asia",
        "Iraq": "Asia",
        "Israel": "Asia",
        "Japan": "Asia",
        "Jordan": "Asia",
        "Kazakhstan": "Asia",
        "Kuwait": "Asia",
        "Kyrgyzstan": "Asia",
        "Laos": "Asia",
        "Lebanon": "Asia",
        "Malaysia": "Asia",
        "Maldives": "Asia",
        "Mongolia": "Asia",
        "Myanmar": "Asia",
        "Nepal": "Asia",
        "North Korea": "Asia",
        "Oman": "Asia",
        "Pakistan": "Asia",
        "Palestine": "Asia",
        "Philippines": "Asia",
        "Qatar": "Asia",
        "Saudi Arabia": "Asia",
        "Singapore": "Asia",
        "South Korea": "Asia",
        "Sri Lanka": "Asia",
        "Syria": "Asia",
        "Taiwan": "Asia",
        "Tajikistan": "Asia",
        "Thailand": "Asia",
        "Timor-Leste": "Asia",
        "Turkey": "Asia",
        "Turkmenistan": "Asia",
        "United Arab Emirates": "Asia",
        "Uzbekistan": "Asia",
        "Vietnam": "Asia",
        "Yemen": "Asia",

        // África
        "Algeria": "Africa",
        "Angola": "Africa",
        "Benin": "Africa",
        "Botswana": "Africa",
        "Burkina Faso": "Africa",
        "Burundi": "Africa",
        "Cabo Verde": "Africa",
        "Cameroon": "Africa",
        "Central African Republic": "Africa",
        "Chad": "Africa",
        "Comoros": "Africa",
        "Congo (Brazzaville)": "Africa",
        "Congo (Kinshasa)": "Africa",
        "Côte d'Ivoire": "Africa",
        "Djibouti": "Africa",
        "Egypt": "Africa",
        "Equatorial Guinea": "Africa",
        "Eritrea": "Africa",
        "Eswatini": "Africa",
        "Ethiopia": "Africa",
        "Gabon": "Africa",
        "Gambia": "Africa",
        "Ghana": "Africa",
        "Guinea": "Africa",
        "Guinea-Bissau": "Africa",
        "Kenya": "Africa",
        "Liberia": "Africa",
        "Libya": "Africa",
        "Madagascar": "Africa",
        "Malawi": "Africa",
        "Mali": "Africa",
        "Mauritania": "Africa",
        "Mauritius": "Africa",
        "Morocco": "Africa",
        "Mozambique": "Africa",
        "Namibia": "Africa",
        "Niger": "Africa",
        "Nigeria": "Africa",
        "Rwanda": "Africa",
        "Sao Tome and Principe": "Africa",
        "Senegal": "Africa",
        "Seychelles": "Africa",
        "Sierra Leone": "Africa",
        "Somalia": "Africa",
        "South Africa": "Africa",
        "South Sudan": "Africa",
        "Sudan": "Africa",
        "Tanzania": "Africa",
        "Togo": "Africa",
        "Tunisia": "Africa",
        "Uganda": "Africa",
        "Zambia": "Africa",
        "Zimbabwe": "Africa",

        // Oceanía
        "Australia": "Oceania",
        "Fiji": "Oceania",
        "Kiribati": "Oceania",
        "Marshall Islands": "Oceania",
        "Micronesia": "Oceania",
        "Nauru": "Oceania",
        "New Zealand": "Oceania",
        "Palau": "Oceania",
        "Papua New Guinea": "Oceania",
        "Samoa": "Oceania",
        "Solomon Islands": "Oceania",
        "Tonga": "Oceania",
        "Tuvalu": "Oceania",
        "Vanuatu": "Oceania",

        // Antártida
        "Antarctica": "Antarctica"
    };
    return continentByRegion[countryName] || "default";
}

// Función para mostrar los nombres de los países en el mapa
function showCountryLabels() {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                onEachFeature: (feature, layer) => {
                    const countryName = feature.properties.name;
                    const spanishName = countryTranslations[countryName] || countryName;
                    const center = getCountryCenter(countryName);

                    if (center && !(center[0] === 0 && center[1] === 0)) {
                        countryLabels[spanishName] = L.marker(center, {
                            icon: L.divIcon({
                                className: 'country-label',
                                html: `<div style="background: transparent; color: black; font-size: 10px; font-weight: bold; text-shadow: white 0px 0px 3px;">${spanishName}</div>`,
                                iconSize: null,
                                iconAnchor: [0, 0]
                            }),
                            zIndexOffset: 1000
                        }).addTo(map);
                    }
                }
            });
        })
        .catch(error => {
            console.error("Error al cargar el GeoJSON:", error);
        });
}

// Función para cargar los límites de países y hacerlos interactivos
function loadCountries() {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    const continent = getContinent(feature.properties.name);
                    return {
                        fillColor: continentColors[continent] || continentColors.default,
                        weight: 0.5,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.8
                    };
                },
                onEachFeature: (feature, layer) => {
                    const countryName = feature.properties.name;
                    const spanishName = countryTranslations[countryName] || countryName;
                    const center = getCountryCenter(countryName);

                    layer.on('click', () => {
                        selectedCountry = spanishName;

                        // Limpiar marcadores de semillas anteriores
                        if (seedMarkers[spanishName]) {
                            map.removeLayer(seedMarkers[spanishName]);
                            delete seedMarkers[spanishName];
                        }

                        // Mostrar semilla en el país seleccionado
                        if (center && !(center[0] === 0 && center[1] === 0)) {
                            const seedIcon = L.icon({
                                iconUrl: 'https://cdn-icons-png.flaticon.com/512/3155/3155780.png',
                                iconSize: [30, 30]
                            });
                            seedMarkers[spanishName] = L.marker(center, { icon: seedIcon })
                                .addTo(map)
                                .bindPopup(`Seleccionaste ${spanishName}`);
                        }

                        // Mostrar información agrícola
                        const countryKey = Object.keys(countryData).find(key => countryData[key].name === spanishName);
                        if (countryKey) {
                            showAgriculturalData(spanishName, countryData[countryKey]);
                        } else {
                            // Datos genéricos para países sin información específica
                            const randomContinent = getContinent(countryName);
                            countryData[countryName] = {
                                continent: randomContinent,
                                zone: "Templada",
                                soilMoisture: Math.floor(Math.random() * 30) + 40,
                                temperature: Math.floor(Math.random() * 20) + 10,
                                solarRadiation: Math.floor(Math.random() * 30) + 60,
                                soilType: "Variado",
                                name: spanishName,
                                suitableCrops: {
                                    "Trigo": { minMoisture: 30, maxMoisture: 60, minTemp: 10, maxTemp: 28, minRadiation: 50, maxRadiation: 90, growthRate: 0.08, yield: 2.5, price: 300 },
                                    "Maíz": { minMoisture: 40, maxMoisture: 70, minTemp: 15, maxTemp: 30, minRadiation: 60, maxRadiation: 95, growthRate: 0.1, yield: 5, price: 400 }
                                }
                            };
                            showAgriculturalData(spanishName, countryData[countryName]);
                        }
                    });
                }
            }).addTo(map);

            // Generar eventos aleatorios cada cierto tiempo
            setInterval(generateRandomEvent, 20000);
        })
        .catch(error => {
            console.error("Error al cargar el GeoJSON:", error);
            alert("No se pudo cargar el mapa de países. Revisa la consola para más detalles.");
        });
}

// Función para mostrar información agrícola del país
function showAgriculturalData(country, data) {
    document.getElementById('country-name').textContent = country;
    document.getElementById('soil-moisture').textContent = data.soilMoisture;
    document.getElementById('temperature').textContent = data.temperature;
    document.getElementById('solar-radiation').textContent = data.solarRadiation;
    document.getElementById('soil-type').textContent = `${data.soilType} (Zona: ${data.zone})`;

    // Mostrar cultivos adecuados para el país
    const suitableCrops = Object.keys(data.suitableCrops);
    document.getElementById('suitable-crops').textContent = suitableCrops.join(", ");

    // Actualizar selector de cultivos
    const cropSelector = document.getElementById('crop-selector');
    cropSelector.innerHTML = '<option value="">Selecciona un cultivo</option>';
    suitableCrops.forEach(crop => {
        const option = document.createElement('option');
        option.value = crop;
        option.textContent = crop;
        cropSelector.appendChild(option);
    });

    // Estado de crecimiento
    updateGrowthStatus(country);

    // Mostrar eventos activos
    showActiveEvents(country);
}

// Función para mostrar eventos activos en el país
function showActiveEvents(country) {
    const eventContainer = document.createElement('div');
    eventContainer.id = 'active-events';
    eventContainer.style.marginTop = '10px';
    eventContainer.style.padding = '10px';
    eventContainer.style.backgroundColor = '#ffebee';
    eventContainer.style.borderRadius = '5px';

    if (activeEvents[country]) {
        eventContainer.innerHTML = `<p><strong>Evento activo:</strong> ${activeEvents[country].message}</p>`;
    } else {
        eventContainer.innerHTML = '<p>No hay eventos activos.</p>';
    }

    const existingContainer = document.getElementById('active-events');
    if (existingContainer) {
        existingContainer.remove();
    }
    document.getElementById('agricultural-data').appendChild(eventContainer);
}

// Función para actualizar el estado de crecimiento
function updateGrowthStatus(country) {
    const statusElement = document.getElementById('growth-status');
    const harvestButton = document.getElementById('harvest-crop');

    if (plantedSeeds[country]) {
        const seed = plantedSeeds[country];
        const growthPercent = Math.round(seed.growth * 100);
        statusElement.innerHTML = `
            <p><strong>Cultivo:</strong> ${seed.type}</p>
            <div class="progress-container">
                <progress value="${growthPercent}" max="100"></progress>
                <span>${growthPercent}%</span>
            </div>
        `;
        if (growthPercent >= 100) {
            statusElement.innerHTML += `<p style="color: green;">¡Listo para cosechar!</p>`;
            harvestButton.disabled = false;
        } else {
            harvestButton.disabled = true;
        }
    } else {
        statusElement.textContent = "No hay semillas plantadas.";
        harvestButton.disabled = true;
        document.getElementById('harvest-result').style.display = 'none';
    }
}

// Función para verificar si un cultivo es adecuado para el país
function isCropSuitable(country, crop) {
    const countryKey = Object.keys(countryData).find(key => countryData[key].name === country);
    if (!countryKey) return false;
    const data = countryData[countryKey];
    const cropConditions = data.suitableCrops[crop];
    if (!cropConditions) return false;

    return (
        data.soilMoisture >= cropConditions.minMoisture &&
        data.soilMoisture <= cropConditions.maxMoisture &&
        data.temperature >= cropConditions.minTemp &&
        data.temperature <= cropConditions.maxTemp &&
        data.solarRadiation >= cropConditions.minRadiation &&
        data.solarRadiation <= cropConditions.maxRadiation
    );
}

// Evento para plantar semilla
document.getElementById('plant-seed').addEventListener('click', () => {
    if (!selectedCountry) {
        alert("Selecciona un país primero.");
        return;
    }
    const cropSelector = document.getElementById('crop-selector');
    const cropType = cropSelector.value;
    if (!cropType) {
        alert("Selecciona un cultivo.");
        return;
    }
    if (money < 100) {
        alert("No tienes suficiente dinero para plantar. Necesitas $100.");
        return;
    }
    const countryKey = Object.keys(countryData).find(key => countryData[key].name === selectedCountry);
    if (!isCropSuitable(selectedCountry, cropType)) {
        const data = countryData[countryKey];
        const cropConditions = data.suitableCrops[cropType];
        let reason = "";
        if (data.soilMoisture < cropConditions.minMoisture) reason = "humedad insuficiente";
        else if (data.soilMoisture > cropConditions.maxMoisture) reason = "exceso de humedad";
        else if (data.temperature < cropConditions.minTemp) reason = "temperatura demasiado baja";
        else if (data.temperature > cropConditions.maxTemp) reason = "temperatura demasiado alta";
        else if (data.solarRadiation < cropConditions.minRadiation) reason = "poca radiación solar";
        else if (data.solarRadiation > cropConditions.maxRadiation) reason = "exceso de radiación solar";
        alert(`El cultivo "${cropType}" no es adecuado para ${selectedCountry} debido a ${reason}.`);
        return;
    }
    if (plantedSeeds[selectedCountry]) {
        alert(`Ya hay un cultivo de ${plantedSeeds[selectedCountry].type} en crecimiento.`);
        return;
    }

    // Restar dinero
    money -= 100;
    updateGameStats();

    // Actualizar misión de plantar cultivos
    missions[0].progress++;
    if (missions[0].progress >= missions[0].target) {
        missions[0].completed = true;
        money += missions[0].reward;
        alert(`¡Misión completada! Ganaste $${missions[0].reward}`);
    }

    // Plantar la semilla
    plantedSeeds[selectedCountry] = {
        type: cropType,
        growth: 0,
        marker: null
    };

    // Actualizar el marcador de semilla a un icono de cultivo en crecimiento
    const countryCenter = getCountryCenter(Object.keys(countryData).find(key => countryData[key].name === selectedCountry));
    const cropIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4794/4794979.png',
        iconSize: [30, 30]
    });

    if (seedMarkers[selectedCountry]) {
        map.removeLayer(seedMarkers[selectedCountry]);
    }

    seedMarkers[selectedCountry] = L.marker(countryCenter, { icon: cropIcon })
        .addTo(map)
        .bindPopup(`Cultivo de ${cropType} en crecimiento (0%)`);

    alert(`¡Semilla de ${cropType} plantada en ${selectedCountry}!`);
    updateGrowthStatus(selectedCountry);
});

// Evento para cosechar cultivo
document.getElementById('harvest-crop').addEventListener('click', () => {
    if (!selectedCountry || !plantedSeeds[selectedCountry]) return;

    const seed = plantedSeeds[selectedCountry];
    const cropType = seed.type;
    const countryKey = Object.keys(countryData).find(key => countryData[key].name === selectedCountry);
    const cropConditions = countryData[countryKey].suitableCrops[cropType];
    const yieldPerHectare = Math.floor(Math.random() * 3) + cropConditions.yield - 1;
    const pricePerUnit = cropConditions.price;
    const area = 1000000;

    // Calcular producción y ganancias
    const production = Math.round(yieldPerHectare * area / 1000);
    const earnings = Math.round(production * pricePerUnit);

    // Sumar dinero y puntuación
    money += earnings;
    score += earnings / 100;

    // Actualizar misiones
    missions[1].progress++;
    if (missions[1].progress >= missions[1].target) {
        missions[1].completed = true;
        money += missions[1].reward;
        alert(`¡Misión completada! Ganaste $${missions[1].reward}`);
    }

    missions[2].progress += earnings;
    if (missions[2].progress >= missions[2].target) {
        missions[2].completed = true;
        money += missions[2].reward;
        alert(`¡Misión completada! Ganaste $${missions[2].reward}`);
    }

    // Verificar niveles
    checkLevels();

    // Mostrar resultado de la cosecha
    const harvestResult = document.getElementById('harvest-result');
    harvestResult.style.display = 'block';
    harvestResult.innerHTML = `
        <h3>¡Cosecha exitosa!</h3>
        <p><strong>Cultivo:</strong> ${cropType}</p>
        <p><strong>Producción:</strong> ${production} mil toneladas</p>
        <p><strong>Ganancias:</strong> $${earnings}</p>
        <p><strong>Puntuación:</strong> +${Math.round(earnings / 100)}</p>
    `;

    // Remover el cultivo y el evento activo
    if (seedMarkers[selectedCountry]) {
        map.removeLayer(seedMarkers[selectedCountry]);
        delete seedMarkers[selectedCountry];
    }

    delete plantedSeeds[selectedCountry];
    delete activeEvents[selectedCountry];
    updateGameStats();
    showActiveEvents(selectedCountry);
});

// Simular crecimiento
setInterval(() => {
    for (const country in plantedSeeds) {
        const countryKey = Object.keys(countryData).find(key => countryData[key].name === country);
        if (!countryKey) continue;

        const seed = plantedSeeds[country];
        const data = countryData[countryKey];
        const cropConditions = data.suitableCrops[seed.type];

        // Calcular tasa de crecimiento base
        let growthRate = cropConditions.growthRate;

        // Aplicar efecto de evento activo (si hay)
        if (activeEvents[country]) {
            growthRate += activeEvents[country].effect;
            if (growthRate < 0) growthRate = 0;
        }

        // Verificar condiciones climáticas
        const isMoistureOK = data.soilMoisture >= cropConditions.minMoisture && data.soilMoisture <= cropConditions.maxMoisture;
        const isTemperatureOK = data.temperature >= cropConditions.minTemp && data.temperature <= cropConditions.maxTemp;
        const isRadiationOK = data.solarRadiation >= cropConditions.minRadiation && data.solarRadiation <= cropConditions.maxRadiation;

        if (isMoistureOK && isTemperatureOK && isRadiationOK) {
            seed.growth += growthRate;
            if (seed.growth >= 1) {
                seed.growth = 1;
            }

            if (seedMarkers[country]) {
                const percent = Math.round(seed.growth * 100);
                seedMarkers[country].setPopupContent(`Cultivo de ${seed.type} en crecimiento (${percent}%)`);

                if (percent >= 100) {
                    const readyIcon = L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/4794/4794981.png',
                        iconSize: [30, 30]
                    });
                    seedMarkers[country].setIcon(readyIcon);
                }
            }

            if (country === selectedCountry) {
                updateGrowthStatus(country);
            }
        }
    }
}, 3000);

// Función para generar evento aleatorio
function generateRandomEvent() {
    const countriesWithCrops = Object.keys(plantedSeeds);
    if (countriesWithCrops.length === 0) return;

    const randomCountry = countriesWithCrops[Math.floor(Math.random() * countriesWithCrops.length)];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    activeEvents[randomCountry] = {
        type: randomEvent.type,
        effect: randomEvent.effect,
        message: randomEvent.message,
        timeout: setTimeout(() => {
            delete activeEvents[randomCountry];
            if (selectedCountry === randomCountry) {
                showActiveEvents(randomCountry);
            }
        }, randomEvent.duration)
    };

    if (selectedCountry === randomCountry) {
        showActiveEvents(randomCountry);
    }

    alert(`¡Evento en ${randomCountry}! ${randomEvent.message}`);
}

// Función para actualizar estadísticas del juego
function updateGameStats() {
    document.getElementById('money').textContent = money;
    document.getElementById('score').textContent = Math.round(score);
    document.getElementById('game-level').textContent = `Nivel: ${level} (${levels[level-1].description})`;
    updateMissions();
    updateLevelInfo();
}

// Función para actualizar misiones
function updateMissions() {
    const missionsContainer = document.getElementById('missions');
    missionsContainer.innerHTML = '<h3>Misiones</h3>';
    missions.forEach(mission => {
        const missionElement = document.createElement('div');
        missionElement.className = `mission ${mission.completed ? 'completed' : ''}`;
        missionElement.innerHTML = `
            <strong>${mission.description}</strong>
            <div class="progress">${mission.progress}/${mission.target}</div>
        `;
        missionsContainer.appendChild(missionElement);
    });
}

// Función para actualizar información de niveles
function updateLevelInfo() {
    const levelInfoContainer = document.getElementById('level-info');
    levelInfoContainer.innerHTML = '<h3>Niveles</h3>';
    levels.forEach(levelData => {
        const levelElement = document.createElement('div');
        levelElement.className = `level ${levelData.unlocked ? '' : 'locked'}`;
        levelElement.innerHTML = `
            <strong>Nivel ${levelData.id}: ${levelData.description}</strong>
            ${levelData.unlocked ? '' : `<div>Requerido: ${levelData.requiredScore} puntos</div>`}
        `;
        levelInfoContainer.appendChild(levelElement);
    });
}

// Función para verificar y actualizar niveles
function checkLevels() {
    levels.forEach(levelData => {
        if (!levelData.unlocked && score >= levelData.requiredScore) {
            levelData.unlocked = true;
            level = levelData.id;
            alert(`¡Felicidades! Has alcanzado el nivel ${levelData.id}: ${levelData.description}`);
        }
    });
}

// Inicializar el juego
showCountryLabels();
loadCountries();
updateGameStats();
