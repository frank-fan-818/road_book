/**
 * LocationIQ 地图配置模块
 * 基于 OpenStreetMap + Leaflet.js
 * 文档: https://locationiq.com/
 */

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_TILE_URL = 'https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png';

let isLeafletLoaded = false;
let loadPromise = null;

/**
 * 动态加载 Leaflet.js
 * @returns {Promise<void>}
 */
export function loadLeafletScript() {
  if (isLeafletLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.L) {
      isLeafletLoaded = true;
      resolve();
      return;
    }

    // 加载 CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 加载 JS
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;

    script.onload = () => {
      isLeafletLoaded = true;
      console.log('Leaflet.js 加载成功');
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Leaflet.js 加载失败'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * 创建地图实例
 * @param {HTMLElement} container - 地图容器
 * @param {Object} options - 地图配置
 * @returns {L.Map}
 */
export function createMap(container, options = {}) {
  const defaultOptions = {
    zoom: 13,
    zoomControl: true,
    attributionControl: true,
  };

  const map = window.L.map(container, {
    ...defaultOptions,
    ...options,
  });

  // 添加 LocationIQ 瓦片图层
  if (LOCATIONIQ_API_KEY) {
    window.L.tileLayer(LOCATIONIQ_TILE_URL, {
      key: LOCATIONIQ_API_KEY,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://locationiq.com">LocationIQ</a>',
      maxZoom: 19,
    }).addTo(map);
  } else {
    // 备用：使用 OpenStreetMap 默认瓦片（无需API Key）
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
  }

  return map;
}

/**
 * 创建标记
 * @param {L.Map} map - 地图实例
 * @param {Object} position - {lat, lng}
 * @param {Object} options - 标记配置
 * @returns {L.Marker}
 */
export function createMarker(map, position, options = {}) {
  const defaultIcon = window.L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const marker = window.L.marker([position.lat, position.lng], {
    icon: defaultIcon,
    ...options,
  }).addTo(map);

  return marker;
}

/**
 * 创建弹出窗口
 * @param {Object} options - 弹出窗口配置
 * @returns {L.Popup}
 */
export function createPopup(options = {}) {
  return window.L.popup({
    maxWidth: 300,
    minWidth: 200,
    ...options,
  });
}

/**
 * 计算地图中心点
 * @param {Array} markers - 标记点数组 [{lat, lng}]
 * @returns {{lat: number, lng: number}}
 */
export function calculateCenter(markers) {
  if (!markers || markers.length === 0) {
    return { lat: 35.6762, lng: 139.6503 }; // 默认东京
  }

  if (markers.length === 1) {
    return { lat: markers[0].lat, lng: markers[0].lng };
  }

  let totalLat = 0;
  let totalLng = 0;

  markers.forEach(marker => {
    totalLat += marker.lat;
    totalLng += marker.lng;
  });

  return {
    lat: totalLat / markers.length,
    lng: totalLng / markers.length,
  };
}

/**
 * 调整地图视野以显示所有标记
 * @param {L.Map} map - 地图实例
 * @param {Array} markers - 标记数组 [{lat, lng}]
 */
export function fitBoundsToMarkers(map, markers) {
  if (!markers || markers.length === 0) return;

  if (markers.length === 1) {
    map.setView([markers[0].lat, markers[0].lng], 15);
    return;
  }

  const bounds = window.L.latLngBounds(
    markers.map(m => [m.lat, m.lng])
  );
  map.fitBounds(bounds, { padding: [50, 50] });
}

/**
 * 地理编码 - 地址转坐标（使用 LocationIQ）
 * @param {string} address - 地址
 * @returns {Promise<{lat: number, lng: number}>}
 */
export async function geocodeAddress(address) {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('请配置 VITE_LOCATIONIQ_API_KEY 环境变量');
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    throw new Error('未找到该地址');
  } catch (error) {
    console.error('地理编码失败:', error);
    throw error;
  }
}

export default {
  loadLeafletScript,
  createMap,
  createMarker,
  createPopup,
  geocodeAddress,
  calculateCenter,
  fitBoundsToMarkers,
};
