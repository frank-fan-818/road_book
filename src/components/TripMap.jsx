import React, { useState, useEffect } from 'react';
import { Map, Marker, NavigationControl, ScaleControl, InfoWindow } from '@uiw/react-baidu-map';
import { isBaiduMapConfigured, getBaiduMapAK, BaiduMapErrorType, createBaiduMapError } from '../lib/baiduMap';

/**
 * 行程地图组件
 * 用于显示旅行路线和景点位置
 * @param {Object} props
 * @param {Array} props.locations - 景点位置数组 [{ lng, lat, title, address, description }]
 * @param {Object} props.center - 地图中心点 { lng, lat }，默认自动计算中心点
 * @param {number} props.zoom - 缩放级别，默认13
 * @param {string} props.height - 地图高度，默认400px
 * @param {boolean} props.showNavigation - 是否显示导航控件，默认true
 * @param {boolean} props.showScale - 是否显示比例尺，默认true
 * @param {Function} props.onMarkerClick - 标记点击回调
 */
const TripMap = ({
  locations = [],
  center,
  zoom = 13,
  height = '400px',
  showNavigation = true,
  showScale = true,
  onMarkerClick,
}) => {
  const [error, setError] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);

  // 调试：打印环境变量
  useEffect(() => {
    console.log('=== 百度地图配置调试 ===');
    console.log('VITE_BAIDU_MAP_AK:', import.meta.env.VITE_BAIDU_MAP_AK);
    console.log('是否配置:', isBaiduMapConfigured());
    try {
      console.log('获取AK:', getBaiduMapAK());
    } catch (e) {
      console.error('获取AK错误:', e);
    }
    console.log('景点数量:', locations.length);
    console.log('景点数据:', locations);
    console.log('========================');
  }, [locations]);

  // 检查API Key配置
  useEffect(() => {
    try {
      if (!isBaiduMapConfigured()) {
        throw createBaiduMapError(
          BaiduMapErrorType.MISSING_AK,
          `百度地图API Key未配置，请联系管理员设置 VITE_BAIDU_MAP_AK 环境变量。当前AK值："${import.meta.env.VITE_BAIDU_MAP_AK || '空'}"`
        );
      }
      getBaiduMapAK();
    } catch (err) {
      setError(err);
      console.error('百度地图初始化错误:', err);
    }
  }, []);

  // 自动计算中心点
  useEffect(() => {
    if (center || locations.length === 0) return;

    try {
      // 计算所有点的中心点
      const lngs = locations.map(loc => loc.lng);
      const lats = locations.map(loc => loc.lat);
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      setMapCenter({ lng: avgLng, lat: avgLat });
    } catch (err) {
      console.error('计算地图中心点失败:', err);
    }
  }, [locations, center]);

  // 处理标记点击
  const handleMarkerClick = (location, event) => {
    setActiveMarker(location);
    if (onMarkerClick) {
      onMarkerClick(location, event);
    }
  };

  // 关闭信息窗口
  const handleCloseInfoWindow = () => {
    setActiveMarker(null);
  };

  // 错误状态渲染
  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-red-200 rounded-lg p-8" style={{ height }}>
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-red-700 font-medium mb-2">地图加载失败</h3>
          <p className="text-gray-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // 无景点数据渲染
  if (locations.length === 0) {
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

  if (!mapCenter) {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <Map
        ak={getBaiduMapAK()}
        center={mapCenter}
        zoom={zoom}
        enableScrollWheelZoom
        style={{ width: '100%', height: '100%' }}
      >
        {showNavigation && <NavigationControl />}
        {showScale && <ScaleControl />}

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lng: location.lng, lat: location.lat }}
            title={location.title}
            onClick={(e) => handleMarkerClick(location, e)}
          />
        ))}

        {activeMarker && (
          <InfoWindow
            position={{ lng: activeMarker.lng, lat: activeMarker.lat }}
            title={<div className="font-medium text-gray-800">{activeMarker.title}</div>}
            onClose={handleCloseInfoWindow}
          >
            <div className="text-sm p-2">
              {activeMarker.address && (
                <p className="text-gray-600 mb-1">📍 {activeMarker.address}</p>
              )}
              {activeMarker.description && (
                <p className="text-gray-500">{activeMarker.description}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

export default TripMap;
