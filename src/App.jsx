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

      const { error: tripError } = await supabase
        .from('trips')
        .upsert({
          trip_id,
          title,
          destination,
          days_count: days.length
        }, { onConflict: 'trip_id' });

      if (tripError) throw tripError;

      for (const day of days) {
        const { error: dayError } = await supabase
          .from('trip_days')
          .upsert({
            trip_id,
            day_num: day.day,
            date: day.date,
            ai_tips: day.ai_tips
          }, { onConflict: 'trip_id,day_num' });

        if (dayError) throw dayError;

        for (const activity of day.activities) {
          const { error: activityError } = await supabase
            .from('activities')
            .upsert({
              trip_id,
              day_num: day.day,
              time: activity.time,
              loc: activity.loc,
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
    const destinations = ['东京', '上海', '北京', '巴黎', '伦敦', '纽约', '罗马', '东京', '首尔', '曼谷', '新加坡', '悉尼', '欧洲', '日本', '韩国', '泰国'];
    for (const dest of destinations) {
      if (title.includes(dest)) return dest;
    }
    return '其他';
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
