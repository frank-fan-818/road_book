/**
 * 汇率查询模块
 * 聚合数据汇率API https://www.juhe.cn/docs/api/id/80
 */

const JUHE_API_KEY = import.meta.env.VITE_JUHE_RATE_API_KEY || '1a5c9b0c06c17e6bf7f4dd7a9bc7d50f';
const JUHE_API_URL = 'http://op.juhe.cn/onebox/exchange/query';

// 缓存汇率数据，有效期1小时
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1小时

/**
 * 获取最新汇率数据
 * @returns {Promise<Object>} 汇率数据
 */
export async function getExchangeRates() {
  // 检查缓存
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await fetch(`${JUHE_API_URL}?key=${JUHE_API_KEY}`);
    const data = await response.json();

    if (data.error_code !== 0) {
      throw new Error(`汇率API错误: ${data.reason}`);
    }

    cachedRates = data.result;
    lastFetchTime = now;
    return cachedRates;
  } catch (error) {
    console.error('获取汇率失败:', error);
    throw error;
  }
}

/**
 * 货币转换
 * @param {number} amount - 金额
 * @param {string} fromCurrency - 原货币代码（如USD, JPY, EUR）
 * @param {string} toCurrency - 目标货币代码（如CNY）
 * @returns {number} 转换后的金额
 */
export async function convertCurrency(amount, fromCurrency, toCurrency = 'CNY') {
  try {
    const rates = await getExchangeRates();
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // 转换为人民币再转目标货币
    return (amount * fromRate / toRate).toFixed(2);
  } catch (error) {
    console.error('货币转换失败:', error);
    return amount;
  }
}

/**
 * 获取常用货币汇率（人民币兑换100单位对应的人民币
 * @returns {Promise<Array>} 常用汇率列表
 */
export async function getCommonRates() {
  try {
    const rates = await getExchangeRates();
    const commonCurrencies = [
      { code: 'USD', name: '美元', flag: '🇺🇸' },
      { code: 'JPY', name: '日元', flag: '🇯🇵' },
      { code: 'EUR', name: '欧元', flag: '🇪🇺' },
      { code: 'GBP', name: '英镑', flag: '🇬🇧' },
      { code: 'KRW', name: '韩元', flag: '🇰🇷' },
      { code: 'THB', name: '泰铢', flag: '🇹🇭' },
      { code: 'SGD', name: '新加坡元', flag: '🇸🇬' },
      { code: 'AUD', name: '澳元', flag: '🇦🇺' },
    ];

    return commonCurrencies.map(currency => ({
      ...currency,
      rate: (100 / rates[currency.code]).toFixed(2),
    }));
  } catch (error) {
    console.error('获取常用汇率失败:', error);
    return [];
  }
}

export default {
  getExchangeRates,
  convertCurrency,
  getCommonRates,
};
