import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { getCommonRates } from '../lib/exchangeRate';

/**
 * 汇率显示组件
 * 显示常用货币对人民币的汇率
 */
const ExchangeRateWidget = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // 加载汇率数据
  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommonRates();
      setRates(data);
      setLastUpdateTime(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载
  useEffect(() => {
    loadRates();
  }, []);

  // 错误状态
  if (error) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-sm">汇率加载失败</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <TrendingUp size={18} className="text-blue-500 mr-2" />
          <h4 className="font-medium text-gray-800">实时汇率</h4>
        </div>
        <button
          onClick={loadRates}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="刷新汇率"
        >
          <RefreshCw size={16} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {rates.map((rate, index) => (
                <div key={index} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-1 text-lg">{rate.flag}</span>
                      <span className="text-sm text-gray-600">{rate.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">{rate.rate}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-right">100 {rate.code} = ￥{rate.rate}</p>
                </div>
              ))}
            </div>
            {lastUpdateTime && (
              <p className="text-[10px] text-gray-400 text-right mt-2">
                更新于 {lastUpdateTime}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExchangeRateWidget;
