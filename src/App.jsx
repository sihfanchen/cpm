import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, LayoutGrid, Clock, Users, Save, FolderOpen, FileJson, AlertTriangle, HardDrive, Download, ChevronRight, X, Calendar } from 'lucide-react';

// --- 檔案系統 API 封裝 ---
const FileSystem = {
  isSupported: () => 'showOpenFilePicker' in window,
  openFile: async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'Project Data Files', accept: { 'application/json': ['.json'] } }],
        multiple: false,
      });
      const file = await fileHandle.getFile();
      const contents = await file.text();
      return { handle: fileHandle, data: JSON.parse(contents), name: file.name };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('開啟失敗:', error);
        alert('無法開啟檔案。');
      }
      return null;
    }
  },
  saveFileAs: async (data) => {
    try {
      const fileHandle = await window.showSaveFilePicker({
        types: [{ description: 'Project Data Files', accept: { 'application/json': ['.json'] } }],
        suggestedName: `project_${new Date().toISOString().split('T')[0]}.json`,
      });
      await FileSystem.writeFile(fileHandle, data);
      return fileHandle;
    } catch (error) {
      if (error.name !== 'AbortError') alert('儲存失敗');
      return null;
    }
  },
  writeFile: async (fileHandle, data) => {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  }
};

// --- 子視圖元件 ---

// 1. 歡迎頁面
const WelcomeView = ({ onOpen, onNew, isSupported }) => (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 animate-fade-in">
        <div className="text-center mb-12 transform transition-all duration-500 hover:scale-105">
            <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-50 mb-6 shadow-inner border border-emerald-100/50 text-emerald-600">
                <HardDrive size={64} />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">本地工程管理系統</h2>
            <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto">
                您的資料完全掌握在自己手中，無需上傳雲端。<br/>
                <span className="text-sm text-slate-400 mt-2 block">Powered by File System Access API</span>
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
            <button onClick={onNew} className="text-left p-8 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <div className="p-3 bg-emerald-100 rounded-2xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                        <PlusCircle size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">建立新專案檔</h3>
                    <p className="text-slate-500">從頭開始一個新的資料庫檔案。</p>
                </div>
            </button>

            <button onClick={onOpen} className="text-left p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <div className="p-3 bg-blue-100 rounded-2xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">開啟現有檔案</h3>
                    <p className="text-slate-500">直接編輯電腦中的 JSON 檔案。</p>
                    {!isSupported && <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded flex items-center"><AlertTriangle size={12} className="mr-1"/> 需使用 Chrome/Edge</p>}
                </div>
            </button>
        </div>
    </div>
);

// 2. 專案查詢列表
const ProjectInquiryView = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-panel w-full h-full flex flex-col rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-white/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">專案列表</h2>
                <p className="text-slate-500 font-medium">檢視並管理所有進行中的工程案件</p>
            </div>
            <div className="flex items-center text-slate-500 font-mono text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Total: {projects.length}
            </div>
        </div>
        <div className="relative shadow-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="搜尋專案名稱、客戶..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-lg placeholder:text-slate-300" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-50/50">
        {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 min-h-[300px]">
                <FileJson size={64} className="mb-4 text-slate-300" />
                <p className="text-lg font-medium">沒有找到符合的專案</p>
            </div>
        ) : (
            // 修正：調整 grid-cols 以更靈活適應寬度，支援到 2xl 螢幕顯示 4 欄
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filtered.map(p => (
                    <div key={p.id} className="group p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-emerald-500/30 transition-all duration-300 relative flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider mb-2 inline-block">{p.id}</div>
                            <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-sm ${
                                p.status === '進行中' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' : 
                                p.status === '已完成' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20' : 
                                p.status === '暫停' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' :
                                'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
                            }`}>{p.status}</span>
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 group-hover:text-emerald-700 transition-colors mb-3 line-clamp-1">{p.name}</h3>
                        <div className="text-slate-500 text-sm mb-6 space-y-2">
                             <p className="flex items-center"><Users size={16} className="mr-2 opacity-50"/> {p.client || '未指定客戶'}</p>
                             <p className="flex items-center text-xs font-mono"><Calendar size={16} className="mr-2 opacity-50"/><span className="bg-slate-50 px-1 rounded">{p.startDate || '--'}</span><span className="mx-2 text-slate-300">→</span><span className="bg-slate-50 px-1 rounded">{p.endDate || '--'}</span></p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-50">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">進度</span>
                                <span className="text-sm font-bold text-emerald-600">{p.progress || 0}%</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{width: `${p.progress || 0}%`}}></div>
                             </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 text-xs">專案預算</span>
                                <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">NT$ {parseInt(p.budget || 0).toLocaleString()}</span>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

// 3. 新增工程案
const ProjectAddView = ({ onAdd }) => {
    const [form, setForm] = useState({ name: '', client: '', budget: '', status: '未開始', progress: 0, description: '', startDate: '', endDate: '' });
    const handleSubmit = (e) => { e.preventDefault(); onAdd(form); };
    const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700";
    const labelStyle = "block text-sm font-bold text-slate-600 mb-2 ml-1";

    return (
        <div className="w-full h-full flex flex-col animate-fade-in">
            <div className="glass-panel p-8 rounded-t-3xl md:rounded-3xl shadow-xl border border-white/50 mb-6 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 rounded-xl"><PlusCircle className="w-8 h-8 text-emerald-600" /></div>
                    <div><h2 className="text-3xl font-extrabold text-slate-800">新增工程案</h2><p className="text-slate-500 mt-1">請填寫詳細的專案資訊。資料將暫存於記憶體。</p></div>
                </div>
            </div>
            
            <div className="glass-panel p-8 rounded-b-3xl md:rounded-3xl shadow-xl border border-white/50 flex-grow overflow-auto">
                {/* 修正：移除了 max-w-4xl，改用 w-full 讓表單能隨視窗擴展 */}
                <form onSubmit={handleSubmit} className="space-y-8 w-full mx-auto">
                    <div className="space-y-6">
                        <div><label className={labelStyle}>專案名稱 <span className="text-red-400">*</span></label><input required type="text" placeholder="例如：2025年度廠房擴建工程" className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div><label className={labelStyle}>客戶名稱</label><div className="relative"><Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="客戶或公司名稱" className={`${inputStyle} pl-12`} value={form.client} onChange={e => setForm({...form, client: e.target.value})} /></div></div>
                            <div><label className={labelStyle}>預算金額 (NT$)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span><input required type="number" placeholder="0" className={`${inputStyle} pl-10 font-mono`} value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} /></div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div><label className={labelStyle}>起始日期</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="date" className={`${inputStyle} pl-12`} value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div></div>
                             <div><label className={labelStyle}>預計結束日期</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="date" className={`${inputStyle} pl-12`} value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div><label className={labelStyle}>初始狀態</label><div className="relative"><select className={`${inputStyle} appearance-none cursor-pointer`} value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="未開始">未開始</option><option value="進行中">進行中</option><option value="暫停">暫停</option><option value="已完成">已完成</option></select><ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none" /></div></div>
                            <div><label className={labelStyle}>初始進度 (%)</label><div className="flex items-center space-x-4"><input type="range" min="0" max="100" className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" value={form.progress} onChange={e => setForm({...form, progress: e.target.value})} /><span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg min-w-[3.5rem] text-center">{form.progress}%</span></div></div>
                        </div>
                        <div><label className={labelStyle}>備註說明</label><textarea rows="4" placeholder="請輸入專案的詳細描述..." className={inputStyle} value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea></div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-4">
                        <p className="text-xs text-slate-400 mr-auto flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />新增後請記得點擊左側儲存按鈕</p>
                        <button type="submit" className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-1 flex items-center"><PlusCircle className="w-5 h-5 mr-2" />確認新增</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 4. 其他頁面
const TimeEntryView = () => (
    <div className="h-full flex flex-col items-center justify-center glass-panel rounded-3xl border border-white/50 p-8 text-center shadow-xl animate-fade-in">
        <div className="bg-slate-50 p-8 rounded-full mb-6"><Clock size={64} className="text-slate-300" /></div>
        <h3 className="text-2xl font-extrabold text-slate-700 mb-3">工時填報模組</h3>
        <p className="text-slate-500 max-w-md text-lg leading-relaxed">此功能開發中。<br/>未來將允許針對特定專案填報每日工時，資料同樣會儲存在您的 JSON 檔案中。</p>
    </div>
);

const ReportsView = () => (
    <div className="h-full flex flex-col items-center justify-center glass-panel rounded-3xl border border-white/50 p-8 text-center shadow-xl animate-fade-in">
        <div className="bg-slate-50 p-8 rounded-full mb-6"><LayoutGrid size={64} className="text-slate-300" /></div>
        <h3 className="text-2xl font-extrabold text-slate-700 mb-3">統計報表模組</h3>
        <p className="text-slate-500 max-w-md text-lg leading-relaxed">此功能將讀取您的 JSON 檔案，自動生成預算執行率與進度甘特圖。</p>
    </div>
);

// --- Sidebar 元件 ---
const Sidebar = ({ currentView, setCurrentView, fileName, isUnsaved, onOpenFile, onNewFile, onSaveFile, statusMsg }) => {
  const navItems = [
    { id: 'inquiry', label: '工程案查詢', icon: Search },
    { id: 'add', label: '工程案新增', icon: PlusCircle },
    { id: 'hours', label: '工時填報', icon: Clock },
    { id: 'reports', label: '報表總覽', icon: LayoutGrid },
  ];

  return (
    <div className="flex flex-col w-64 sidebar-gradient text-white shadow-2xl h-full p-4 flex-shrink-0 border-r border-slate-700 z-10 relative">
      <div className="flex items-center space-x-3 p-3 mb-8 border-b border-slate-700/50">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <Users className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100">工程管理</h1>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-slate-600">Local V2</span>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">檔案控制</span>
            {isUnsaved && <span className="flex h-2.5 w-2.5 relative" title="有未儲存的變更">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>}
        </div>
        
        <div className="space-y-3">
            <button onClick={onOpenFile} className="w-full flex items-center px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition-all text-slate-200 border border-slate-600 hover:border-slate-500 group">
                <FolderOpen className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                開啟舊檔...
            </button>
            <button onClick={onNewFile} className="w-full flex items-center px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition-all text-slate-200 border border-slate-600 hover:border-slate-500 group">
                <PlusCircle className="w-4 h-4 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                建立新檔
            </button>
            <div className="h-px bg-slate-700/80 my-2"></div>
            <button onClick={onSaveFile} className={`w-full flex items-center justify-center px-3 py-3 rounded-lg text-sm font-bold transition-all shadow-md ${isUnsaved ? 'bg-emerald-600 hover:bg-emerald-500 text-white transform hover:scale-[1.02] shadow-emerald-900/50' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}>
                <Save className={`w-4 h-4 mr-2 ${isUnsaved ? 'animate-pulse' : ''}`} />
                {isUnsaved ? '儲存變更' : '已儲存'}
            </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/50">
            <div className="flex items-center mb-1 bg-slate-900/50 p-2 rounded text-slate-300">
                <FileJson className="w-4 h-4 text-slate-500 mr-2" />
                <p className="text-xs font-mono font-bold truncate flex-1" title={fileName}>{fileName || '(未命名草稿)'}</p>
            </div>
            {statusMsg && <p className="text-[10px] text-emerald-400 text-center animate-pulse mt-1 font-medium">{statusMsg}</p>}
        </div>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => {
          const isDisabled = !fileName;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              disabled={isDisabled}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 
                ${currentView === item.id 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                } 
                ${isDisabled ? 'opacity-30 cursor-not-allowed grayscale hover:bg-transparent hover:text-slate-400 hover:translate-x-0' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 mr-3 ${currentView === item.id ? 'text-emerald-100' : ''}`} />
              <span className="text-sm">{item.label}</span>
              {currentView === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// --- 主應用程式 ---
const App = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [projects, setProjects] = useState([]);
  const [fileHandle, setFileHandle] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSupported] = useState(FileSystem.isSupported());

  useEffect(() => {
    if (!document.querySelector('#tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }
    
    const style = document.createElement('style');
    style.innerHTML = `
      body, html, #root { height: 100%; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
      .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
      .sidebar-gradient { background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); }
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }, []);

  const handleOpenFile = async () => {
    if (isUnsaved && !confirm('有未儲存變更，確定開啟新檔？')) return;
    if (!isSupported) alert('建議使用 Chrome 或 Edge 以獲得最佳體驗。');

    const result = await FileSystem.openFile();
    if (result) {
      setFileHandle(result.handle);
      setProjects(result.data);
      setFileName(result.name);
      setIsUnsaved(false);
      setStatusMsg(`已開啟: ${result.name}`);
      setCurrentView('inquiry');
    }
  };

  const handleNewFile = () => {
    if (isUnsaved && !confirm('有未儲存變更，確定開新檔？')) return;
    setProjects([]);
    setFileHandle(null);
    setFileName('未命名專案檔.json');
    setIsUnsaved(true);
    setCurrentView('add');
    setStatusMsg('已建立新工作階段 (尚未存檔)');
  };

  const handleSaveFile = async () => {
    if (!isSupported) {
        const blob = new Blob([JSON.stringify(projects, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'project_data.json';
        a.click();
        setIsUnsaved(false);
        return;
    }

    try {
      let handle = fileHandle;
      if (!handle) {
        handle = await FileSystem.saveFileAs(projects);
        if (!handle) return;
        setFileHandle(handle);
        setFileName(handle.name);
      } else {
        await FileSystem.writeFile(handle, projects);
      }
      setIsUnsaved(false);
      setStatusMsg('儲存成功！');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) {
      alert('儲存失敗，請重試。');
    }
  };

  const updateProjects = (newProjects) => {
    setProjects(newProjects);
    setIsUnsaved(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'inquiry': 
        return <ProjectInquiryView projects={projects} />;
      case 'add': 
        return <ProjectAddView onAdd={(p) => {
            const newP = { ...p, id: `PRJ-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() };
            updateProjects([newP, ...projects]);
            setCurrentView('inquiry');
            setStatusMsg('新增成功，請記得存檔');
        }} />;
      case 'hours': 
        return <TimeEntryView />;
      case 'reports': 
        return <ReportsView />;
      case 'welcome': 
      default: 
        return <WelcomeView onOpen={handleOpenFile} onNew={handleNewFile} isSupported={isSupported} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      <Sidebar 
        currentView={currentView} setCurrentView={setCurrentView}
        fileHandle={fileHandle} fileName={fileName} isUnsaved={isUnsaved} statusMsg={statusMsg}
        isSupported={isSupported}
        onOpenFile={handleOpenFile} onNewFile={handleNewFile} onSaveFile={handleSaveFile}
      />
      <main className="flex-1 flex flex-col bg-slate-100/50 relative overflow-hidden">
        {/* 這裡修正了佈局：使用 flex 和 overflow-auto 讓內容區塊自動適應剩餘寬度，而非使用 absolute */}
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;