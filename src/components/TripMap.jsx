import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadGoogleMapsScript, createMap, createMarker, createInfoWindow, calculateCenter, fitBoundsToMarkers } from '../lib/googleMap';

/**
 * 行程地图组件 - 使用谷歌地图
 * 用于显示旅行路线和景点位置
 */
const TripMap = ({
  locations = [],
  center: propCenter,
  zoom = 13,
  height = '400px',
  showNavigation = true,
  showScale = true,
  onMarkerClick,
}) => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMarker, setActiveMarker] = useState(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // 计算地图中心点
  const computedCenter = useMemo(() => {
    if (propCenter && propCenter.lng && propCenter.lat) {
      return { lat: propCenter.lat, lng: propCenter.lng };
    }
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(loc => loc.lng && loc.lat);
      if (validLocations.length > 0) {
        return calculateCenter(validLocations.map(loc => ({ lat: loc.lat, lng: loc.lng })));
      }
    }
    return { lat: 35.6762, lng: 139.6503 }; // 默认东京
  }, [locations, propCenter]);

  // 初始化地图
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // 加载谷歌地图脚本
        await loadGoogleMapsScript();

        if (!isMounted || !mapRef.current) return;

        // 创建地图
        const map = createMap(mapRef.current, {
          center: computedCenter,
          zoom: locations.length > 1 ? 12 : zoom,
        });

        mapInstanceRef.current = map;

        // 创建信息窗口
        infoWindowRef.current = createInfoWindow();

        setLoading(false);
      } catch (err) {
        console.error('地图初始化错误:', err);
        if (isMounted) {
          setError(err.message || '地图加载失败');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // 更新标记
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 清除旧标记
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!locations || locations.length === 0) return;

    // 创建新标记
    const validLocations = locations.filter(loc => loc.lng && loc.lat);
    
    validLocations.forEach((location, index) => {
      const marker = createMarker(
        mapInstanceRef.current,
        { lat: location.lat, lng: location.lng },
        {
          title: location.title || location.loc,
          animation: window.google.maps.Animation.DROP,
        }
      );

      // 点击事件
      marker.addListener('click', () => {
        setActiveMarker(location);
        
        // 显示信息窗口
        const content = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${location.title || location.loc}</h3>
            ${location.address ? `<p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">📍 ${location.address}</p>` : ''}
            ${location.desc ? `<p style="color: #6b7280; font-size: 12px;">${location.desc}</p>` : ''}
          </div>
        `;
        
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);

        if (onMarkerClick) {
          onMarkerClick(location);
        }
      });

      markersRef.current.push(marker);
    });

    // 调整视野显示所有标记
    if (validLocations.length > 1) {
      fitBoundsToMarkers(
        mapInstanceRef.current,
        validLocations.map(loc => ({ lat: loc.lat, lng: loc.lng }))
      );
    } else if (validLocations.length === 1) {
      mapInstanceRef.current.setCenter({ lat: validLocations[0].lat, lng: validLocations[0].lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [locations, onMarkerClick]);

  // 错误状态渲染
  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-red-200 rounded-lg p-8" style={{ height }}>
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-red-700 font-medium mb-2">地图加载失败</h3>
          <p className="text-gray-600 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-2">请检查网络连接或配置 VITE_GOOGLE_MAPS_API_KEY</p>
        </div>
      </div>
    );
  }

  // 无景点数据渲染
  if (!locations || locations.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-8" style={{ height }}>
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-gray-600 font-medium">暂无位置数据</h3>
          <p className="text-gray-500 text-sm mt-1">生成行程后将显示景点位置地图</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm relative" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-500 text-sm">加载地图中...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TripMap;
