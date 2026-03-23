import React, { useState, useEffect, useMemo } from 'react';
import { Map, Marker, NavigationControl, ScaleControl, InfoWindow } from '@uiw/react-baidu-map';
import { isBaiduMapConfigured, getBaiduMapAK, BaiduMapErrorType, createBaiduMapError } from '../lib/baiduMap';

/**
 * 行程地图组件
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
  const [error, setError] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapReady, setMapReady] = useState(false);

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
    console.log('景点数据:', JSON.stringify(locations));
    console.log('propCenter:', propCenter);
    console.log('========================');
  }, [locations, propCenter]);

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

  // 直接计算地图中心点（同步方式）
  const computedCenter = useMemo(() => {
    // 如果有传入的center，优先使用
    if (propCenter && propCenter.lng && propCenter.lat) {
      return propCenter;
    }
    // 如果没有传入center但有locations，计算中心点
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(loc => loc.lng && loc.lat);
      if (validLocations.length > 0) {
        const lngs = validLocations.map(loc => loc.lng);
        const lats = validLocations.map(loc => loc.lat);
        const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        return { lng: avgLng, lat: avgLat };
      }
    }
    return undefined;
  }, [locations, propCenter]);

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

  // 如果中心点计算失败
  if (!computedCenter) {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-8" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-500">无法计算地图中心点</p>
          <p className="text-gray-400 text-xs mt-2">locations: {JSON.stringify(locations)}</p>
        </div>
      </div>
    );
  }

  console.log('=== 地图渲染参数 ===');
  console.log('AK:', getBaiduMapAK());
  console.log('center:', computedCenter);
  console.log('zoom:', zoom);
  console.log('locations count:', locations.length);
  console.log('====================');

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <Map
        ak={getBaiduMapAK()}
        center={computedCenter}
        zoom={zoom}
        enableScrollWheelZoom
        style={{ width: '100%', height: '100%' }}
        enableDragging
        enableDblclickZoom
      >
        {showNavigation && <NavigationControl />}
        {showScale && <ScaleControl />}

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lng: location.lng, lat: location.lat }}
            title={location.title || location.loc}
            onClick={(e) => handleMarkerClick(location, e)}
          />
        ))}

        {activeMarker && (
          <InfoWindow
            position={{ lng: activeMarker.lng, lat: activeMarker.lat }}
            title={<div className="font-medium text-gray-800">{activeMarker.title || activeMarker.loc}</div>}
            onClose={handleCloseInfoWindow}
          >
            <div className="text-sm p-2">
              {activeMarker.address && (
                <p className="text-gray-600 mb-1">📍 {activeMarker.address}</p>
              )}
              {activeMarker.description && (
                <p className="text-gray-500">{activeMarker.description}</p>
              )}
              {activeMarker.desc && (
                <p className="text-gray-500">{activeMarker.desc}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

export default TripMap;
