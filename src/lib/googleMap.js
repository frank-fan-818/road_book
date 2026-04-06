/**
 * 谷歌地图API配置和加载模块
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

let isScriptLoaded = false;
let loadPromise = null;

/**
 * 动态加载谷歌地图JavaScript API
 * @returns {Promise<void>}
 */
export function loadGoogleMapsScript() {
  if (isScriptLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('请配置 VITE_GOOGLE_MAPS_API_KEY 环境变量'));
      return;
    }

    // 检查是否已存在
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      isScriptLoaded = true;
      resolve();
      return;
    }

    // 创建script标签
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // 全局回调
    window.initGoogleMaps = () => {
      isScriptLoaded = true;
      console.log('Google Maps API 加载成功');
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Google Maps API 加载失败'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * 创建地图实例
 * @param {HTMLElement} container - 地图容器
 * @param {Object} options - 地图配置
 * @returns {google.maps.Map}
 */
export function createMap(container, options = {}) {
  const defaultOptions = {
    zoom: 12,
    mapTypeId: 'roadmap',
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  };

  return new window.google.maps.Map(container, {
    ...defaultOptions,
    ...options,
  });
}

/**
 * 创建标记
 * @param {google.maps.Map} map - 地图实例
 * @param {Object} position - {lat, lng}
 * @param {Object} options - 标记配置
 * @returns {google.maps.Marker}
 */
export function createMarker(map, position, options = {}) {
  const marker = new window.google.maps.Marker({
    position,
    map,
    ...options,
  });
  return marker;
}

/**
 * 创建信息窗口
 * @param {Object} options - 信息窗口配置
 * @returns {google.maps.InfoWindow}
 */
export function createInfoWindow(options = {}) {
  return new window.google.maps.InfoWindow(options);
}

/**
 * 地理编码 - 地址转坐标
 * @param {string} address - 地址
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error(`地理编码失败: ${status}`));
      }
    });
  });
}

/**
 * 计算地图中心点（根据标记点）
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
 * @param {google.maps.Map} map - 地图实例
 * @param {Array} markers - 标记数组
 */
export function fitBoundsToMarkers(map, markers) {
  if (!markers || markers.length === 0) return;

  const bounds = new window.google.maps.LatLngBounds();
  markers.forEach(marker => {
    bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
  });

  map.fitBounds(bounds);

  // 如果只有一个标记，设置合适的缩放级别
  if (markers.length === 1) {
    map.setZoom(15);
  }
}

export default {
  loadGoogleMapsScript,
  createMap,
  createMarker,
  createInfoWindow,
  geocodeAddress,
  calculateCenter,
  fitBoundsToMarkers,
};
