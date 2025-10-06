// Estado del juego
let money = 200;
let score = 0;
let level = 1;
let selectedCountry = null;
let plantedSeeds = {};
let activeEvents = {};
let seedMarkers = {};
let countryLabels = {}; // Para almacenar los marcadores de los nombres de los países
let map; // Variable global para el mapa

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

// Colores para los continentes (más distintivos) - CORREGIDO
const continentColors = {
    "Africa": "#FF5722",        // Naranja
    "Asia": "#FFC107",          // Amarillo
    "Europe": "#2196F3",        // Azul
    "North America": "#9C27B0", // Morado
    "South America": "#4CAF50", // Verde
    "Oceania": "#009688",       // Turquesa
    "Antarctica": "#FFFFFF",    // Blanco - CORREGIDO
    "default": "#888888"        // Gris por defecto
};

// Mapeo de países a continentes (simplificado)
const countryToContinent = {
    // América del Norte
    "United States of America": "North America",
    "Canada": "North America",
    "Mexico": "North America",
    
    // América del Sur
    "Brazil": "South America",
    "Argentina": "South America",
    "Colombia": "South America",
    "Peru": "South America",
    "Chile": "South America",
    "Venezuela": "South America",
    
    // Europa
    "Spain": "Europe",
    "France": "Europe",
    "Germany": "Europe",
    "Italy": "Europe",
    "United Kingdom": "Europe",
    "Russia": "Europe", // Parte europea
    "Portugal": "Europe",
    "Netherlands": "Europe",
    
    // Asia
    "China": "Asia",
    "India": "Asia",
    "Japan": "Asia",
    "South Korea": "Asia",
    "Indonesia": "Asia",
    "Turkey": "Asia",
    "Saudi Arabia": "Asia",
    
    // África
    "Egypt": "Africa",
    "Nigeria": "Africa",
    "South Africa": "Africa",
    "Kenya": "Africa",
    "Ethiopia": "Africa",
    "Morocco": "Africa",
    
    // Oceanía
    "Australia": "Oceania",
    "New Zealand": "Oceania",
    "Papua New Guinea": "Oceania",
    
    // Antártida
    "Antarctica": "Antarctica"
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
    "Russia": "Rusia",
    "United Kingdom": "Reino Unido"
};

// Función para determinar el continente basado en la ubicación geográfica
function getContinentByCoordinates(lat, lng) {
    if (lat < -60) return "Antarctica";
    if (lat > 10 && lng > -170 && lng < -50) return "North America";
    if (lat > -60 && lat < 15 && lng > -85 && lng < -30) return "South America";
    if (lat > 35 && lng > -25 && lng < 50) return "Europe";
    if (lat > -35 && lat < 40 && lng > -20 && lng < 55) return "Africa";
    if (lat > -15 && lng > 90 && lng < 180) return "Oceania";
    if (lat > -15 && lng > 40 && lng < 180) return "Asia";
    return "default";
}

// Función para determinar el continente de un país
function getContinentForCountry(countryName, coordinates) {
    // Primero intenta usar el mapeo directo
    if (countryToContinent[countryName]) {
        return countryToContinent[countryName];
    }
    
    // Si no está en el mapeo, usa las coordenadas
    if (coordinates && coordinates.length > 0) {
        const center = getCenter(coordinates);
        return getContinentByCoordinates(center.lat, center.lng);
    }
    
    return "default";
}

// Función para calcular el centro de un polígono
function getCenter(coordinates) {
    let totalLat = 0;
    let totalLng = 0;
    let count = 0;
    
    function processCoords(coords) {
        if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            coords.forEach(ring => processCoords(ring));
        } else if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
            coords.forEach(coord => {
                totalLat += coord[1];
                totalLng += coord[0];
                count++;
            });
        }
    }
    
    processCoords(coordinates);
    
    return {
        lat: totalLat / count,
        lng: totalLng / count
    };
}

// Función para inicializar el mapa
function initializeMap() {
    // Crear el mapa centrado en el mundo
    map = L.map('map').setView([20, 0], 2);
    
    // Añadir capa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Cargar datos de países desde GeoJSON
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(data => {
            // Añadir países al mapa
            L.geoJSON(data, {
                style: function(feature) {
                    // Determinar el continente
                    const countryName = feature.properties.name;
                    const coordinates = feature.geometry.coordinates;
                    const continent = getContinentForCountry(countryName, coordinates);
                    
                    return {
                        fillColor: continentColors[continent] || continentColors["default"],
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Añadir información al hacer hover
                    const countryName = feature.properties.name;
                    const translatedName = countryTranslations[countryName] || countryName;
                    
                    // Determinar el continente para el tooltip
                    const coordinates = feature.geometry.coordinates;
                    const continent = getContinentForCountry(countryName, coordinates);
                    
                    layer.bindTooltip(`
                        <strong>${translatedName}</strong><br>
                        <em>${continent}</em>
                    `, {
                        permanent: false,
                        direction: 'center',
                        className: 'country-label'
                    });
                    
                    // Añadir evento de clic
                    layer.on('click', function(e) {
                        selectCountry(countryName, translatedName, layer);
                    });
                    
                    // Efecto hover
                    layer.on('mouseover', function() {
                        layer.setStyle({
                            weight: 2,
                            color: '#FF0000',
                            fillOpacity: 0.9
                        });
                    });
                    
                    layer.on('mouseout', function() {
                        // Restaurar estilo original
                        const coordinates = feature.geometry.coordinates;
                        const continent = getContinentForCountry(countryName, coordinates);
                        
                        layer.setStyle({
                            fillColor: continentColors[continent] || continentColors["default"],
                            weight: 1,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.7
                        });
                    });
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error al cargar los datos de países:', error));
}

// Función para seleccionar un país
function selectCountry(countryName, translatedName, layer) {
    selectedCountry = {
        name: countryName,
        translatedName: translatedName,
        layer: layer
    };
    
    // Resaltar el país seleccionado
    layer.setStyle({
        weight: 3,
        color: '#FF0000',
        fillOpacity: 0.9
    });
    
    // Actualizar información del país seleccionado
    // Crear el elemento si no existe
    if (!document.getElementById('selected-country')) {
        const gameInfo = document.getElementById('game-info');
        const countryInfo = document.createElement('div');
        countryInfo.id = 'selected-country-info';
        countryInfo.innerHTML = `
            <h3>PAÍS SELECCIONADO / SELECTED COUNTRY</h3>
            <p id="selected-country">Ninguno / None</p>
            <div id="crop-options" style="display: none; margin-top: 10px;">
                <h4>PLANTAR CULTIVO / PLANT CROP</h4>
                <button onclick="plantCrop('wheat')">🌾 Trigo / Wheat ($10)</button>
                <button onclick="plantCrop('corn')">🌽 Maíz / Corn ($15)</button>
                <button onclick="plantCrop('rice')">🍚 Arroz / Rice ($20)</button>
                <button onclick="plantCrop('soy')">🫘 Soja / Soy ($25)</button>
                <button onclick="harvestCrops()" style="background: #FF9800;">💰 Cosechar / Harvest</button>
            </div>
        `;
        gameInfo.appendChild(countryInfo);
    }
    
    document.getElementById('selected-country').textContent = translatedName;
    
    // Mostrar opciones de cultivo
    document.getElementById('crop-options').style.display = 'block';
}

// Resto del código se mantiene igual...
// Función para plantar un cultivo
function plantCrop(cropType) {
    if (!selectedCountry) {
        alert('Por favor, selecciona un país primero.');
        return;
    }
    
    // Costos de los cultivos
    const cropCosts = {
        'wheat': 10,
        'corn': 15,
        'rice': 20,
        'soy': 25
    };
    
    const cost = cropCosts[cropType];
    
    if (money < cost) {
        alert('No tienes suficiente dinero para plantar este cultivo.');
        return;
    }
    
    // Restar dinero
    money -= cost;
    
    // Registrar cultivo plantado
    const countryKey = selectedCountry.name;
    if (!plantedSeeds[countryKey]) {
        plantedSeeds[countryKey] = [];
    }
    
    plantedSeeds[countryKey].push({
        type: cropType,
        plantedAt: Date.now(),
        growth: 0
    });
    
    // Añadir marcador visual
    const bounds = selectedCountry.layer.getBounds();
    const center = bounds.getCenter();
    
    const marker = L.marker(center, {
        icon: L.divIcon({
            className: 'crop-marker',
            html: getCropIcon(cropType),
            iconSize: [30, 30]
        })
    }).addTo(map);
    
    if (!seedMarkers[countryKey]) {
        seedMarkers[countryKey] = [];
    }
    seedMarkers[countryKey].push(marker);
    
    // Actualizar estadísticas
    updateGameStats();
    
    // Actualizar misiones
    updateMissionProgress(1, 1);
    
    alert(`Has plantado ${getCropName(cropType)} en ${selectedCountry.translatedName}.`);
}

// Función para obtener el nombre del cultivo
function getCropName(cropType) {
    const cropNames = {
        'wheat': 'trigo',
        'corn': 'maíz',
        'rice': 'arroz',
        'soy': 'soja'
    };
    
    return cropNames[cropType] || cropType;
}

// Función para obtener el ícono del cultivo
function getCropIcon(cropType) {
    const cropIcons = {
        'wheat': '🌾',
        'corn': '🌽',
        'rice': '🍚',
        'soy': '🫘'
    };
    
    return cropIcons[cropType] || '🌱';
}

// Función para cosechar cultivos
function harvestCrops() {
    if (!selectedCountry) {
        alert('Por favor, selecciona un país primero.');
        return;
    }
    
    const countryKey = selectedCountry.name;
    const crops = plantedSeeds[countryKey];
    
    if (!crops || crops.length === 0) {
        alert('No hay cultivos para cosechar en este país.');
        return;
    }
    
    let totalHarvest = 0;
    let harvestedCount = 0;
    
    // Calcular ganancias por cultivo
    crops.forEach(crop => {
        const cropValues = {
            'wheat': 20,
            'corn': 30,
            'rice': 40,
            'soy': 50
        };
        
        totalHarvest += cropValues[crop.type] || 0;
        harvestedCount++;
    });
    
    // Añadir dinero
    money += totalHarvest;
    
    // Aumentar puntuación
    score += totalHarvest * 2;
    
    // Eliminar marcadores
    if (seedMarkers[countryKey]) {
        seedMarkers[countryKey].forEach(marker => {
            map.removeLayer(marker);
        });
        seedMarkers[countryKey] = [];
    }
    
    // Limpiar cultivos plantados
    plantedSeeds[countryKey] = [];
    
    // Actualizar estadísticas
    updateGameStats();
    
    // Actualizar misiones
    updateMissionProgress(2, harvestedCount);
    
    alert(`Has cosechado ${harvestedCount} cultivos en ${selectedCountry.translatedName} y ganado $${totalHarvest}.`);
}

// Función para actualizar el progreso de las misiones
function updateMissionProgress(missionId, progress) {
    const mission = missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
        mission.progress += progress;
        
        if (mission.progress >= mission.target) {
            mission.completed = true;
            money += mission.reward;
            score += mission.reward * 2;
            alert(`¡Misión completada! Has ganado $${mission.reward}.`);
        }
        
        updateMissions();
    }
}

// Función para actualizar estadísticas del juego
function updateGameStats() {
    document.getElementById('money').textContent = money;
    document.getElementById('score').textContent = Math.round(score);
    document.getElementById('level').textContent = level;
    
    checkLevels();
}

// Función para actualizar misiones
function updateMissions() {
    const missionsContainer = document.getElementById('missions');
    if (missionsContainer) {
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
}

// Función para actualizar información de niveles
function updateLevelInfo() {
    const levelInfoContainer = document.getElementById('level-info');
    if (levelInfoContainer) {
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

// Función para iniciar el juego
function startGame() {
    // Ocultar pantalla de inicio
    document.getElementById('start-screen').classList.add('hidden');
    
    // Mostrar contenedor del juego
    document.getElementById('game-container').style.display = 'block';
    
    // Inicializar el mapa
    initializeMap();
    
    // Actualizar estadísticas del juego
    updateGameStats();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const startScreen = document.getElementById('start-screen');
    const backgroundMenuMusic = document.getElementById('menu-music');
    let hasPlayed = false; // Variable para asegurar que el audio se reproduzca solo una vez

    // Reproducir música del menú cuando el usuario mueve el ratón sobre la pantalla de inicio
    startScreen.addEventListener('mousemove', function() {
        if (!hasPlayed) {
            const playPromise = backgroundMenuMusic.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("La reproducción automática fue bloqueada:", error);
                });
            }
            hasPlayed = true; // Asegurar que el audio no se reproduzca de nuevo
        }
    });

    // Botón PLAY
    document.getElementById('play-button').addEventListener('click', startGame);
    
    // Botón OPTIONS
    document.getElementById('options-button').addEventListener('click', function() {
        document.getElementById('options-screen').style.display = 'flex';
    });
    
    // Botón BACK en opciones
    document.getElementById('back-button').addEventListener('click', function() {
        document.getElementById('options-screen').style.display = 'none';
    });
    
    // Selector de idioma
    document.getElementById('english-lang').addEventListener('click', function() {
        alert('Idioma cambiado a inglés');
        // Aquí puedes implementar la lógica para cambiar el idioma
    });
    
    document.getElementById('spanish-lang').addEventListener('click', function() {
        alert('Idioma cambiado a español');
        // Aquí puedes implementar la lógica para cambiar el idioma
    });
});