import { useState, useMemo } from 'react';
import { MapPin, Utensils, Camera, Info, Sparkles, ChevronRight, Clock, Ticket, Navigation } from 'lucide-react';
import TripMap from './TripMap';

// 目的地提取函数
const extractDestination = (title) => {
  const destinations = ['佛山', '东京', '上海', '北京', '巴黎', '伦敦', '纽约', '罗马', '首尔', '曼谷', '新加坡', '悉尼', '欧洲', '日本', '韩国', '泰国'];
  for (const dest of destinations) {
    if (title.includes(dest)) return dest;
  }
  return '其他';
};

const TravelDashboard = ({ travelData, onReset }) => {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null);

  if (!travelData || !travelData.days || travelData.days.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-slate-500 text-lg">暂无行程数据</p>
          <button
            onClick={onReset}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回输入
          </button>
        </div>
      </div>
    );
  }

  const currentDayData = travelData.days[activeDay];

  // 转换活动数据为地图需要的格式
  const mapLocations = useMemo(() => {
    return currentDayData.activities.map(act => ({
      lng: act.lng,
      lat: act.lat,
      title: act.loc,
      address: act.address,
      description: act.desc,
      ...act
    })).filter(act => act.lng && act.lat); // 过滤没有坐标的景点
  }, [currentDayData]);

  // 选中景点时的地图中心
  const mapCenter = useMemo(() => {
    if (selectedActivity && selectedActivity.lng && selectedActivity.lat) {
      return {
        lng: selectedActivity.lng,
        lat: selectedActivity.lat
      };
    }
    return undefined;
  }, [selectedActivity]);

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 font-sans">
      <aside className="w-20 bg-white border-r flex flex-col items-center py-6 shadow-sm">
        <div className="mb-8 font-bold text-blue-600 text-lg">路书</div>
        {travelData.days.map((d, index) => (
          <button
            key={index}
            onClick={() => { setActiveDay(index); setSelectedActivity(null); }}
            className={`w-12 h-12 rounded-xl mb-4 flex flex-col items-center justify-center transition-all ${activeDay === index ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-gray-100'
              }`}
          >
            <span className="text-[10px] uppercase font-bold">Day</span>
            <span className="text-lg font-bold">{d.day}</span>
          </button>
        ))}
        <button
          onClick={onReset}
          className="mt-auto text-xs text-slate-400 hover:text-blue-500 transition-colors"
        >
          ← 返回
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto px-10 py-8">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{travelData.title}</h1>
          <div className="flex items-center text-slate-500 mt-2">
            <MapPin size={16} className="mr-1" />
            <span>{travelData.destination || extractDestination(travelData.title)} · {currentDayData.date}</span>
          </div>
        </header>

        <section className="relative border-l-2 border-dashed border-blue-200 ml-4 pl-10">
          {currentDayData.activities.map((act, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedActivity(act)}
              className="mb-12 relative cursor-pointer group"
            >
              <div className="absolute -left-[51px] top-0 w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                {act.type === 'food' ? <Utensils size={18} className="text-blue-500" /> : <Camera size={18} className="text-blue-500" />}
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${selectedActivity?.loc === act.loc ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                }`}>
                <span className="text-sm font-bold text-blue-500 font-mono tracking-widest">{act.time}</span>
                <h3 className="text-xl font-bold mt-1 flex items-center justify-between">
                  {act.loc}
                  <ChevronRight size={18} className="text-slate-300" />
                </h3>
                <p className="text-slate-600 mt-2 leading-relaxed">{act.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <aside className="w-96 bg-white border-l p-8 hidden xl:block">
        <TripMap
          locations={mapLocations}
          center={mapCenter}
          height="250px"
          zoom={selectedActivity ? 15 : 13}
          onMarkerClick={(location) => {
            const activity = currentDayData.activities.find(act => act.loc === location.title);
            if (activity) {
              setSelectedActivity(activity);
            }
          }}
        />

        <div className="space-y-6">
          <section>
            <h4 className="flex items-center font-bold text-slate-800 mb-3">
              <Sparkles size={18} className="mr-2 text-amber-500" /> AI 智能建议
            </h4>
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-900 text-sm leading-relaxed border border-amber-100">
              {currentDayData.ai_tips || '暂无建议'}
            </div>
          </section>

          {selectedActivity && (
            <section className="animate-in fade-in slide-in-from-bottom-2">
              <h4 className="flex items-center font-bold text-slate-800 mb-3">
                <Info size={18} className="mr-2 text-blue-500" /> 景点详情
              </h4>
              <div className="text-sm text-slate-600 space-y-3 bg-slate-50 p-4 rounded-xl">
                <p className="flex items-center"><MapPin size={14} className="mr-2 text-slate-400" /><strong>地点：</strong>{selectedActivity.loc}</p>
                <p className="flex items-center"><Clock size={14} className="mr-2 text-slate-400" /><strong>建议时长：</strong>{selectedActivity.duration || '2.5 小时'}</p>
                <p className="flex items-center"><Ticket size={14} className="mr-2 text-slate-400" /><strong>门票情况：</strong>{selectedActivity.ticket || '需提前预约'}</p>
                {selectedActivity.tips && (
                  <p className="flex items-start pt-2 border-t border-slate-200"><Info size={14} className="mr-2 text-slate-400 mt-0.5" /><strong>小贴士：</strong>{selectedActivity.tips}</p>
                )}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};

export default TravelDashboard;
