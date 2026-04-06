/**
 * 汇率查询模块
 * 使用 exchangerate-api.com (支持HTTPS，免费)
 * 备用: open.er-api.com
 */

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/CNY';

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
    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    cachedRates = data.rates;
    lastFetchTime = now;
    return cachedRates;
  } catch (error) {
    console.error('获取汇率失败:', error);
    // 使用备用API
    return getBackupRates();
  }
}

/**
 * 备用汇率API
 */
async function getBackupRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/CNY');
    const data = await response.json();
    cachedRates = data.rates;
    lastFetchTime = Date.now();
    return cachedRates;
  } catch (error) {
    console.error('备用API也失败:', error);
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
    // API返回的是1 CNY = X 外币，所以转换公式是：外币金额 = 人民币金额 * (1/rate)
    const rate = rates[fromCurrency];
    if (!rate) return amount;

    // 人民币转外币: amount / rate
    // 外币转人民币: amount * rate
    if (toCurrency === 'CNY') {
      return (amount / rate).toFixed(2);
    }
    return (amount * rates[toCurrency] / rate).toFixed(2);
  } catch (error) {
    console.error('货币转换失败:', error);
    return amount;
  }
}

/**
 * 获取常用货币汇率（100单位外币 = 多少人民币）
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

    return commonCurrencies.map(currency => {
      const rate = rates[currency.code];
      // API返回的是1 CNY = X 外币，所以100外币 = 100 / rate 人民币
      const cnyRate = rate ? (100 / rate).toFixed(2) : '--';
      return {
        ...currency,
        rate: cnyRate,
      };
    });
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
