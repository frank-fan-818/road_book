import { useState, useEffect } from 'react';
import SearchInput from './components/SearchInput';
import TravelDashboard from './components/TravelDashboard';
import { supabase } from './lib/supabase';
import { generateItineraryWithAI } from './lib/zhipu';

function App() {
  const [view, setView] = useState('search');
  const [travelData, setTravelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Supabase connected:', supabase.supabaseUrl);
  }, []);

  const handleSearch = async (prompt) => {
    setIsLoading(true);
    setError(null);

    try {
      const generatedData = await generateItineraryWithAI(prompt);

      await saveTripToSupabase(generatedData);

      setTravelData(generatedData);
      setView('dashboard');
    } catch (err) {
      console.error('生成行程失败:', err);
      setError(err.message || '生成行程失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTripToSupabase = async (data) => {
    try {
      const { trip_id, title, days } = data;

      const destination = extractDestination(title);

      // 保存行程主表
      const { error: tripError } = await supabase
        .from('trips')
        .upsert({
          trip_id,
          title,
          destination,
          days_count: days.length,
          created_at: new Date().toISOString()
        }, { onConflict: 'trip_id' });

      if (tripError) throw tripError;

      for (const day of days) {
        // 计算当天总行程距离（简单估算，实际可根据坐标计算）
        const totalDistance = calculateDayDistance(day.activities);
        // 推断主要交通方式
        const transportType = inferTransportType(day.activities);

        // 保存天表
        const { error: dayError } = await supabase
          .from('trip_days')
          .upsert({
            trip_id,
            day_num: day.day,
            date: day.date,
            ai_tips: day.ai_tips,
            total_distance: totalDistance,
            transport_type: transportType
          }, { onConflict: 'trip_id,day_num' });

        if (dayError) throw dayError;

        for (const activity of day.activities) {
          // 保存活动表，新增地址和坐标字段
          const { error: activityError } = await supabase
            .from('activities')
            .upsert({
              trip_id,
              day_num: day.day,
              time: activity.time,
              loc: activity.loc,
              address: activity.address,
              lng: activity.lng,
              lat: activity.lat,
              description: activity.desc,
              type: activity.type,
              duration: activity.duration,
              ticket: activity.ticket,
              tips: activity.tips
            }, { onConflict: 'trip_id,day_num,time' });

          if (activityError) throw activityError;
        }
      }

      console.log('Trip saved to Supabase successfully!');
    } catch (error) {
      console.error('Error saving trip:', error.message);
    }
  };

  const extractDestination = (title) => {
    const destinations = ['东京', '上海', '北京', '巴黎', '伦敦', '纽约', '罗马', '首尔', '曼谷', '新加坡', '悉尼', '欧洲', '日本', '韩国', '泰国'];
    for (const dest of destinations) {
      if (title.includes(dest)) return dest;
    }
    return '其他';
  };

  /**
   * 计算当天总行程距离（简单估算，根据相邻景点坐标）
   * @param {Array} activities 当天活动列表
   * @returns {Number} 总距离（公里）
   */
  const calculateDayDistance = (activities) => {
    let totalDistance = 0;

    // 过滤有坐标的景点
    const validActivities = activities.filter(act => act.lng && act.lat);

    // 简单计算相邻景点的直线距离
    for (let i = 0; i < validActivities.length - 1; i++) {
      const act1 = validActivities[i];
      const act2 = validActivities[i + 1];

      // 球面距离近似计算（简化版）
      const R = 6371; // 地球半径（公里）
      const dLat = (act2.lat - act1.lat) * Math.PI / 180;
      const dLng = (act2.lng - act1.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(act1.lat * Math.PI / 180) * Math.cos(act2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // 公里

      totalDistance += distance;
    }

    return Math.round(totalDistance * 10) / 10; // 保留1位小数
  };

  /**
   * 推断当天主要交通方式
   * @param {Array} activities 当天活动列表
   * @returns {String} 交通方式
   */
  const inferTransportType = (activities) => {
    const distance = calculateDayDistance(activities);

    if (distance < 3) return '步行';
    if (distance < 10) return '骑行/公共交通';
    if (distance < 50) return '地铁/打车';
    return '自驾/包车';
  };

  const handleReset = () => {
    setView('search');
    setTravelData(null);
    setError(null);
  };

  return (
    <div className="app">
      {view === 'search' ? (
        <SearchInput onSearch={handleSearch} isLoading={isLoading} error={error} />
      ) : (
        <TravelDashboard travelData={travelData} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
