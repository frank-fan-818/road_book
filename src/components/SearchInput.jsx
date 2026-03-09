import { useState } from 'react';
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const SearchInput = ({ onSearch, isLoading, error }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input);
    }
  };

  const quickPrompts = [
    '欧洲10日游，喜欢艺术和历史',
    '日本7日游，喜欢美食和温泉',
    '东南亚5日游，喜欢海岛和潜水'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            AI 个人路书
          </h1>
          <p className="text-slate-500 text-lg">
            将您的旅行意愿转化为结构化、可交互的时间轴路书
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative mb-8">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="描述您的旅行意愿，如：去东京玩3天，喜欢动漫和美食"
              className="w-full px-6 py-5 pl-14 pr-32 text-lg bg-white border-2 border-slate-200 rounded-2xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  生成路书
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-slate-400 text-center mb-4">试试这些 prompt：</p>
          <div className="flex flex-wrap justify-center gap-3">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSearch(prompt)}
                disabled={isLoading}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
