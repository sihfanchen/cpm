import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, LayoutGrid, Clock, Users, Save, FolderOpen, FileJson, AlertTriangle, HardDrive, Edit2, Zap, Calendar, MapPin, Briefcase, FileText, UserCheck, X, ChevronRight, FilePlus, Coins, ClipboardList, Trash2, UserCog, UserPlus } from 'lucide-react';

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
        suggestedName: `project_data_${new Date().toISOString().split('T')[0]}.json`,
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

// --- 通用設定與選項 ---
const OPTIONS = {
  status: ["未開工", "施工中", "主體完工", "已完工", "停工中"],
  category: ["傳輸", "寬頻", "交換"],
  method: ["自辦", "發包", "發包/自辦"],
  type: ["新設", "擴充", "汰換"],
};

// --- 子視圖元件 ---

// 1. 歡迎頁面
const WelcomeView = ({ onOpen, onNew, isSupported }) => (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 animate-fade-in">
        <div className="text-center mb-12">
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
                <div className="relative z-10">
                    <div className="p-3 bg-emerald-100 rounded-2xl mb-4 w-fit group-hover:scale-110 transition-transform duration-300">
                        <PlusCircle size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">建立新專案檔</h3>
                    <p className="text-slate-500">從頭開始一個新的資料庫檔案。</p>
                </div>
            </button>

            <button onClick={onOpen} className="text-left p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 group relative overflow-hidden">
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

// 2. 專案查詢列表 (橫式表格 - 已簡化欄位)
const ProjectInquiryView = ({ projects, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = projects.filter(p => 
    (p.projectId && p.projectId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.projectName && p.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.contractor && p.contractor.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getStatusClasses = (status) => {
    switch (status) {
      case '施工中': return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
      case '主體完工': return 'bg-blue-100 text-blue-700 ring-blue-500/20';
      case '已完工': return 'bg-slate-800 text-white ring-slate-500/20';
      case '停工中': return 'bg-red-100 text-red-700 ring-red-500/20';
      default: return 'bg-slate-100 text-slate-600 ring-slate-500/20'; // 未開工
    }
  };

  return (
    <div className="glass-panel w-full h-full flex flex-col rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex-shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">工程案查詢</h2>
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
                placeholder="搜尋工程編號、名稱或承包商..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base placeholder:text-slate-300" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-0 bg-slate-50/50">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-3 text-left w-32">工程編號</th>
                        <th className="px-6 py-3 text-left w-32">契約編號</th>
                        <th className="px-6 py-3 text-left w-32">執行現況</th>
                        <th className="px-6 py-3 text-left min-w-[400px]">工程名稱</th>
                        {/* 修正：寬度從 w-24 增加到 w-32 (約30%) */}
                        <th className="px-6 py-3 text-left w-32">工程類別</th>
                        <th className="px-6 py-3 text-center min-w-[100px]">檢視/編輯</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                    {filtered.length > 0 ? (
                        filtered.map(p => (
                            <tr key={p._id} className="hover:bg-emerald-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-emerald-600 font-medium">{p.projectId}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono">{p.contractId || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ring-1 ${getStatusClasses(p.status)}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{p.projectName}</td>
                                <td className="px-6 py-4 text-slate-600">{p.category}</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => onEdit(p)}
                                        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200"
                                        title="編輯專案"
                                    >
                                        <Edit2 size={16} className="mr-1"/> <span className="text-xs font-bold">編輯</span>
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center">
                                    <FileJson size={48} className="mb-3 opacity-50" />
                                    <p>無符合資料</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// --- 表單元件 (新增與編輯共用) ---
const ProjectForm = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
    const defaultData = {
        projectId: '', contractId: '', status: '未開工', projectName: '', 
        year: (new Date().getFullYear() - 1911).toString(),
        category: '傳輸', method: '自辦', type: '新設', designer: '', contractor: '',
        supervisor: '', assistantSupervisor: '', inCharge: '', location: '', note: '',
        startDate: '', endDate: '', constructionOvertime: 0, supervisionOvertime: 0,
        lodgingConstructionLocal: 0, lodgingConstructionForeign: 0, 
        lodgingSupervisionLocal: 0, lodgingSupervisionForeign: 0, 
        businessTrip: 0, budgetNote: ''
    };

    const [form, setForm] = useState(initialData || defaultData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed";
    const labelClass = "block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide";
    const sectionClass = "bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4";
    const sectionTitleClass = "text-lg font-bold text-slate-800 flex items-center mb-2 pb-2 border-b border-slate-100";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className={sectionClass}>
                <h3 className={sectionTitleClass}><FileText className="w-5 h-5 mr-2 text-blue-500"/> 基本資料</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>工程編號 * {isEdit && "(唯讀)"}</label>
                        <input 
                            required 
                            type="text" 
                            name="projectId" 
                            className={inputClass} 
                            value={form.projectId} 
                            onChange={handleChange} 
                            disabled={isEdit} 
                        />
                    </div>
                    <div><label className={labelClass}>契約編號</label><input type="text" name="contractId" className={inputClass} value={form.contractId} onChange={handleChange} /></div>
                    <div><label className={labelClass}>年度</label><input type="number" name="year" className={inputClass} value={form.year} onChange={handleChange} /></div>
                    <div className="md:col-span-3"><label className={labelClass}>工程名稱 *</label><input required type="text" name="projectName" className={inputClass} value={form.projectName} onChange={handleChange} /></div>
                </div>
            </div>

            <div className={sectionClass}>
                <h3 className={sectionTitleClass}><Briefcase className="w-5 h-5 mr-2 text-purple-500"/> 分類與狀態</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className={labelClass}>執行現況</label>
                        <select name="status" className={inputClass} value={form.status} onChange={handleChange}>
                            {OPTIONS.status.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>工程類別</label>
                        <select name="category" className={inputClass} value={form.category} onChange={handleChange}>
                            {OPTIONS.category.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>施工方式</label>
                        <select name="method" className={inputClass} value={form.method} onChange={handleChange}>
                            {OPTIONS.method.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>工程性質</label>
                        <select name="type" className={inputClass} value={form.type} onChange={handleChange}>
                            {OPTIONS.type.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className={sectionClass}>
                <h3 className={sectionTitleClass}><UserCheck className="w-5 h-5 mr-2 text-green-500"/> 人員與地點</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className={labelClass}>設計員</label><input type="text" name="designer" className={inputClass} value={form.designer} onChange={handleChange} /></div>
                    <div><label className={labelClass}>負責員</label><input type="text" name="inCharge" className={inputClass} value={form.inCharge} onChange={handleChange} /></div>
                    <div><label className={labelClass}>承包商名稱</label><input type="text" name="contractor" className={inputClass} value={form.contractor} onChange={handleChange} /></div>
                    <div><label className={labelClass}>監工員</label><input type="text" name="supervisor" className={inputClass} value={form.supervisor} onChange={handleChange} /></div>
                    <div><label className={labelClass}>助理監工員</label><input type="text" name="assistantSupervisor" className={inputClass} value={form.assistantSupervisor} onChange={handleChange} /></div>
                    <div className="md:col-span-3">
                        <label className={labelClass}><MapPin className="w-3 h-3 inline mr-1"/>施工地點</label>
                        <input type="text" name="location" className={inputClass} value={form.location} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={sectionClass}>
                <h3 className={sectionTitleClass}><Clock className="w-5 h-5 mr-2 text-orange-500"/> 時程與預算設定</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2"><label className={labelClass}>預定開工日期</label><input type="date" name="startDate" className={inputClass} value={form.startDate} onChange={handleChange} /></div>
                    <div className="md:col-span-2"><label className={labelClass}>預定完工日期</label><input type="date" name="endDate" className={inputClass} value={form.endDate} onChange={handleChange} /></div>
                    
                    {/* 食宿欄位 */}
                    <div><label className={labelClass}>食宿(施工.本地)</label><input type="number" name="lodgingConstructionLocal" className={inputClass} value={form.lodgingConstructionLocal} onChange={handleChange} /></div>
                    <div><label className={labelClass}>食宿(施工.外地)</label><input type="number" name="lodgingConstructionForeign" className={inputClass} value={form.lodgingConstructionForeign} onChange={handleChange} /></div>
                    <div><label className={labelClass}>食宿(監工.本地)</label><input type="number" name="lodgingSupervisionLocal" className={inputClass} value={form.lodgingSupervisionLocal} onChange={handleChange} /></div>
                    <div><label className={labelClass}>食宿(監工.外地)</label><input type="number" name="lodgingSupervisionForeign" className={inputClass} value={form.lodgingSupervisionForeign} onChange={handleChange} /></div>
                    
                    <div><label className={labelClass}>施工加班(時)</label><input type="number" name="constructionOvertime" className={inputClass} value={form.constructionOvertime} onChange={handleChange} /></div>
                    <div><label className={labelClass}>監工加班(時)</label><input type="number" name="supervisionOvertime" className={inputClass} value={form.supervisionOvertime} onChange={handleChange} /></div>
                    <div><label className={labelClass}>差調</label><input type="number" name="businessTrip" className={inputClass} value={form.businessTrip} onChange={handleChange} /></div>
                </div>
            </div>

            <div className={sectionClass}>
                <h3 className={sectionTitleClass}><FileJson className="w-5 h-5 mr-2 text-gray-500"/> 其他備註</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div><label className={labelClass}>備註</label><textarea rows="2" name="note" className={inputClass} value={form.note} onChange={handleChange}></textarea></div>
                    <div><label className={labelClass}>預算工日備註</label><textarea rows="2" name="budgetNote" className={inputClass} value={form.budgetNote} onChange={handleChange}></textarea></div>
                </div>
            </div>

            <div className="pt-4 flex justify-end space-x-4">
                {onCancel && <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors">取消</button>}
                <button type="submit" className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all flex items-center">
                    {isEdit ? <><Zap className="w-5 h-5 mr-2"/> 更新專案</> : <><PlusCircle className="w-5 h-5 mr-2"/> 確認新增</>}
                </button>
            </div>
        </form>
    );
};

const ProjectAddView = ({ onAdd }) => {
    return (
        <div className="w-full h-full flex flex-col animate-fade-in">
            <div className="p-6 md:p-8 border-b border-slate-200 bg-white shadow-sm flex-shrink-0 z-10">
                <h2 className="text-3xl font-extrabold text-slate-800 flex items-center">
                    <PlusCircle className="mr-3 text-emerald-600"/> 新增工程案
                </h2>
                <p className="text-slate-500 mt-1">請填寫詳細資料 (共 23 欄位)。</p>
            </div>
            <div className="flex-grow overflow-auto p-6 md:p-8 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <ProjectForm onSubmit={onAdd} />
                </div>
            </div>
        </div>
    );
};

const EditProjectModal = ({ project, onUpdate, onClose }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <Edit2 className="w-5 h-5 mr-3 text-blue-600" /> 
                        編輯專案: {project.projectId}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <ProjectForm initialData={project} onSubmit={onUpdate} onCancel={onClose} isEdit={true} />
                </div>
            </div>
        </div>
    );
};

// 4. 工時填報模組
const TimeEntryView = ({ projects, timeEntries, employees, onAddEntry, onDeleteEntry }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [detailProject, setDetailProject] = useState(null);

    const filteredProjects = projects.filter(p => 
        (p.projectId && p.projectId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.projectName && p.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const calculateRemaining = (project) => {
        const entries = timeEntries.filter(e => e.projectId === project.projectId);
        const spent = {
            lodgingConstructionLocal: entries.reduce((acc, curr) => acc + (parseFloat(curr.lodgingConstructionLocalSpent) || 0), 0),
            lodgingConstructionForeign: entries.reduce((acc, curr) => acc + (parseFloat(curr.lodgingConstructionForeignSpent) || 0), 0),
            lodgingSupervisionLocal: entries.reduce((acc, curr) => acc + (parseFloat(curr.lodgingSupervisionLocalSpent) || 0), 0),
            lodgingSupervisionForeign: entries.reduce((acc, curr) => acc + (parseFloat(curr.lodgingSupervisionForeignSpent) || 0), 0),
            constructionOvertime: entries.reduce((acc, curr) => acc + (parseFloat(curr.constructionOvertimeSpent) || 0), 0),
            supervisionOvertime: entries.reduce((acc, curr) => acc + (parseFloat(curr.supervisionOvertimeSpent) || 0), 0),
        };
        return {
            lodgingConstructionLocal: (parseFloat(project.lodgingConstructionLocal) || 0) - spent.lodgingConstructionLocal,
            lodgingConstructionForeign: (parseFloat(project.lodgingConstructionForeign) || 0) - spent.lodgingConstructionForeign,
            lodgingSupervisionLocal: (parseFloat(project.lodgingSupervisionLocal) || 0) - spent.lodgingSupervisionLocal,
            lodgingSupervisionForeign: (parseFloat(project.lodgingSupervisionForeign) || 0) - spent.lodgingSupervisionForeign,
            constructionOvertime: (parseFloat(project.constructionOvertime) || 0) - spent.constructionOvertime,
            supervisionOvertime: (parseFloat(project.supervisionOvertime) || 0) - spent.supervisionOvertime,
        };
    };

    const handleOpenAddModal = (project) => {
        setSelectedProject(project);
        setIsAddModalOpen(true);
    };

    const handleOpenDetailModal = (project) => {
        setDetailProject(project);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="glass-panel w-full h-full flex flex-col rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex-shrink-0">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">工時填報查詢</h2>
                </div>
                <div className="relative shadow-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="搜尋工程..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-0 bg-slate-50/50">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        {/* 修改字體大小為 text-xs */}
                        <thead className="bg-slate-100 sticky top-0 z-10 text-xs font-bold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left">工程編號</th>
                                <th className="px-4 py-3 text-left min-w-[150px]">工程名稱</th>
                                {/* 加寬施工方式 */}
                                <th className="px-4 py-3 text-left min-w-[100px]">施工方式</th>
                                {/* 加寬施工現況，並改名 */}
                                <th className="px-4 py-3 text-left min-w-[80px]">施工現況</th>
                                {/* 縮減食宿欄位，加入換行 */}
                                <th className="px-1 py-3 text-right bg-blue-50 text-blue-800 w-18">剩餘食宿<br/>(施工.本地)</th>
                                <th className="px-1 py-3 text-right bg-blue-50 text-blue-800 w-18">剩餘食宿<br/>(施工.外地)</th>
                                <th className="px-1 py-3 text-right bg-green-50 text-green-800 w-18">剩餘食宿<br/>(監工.本地)</th>
                                <th className="px-1 py-3 text-right bg-green-50 text-green-800 w-18">剩餘食宿<br/>(監工.外地)</th>
                                {/* 縮減加班欄位，加入換行 */}
                                <th className="px-1 py-3 text-right bg-orange-50 text-orange-800 w-18">剩餘加班<br/>(施工)</th>
                                <th className="px-1 py-3 text-right bg-orange-50 text-orange-800 w-18">剩餘加班<br/>(監工)</th>
                                <th className="px-4 py-3 text-left min-w-[200px]">備註</th>
                                <th className="px-4 py-3 text-center">申報</th>
                                <th className="px-4 py-3 text-center">動支明細</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-sm">
                            {filteredProjects.map(p => {
                                const remaining = calculateRemaining(p);
                                return (
                                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-emerald-600">{p.projectId}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{p.projectName}</td>
                                        <td className="px-4 py-3 text-slate-600">{p.method}</td>
                                        <td className="px-4 py-3 text-slate-600">{p.status}</td>
                                        {/* 縮減顯示，恢復 text-sm */}
                                        <td className={`px-1 py-3 text-right font-mono text-sm ${remaining.lodgingConstructionLocal < 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>{remaining.lodgingConstructionLocal}</td>
                                        <td className={`px-1 py-3 text-right font-mono text-sm ${remaining.lodgingConstructionForeign < 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>{remaining.lodgingConstructionForeign}</td>
                                        <td className={`px-1 py-3 text-right font-mono text-sm ${remaining.lodgingSupervisionLocal < 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>{remaining.lodgingSupervisionLocal}</td>
                                        <td className={`px-1 py-3 text-right font-mono text-sm ${remaining.lodgingSupervisionForeign < 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>{remaining.lodgingSupervisionForeign}</td>
                                        <td className={`px-1 py-3 text-right font-mono text-sm ${remaining.constructionOvertime < 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>{remaining.constructionOvertime}</td>
                                        <td className={`px-1 py-3 text-right font-mono text-sm ${remaining.supervisionOvertime < 0 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>{remaining.supervisionOvertime}</td>
                                        <td className="px-4 py-3 text-slate-500 whitespace-pre-wrap min-w-[200px]">{p.budgetNote}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => handleOpenAddModal(p)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors" title="申報動支">
                                                <FilePlus size={18} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => handleOpenDetailModal(p)} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" title="查看明細">
                                                <ClipboardList size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && selectedProject && (
                <AddTimeEntryModal 
                    project={selectedProject} 
                    remaining={calculateRemaining(selectedProject)}
                    employees={employees}
                    onSubmit={(entry) => {
                        onAddEntry(entry);
                        setIsAddModalOpen(false);
                    }} 
                    onClose={() => setIsAddModalOpen(false)} 
                />
            )}

            {isDetailModalOpen && detailProject && (
                <TimeEntryDetailModal 
                    project={detailProject} 
                    entries={timeEntries.filter(e => e.projectId === detailProject.projectId)}
                    onClose={() => setIsDetailModalOpen(false)} 
                    onDeleteEntry={onDeleteEntry}
                />
            )}
        </div>
    );
};

// --- 新增動支 Modal (更新欄位) ---
const AddTimeEntryModal = ({ project, remaining, employees = [], onSubmit, onClose }) => {
    const [entry, setEntry] = useState({
        projectId: project.projectId,
        employeeId: '',
        employeeName: '',
        date: new Date().toISOString().split('T')[0],
        lodgingConstructionLocalSpent: 0,
        lodgingConstructionForeignSpent: 0,
        lodgingSupervisionLocalSpent: 0,
        lodgingSupervisionForeignSpent: 0,
        constructionOvertimeSpent: 0,
        supervisionOvertimeSpent: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'employeeId') {
            const matchedEmp = employees.find(emp => emp.id === value);
            if (matchedEmp) {
                setEntry(prev => ({ ...prev, employeeId: value, employeeName: matchedEmp.name }));
            } else {
                setEntry(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'employeeName') {
            const matchedEmp = employees.find(emp => emp.name === value);
            if (matchedEmp) {
                setEntry(prev => ({ ...prev, employeeName: value, employeeId: matchedEmp.id }));
            } else {
                setEntry(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setEntry(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(entry);
    };

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm";
    const labelClass = "block text-xs font-bold text-slate-500 mb-1 uppercase flex justify-between";
    const remainingClass = (val) => val < 0 ? "text-red-500 font-bold" : "text-blue-500";

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
                    <h3 className="text-lg font-bold text-emerald-800 flex items-center">
                        <Coins className="mr-2" size={20}/> 新增動支: {project.projectName}
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">員工編號</label>
                            <input 
                                required 
                                list="employee-ids"
                                type="text" 
                                name="employeeId" 
                                className={inputClass} 
                                value={entry.employeeId} 
                                onChange={handleChange}
                                placeholder="輸入或選擇..."
                            />
                            <datalist id="employee-ids">
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">員工姓名</label>
                            <input 
                                required 
                                list="employee-names"
                                type="text" 
                                name="employeeName" 
                                className={inputClass} 
                                value={entry.employeeName} 
                                onChange={handleChange}
                                placeholder="輸入或選擇..."
                            />
                            <datalist id="employee-names">
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.name}>{emp.id}</option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">動支日期</label><input required type="date" name="date" className={inputClass} value={entry.date} onChange={handleChange}/></div>
                    
                    <div className="border-t border-slate-100 pt-4 mt-2">
                        <div className="text-sm font-bold text-slate-700 mb-3">動支項目</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>食宿(施工.本地) <span className={remainingClass(remaining.lodgingConstructionLocal)}>剩餘: {remaining.lodgingConstructionLocal}</span></label>
                                <input type="number" name="lodgingConstructionLocalSpent" className={inputClass} value={entry.lodgingConstructionLocalSpent} onChange={handleChange}/>
                            </div>
                            <div>
                                <label className={labelClass}>食宿(施工.外地) <span className={remainingClass(remaining.lodgingConstructionForeign)}>剩餘: {remaining.lodgingConstructionForeign}</span></label>
                                <input type="number" name="lodgingConstructionForeignSpent" className={inputClass} value={entry.lodgingConstructionForeignSpent} onChange={handleChange}/>
                            </div>
                            <div>
                                <label className={labelClass}>食宿(監工.本地) <span className={remainingClass(remaining.lodgingSupervisionLocal)}>剩餘: {remaining.lodgingSupervisionLocal}</span></label>
                                <input type="number" name="lodgingSupervisionLocalSpent" className={inputClass} value={entry.lodgingSupervisionLocalSpent} onChange={handleChange}/>
                            </div>
                            <div>
                                <label className={labelClass}>食宿(監工.外地) <span className={remainingClass(remaining.lodgingSupervisionForeign)}>剩餘: {remaining.lodgingSupervisionForeign}</span></label>
                                <input type="number" name="lodgingSupervisionForeignSpent" className={inputClass} value={entry.lodgingSupervisionForeignSpent} onChange={handleChange}/>
                            </div>
                            <div>
                                <label className={labelClass}>施工加班(時) <span className={remainingClass(remaining.constructionOvertime)}>剩餘: {remaining.constructionOvertime}</span></label>
                                <input type="number" name="constructionOvertimeSpent" className={inputClass} value={entry.constructionOvertimeSpent} onChange={handleChange}/>
                            </div>
                            <div>
                                <label className={labelClass}>監工加班(時) <span className={remainingClass(remaining.supervisionOvertime)}>剩餘: {remaining.supervisionOvertime}</span></label>
                                <input type="number" name="supervisionOvertimeSpent" className={inputClass} value={entry.supervisionOvertimeSpent} onChange={handleChange}/>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">取消</button>
                        <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">確認申報</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 動支明細 Modal (更新欄位) ---
const TimeEntryDetailModal = ({ project, entries, onClose, onDeleteEntry }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50">
                    <h3 className="text-lg font-bold text-blue-800 flex items-center">
                        <ClipboardList className="mr-2" size={20}/> 動支明細: {project.projectName} ({project.projectId})
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="flex-1 overflow-auto p-0">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left">動支日期</th>
                                <th className="px-4 py-3 text-left">員工姓名</th>
                                <th className="px-4 py-3 text-right">食宿(施.本)</th>
                                <th className="px-4 py-3 text-right">食宿(施.外)</th>
                                <th className="px-4 py-3 text-right">食宿(監.本)</th>
                                <th className="px-4 py-3 text-right">食宿(監.外)</th>
                                <th className="px-4 py-3 text-right">施工加班</th>
                                <th className="px-4 py-3 text-right">監工加班</th>
                                <th className="px-4 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-sm">
                            {entries.length > 0 ? entries.map(e => (
                                <tr key={e._id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-600">{e.date}</td>
                                    <td className="px-4 py-3 text-slate-800">{e.employeeName} <span className="text-xs text-slate-400">({e.employeeId})</span></td>
                                    <td className="px-4 py-3 text-right font-mono">{e.lodgingConstructionLocalSpent || 0}</td>
                                    <td className="px-4 py-3 text-right font-mono">{e.lodgingConstructionForeignSpent || 0}</td>
                                    <td className="px-4 py-3 text-right font-mono">{e.lodgingSupervisionLocalSpent || 0}</td>
                                    <td className="px-4 py-3 text-right font-mono">{e.lodgingSupervisionForeignSpent || 0}</td>
                                    <td className="px-4 py-3 text-right font-mono">{e.constructionOvertimeSpent || 0}</td>
                                    <td className="px-4 py-3 text-right font-mono">{e.supervisionOvertimeSpent || 0}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => onDeleteEntry(e._id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            title="刪除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400">尚無動支紀錄</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">關閉</button>
                </div>
            </div>
        </div>
    );
};

// 5. 員工管理頁面 (修改：將操作欄位標題與按鈕改為刪除)
const EmployeeManagementView = ({ employees, onAddEmployee, onDeleteEmployee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredEmployees = employees.filter(e => 
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        onDeleteEmployee(id);
    };

    const handleSave = (employeeData) => {
        onAddEmployee(employeeData);
        setIsModalOpen(false);
    };

    return (
        <div className="glass-panel w-full h-full flex flex-col rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex-shrink-0">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">員工管理</h2>
                    <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center shadow-lg transition-all">
                        <UserPlus size={18} className="mr-2" /> 新增員工
                    </button>
                </div>
                <div className="relative shadow-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="搜尋員工編號或姓名..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-0 bg-slate-50/50">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100 sticky top-0 z-10 text-xs font-bold uppercase tracking-wider text-slate-600">
                            <tr>
                                {/* 加寬員工編號欄位 */}
                                <th className="px-6 py-3 text-left min-w-[200px]">員工編號</th>
                                {/* 加寬員工姓名欄位 */}
                                <th className="px-6 py-3 text-left min-w-[200px]">員工姓名</th>
                                <th className="px-6 py-3 text-center">刪除</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-sm">
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-emerald-600 font-medium">{emp.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{emp.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" title="刪除">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                                        無符合員工資料
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <EmployeeModal 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

// --- 員工編輯/新增 Modal (簡化為僅新增) ---
const EmployeeModal = ({ onSave, onClose }) => {
    const [form, setForm] = useState({ id: '', name: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm";
    const labelClass = "block text-xs font-bold text-slate-500 mb-1 uppercase";

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50">
                    <h3 className="text-lg font-bold text-blue-800 flex items-center">
                        <UserCog className="mr-2" size={20}/> 新增員工
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={labelClass}>員工編號</label>
                        <input required type="text" name="id" className={inputClass} value={form.id} onChange={handleChange} />
                    </div>
                    <div>
                        <label className={labelClass}>員工姓名</label>
                        <input required type="text" name="name" className={inputClass} value={form.name} onChange={handleChange} />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">取消</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">儲存</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReportsView = () => (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
            <LayoutGrid size={64} className="mx-auto mb-6 text-slate-300" />
            <h3 className="text-2xl font-extrabold text-slate-700 mb-3">統計報表模組</h3>
            <p className="text-slate-500">將統計食宿工日、加班時數與案件分類分佈。</p>
        </div>
    </div>
);

// --- Sidebar 元件 ---
const Sidebar = ({ currentView, setCurrentView, fileName, isUnsaved, onOpenFile, onNewFile, onSaveFile, statusMsg }) => {
  const navItems = [
    { id: 'inquiry', label: '工程案查詢', icon: Search },
    { id: 'add', label: '工程案新增', icon: PlusCircle },
    { id: 'hours', label: '工時填報', icon: Clock },
    { id: 'employees', label: '員工管理', icon: UserCog },
    { id: 'reports', label: '報表總覽', icon: LayoutGrid },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white shadow-2xl h-full p-4 flex-shrink-0 z-20">
      <div className="flex items-center space-x-3 p-3 mb-8 border-b border-slate-700">
        <div className="bg-emerald-500/20 p-2 rounded-lg"><Users className="w-6 h-6 text-emerald-400" /></div>
        <div><h1 className="text-lg font-bold tracking-wider">工程管理</h1><span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-slate-600">CPM V1.1</span></div>
      </div>

      <div className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex justify-between mb-3 text-xs text-slate-400 font-bold uppercase tracking-widest">檔案操作 {isUnsaved && <span className="text-red-500 animate-pulse">●</span>}</div>
        <div className="space-y-2">
            <button onClick={onOpenFile} className="w-full flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors text-blue-300"><FolderOpen size={16} className="mr-2"/> 開啟舊檔</button>
            <button onClick={onNewFile} className="w-full flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors text-emerald-300"><PlusCircle size={16} className="mr-2"/> 建立新檔</button>
            <button onClick={onSaveFile} className={`w-full flex items-center justify-center px-3 py-2 rounded text-sm font-bold mt-2 ${isUnsaved ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-300'}`}><Save size={16} className="mr-2"/> {isUnsaved ? '儲存變更' : '已儲存'}</button>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-center text-slate-400 truncate">{fileName || '(未命名草稿)'}</div>
        {statusMsg && <div className="text-xs text-emerald-400 text-center mt-1 animate-pulse">{statusMsg}</div>}
      </div>

      <nav className="flex-grow space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            disabled={!fileName}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${currentView === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${!fileName && 'opacity-30 cursor-not-allowed'}`}
          >
            <item.icon size={18} className="mr-3" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- 主應用程式 ---
const App = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]); 
  const [employees, setEmployees] = useState([]); // 新增：員工資料狀態
  
  const [fileHandle, setFileHandle] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSupported] = useState(FileSystem.isSupported());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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
      body, html, #root { height: 100%; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
      .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
      @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }, []);

  const handleOpenFile = async () => {
    if (isUnsaved && !confirm('有未儲存變更，確定開啟新檔？')) return;
    if (!isSupported) alert('建議使用 Chrome 或 Edge。');
    const result = await FileSystem.openFile();
    if (result) {
      setFileHandle(result.handle);
      if (Array.isArray(result.data)) {
          setProjects(result.data);
          setTimeEntries([]);
          setEmployees([]);
      } else {
          setProjects(result.data.projects || []);
          setTimeEntries(result.data.timeEntries || []);
          setEmployees(result.data.employees || []);
      }
      setFileName(result.name);
      setIsUnsaved(false);
      setStatusMsg(`已開啟: ${result.name}`);
      setCurrentView('inquiry');
    }
  };

  const handleNewFile = () => {
    if (isUnsaved && !confirm('有未儲存變更，確定開新檔？')) return;
    setProjects([]);
    setTimeEntries([]);
    setEmployees([]);
    setFileHandle(null);
    setFileName('未命名專案檔.json');
    setIsUnsaved(true);
    setCurrentView('add');
    setStatusMsg('新工作階段');
  };

  const handleSaveFile = async () => {
    // 組合所有資料
    const fullData = { projects, timeEntries, employees };

    if (!isSupported) {
        const blob = new Blob([JSON.stringify(fullData, null, 2)], {type: 'application/json'});
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
        handle = await FileSystem.saveFileAs(fullData);
        if (!handle) return;
        setFileHandle(handle);
        setFileName(handle.name);
      } else {
        await FileSystem.writeFile(handle, fullData);
      }
      setIsUnsaved(false);
      setStatusMsg('儲存成功！');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) { alert('儲存失敗'); }
  };

  const updateProjects = (newProjects) => {
    setProjects(newProjects);
    setIsUnsaved(true);
  };
  
  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleUpdateProject = (updatedProject) => {
    const newProjects = projects.map(p => p._id === updatedProject._id ? updatedProject : p);
    updateProjects(newProjects);
    setIsModalOpen(false);
    setEditingProject(null);
    setStatusMsg(`專案 ${updatedProject.projectId} 已更新`);
  };

  // 新增動支紀錄
  const handleAddEntry = (entry) => {
      const newEntry = { ...entry, _id: `E_${Date.now()}` };
      setTimeEntries([...timeEntries, newEntry]);
      setIsUnsaved(true);
      setStatusMsg('動支申報成功');
  };

  // 刪除動支紀錄
  const handleDeleteEntry = (entryId) => {
      if(confirm('確定要刪除此筆動支紀錄嗎？')) {
          setTimeEntries(prev => prev.filter(e => e._id !== entryId));
          setIsUnsaved(true);
          setStatusMsg('已刪除動支紀錄');
      }
  };

  // 員工管理：新增員工
  const handleAddEmployee = (newEmployee) => {
      if (employees.some(e => e.id === newEmployee.id)) {
          alert('員工編號已存在');
          return;
      }
      setEmployees([...employees, newEmployee]);
      setIsUnsaved(true);
      setStatusMsg('新增員工成功');
  };

  // 員工管理：刪除員工 (新增)
  const handleDeleteEmployee = (id) => {
      if(confirm('確定要刪除此員工嗎？')) {
          setEmployees(prev => prev.filter(e => e.id !== id));
          setIsUnsaved(true);
          setStatusMsg('已刪除員工');
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'inquiry': 
        return <ProjectInquiryView projects={projects} onEdit={handleOpenEditModal} />;
      case 'add': 
        return <ProjectAddView onAdd={(p) => {
            const newP = { ...p, _id: `ID_${Date.now()}` };
            updateProjects([newP, ...projects]);
            setCurrentView('inquiry');
            setStatusMsg('新增成功 (未存檔)');
        }} />;
      case 'hours': 
        return <TimeEntryView projects={projects} timeEntries={timeEntries} employees={employees} onAddEntry={handleAddEntry} onDeleteEntry={handleDeleteEntry} />;
      case 'employees':
        // 傳遞 handleDeleteEmployee
        return <EmployeeManagementView employees={employees} onAddEmployee={handleAddEmployee} onDeleteEmployee={handleDeleteEmployee} />;
      case 'reports': return <ReportsView />;
      case 'welcome': default: return <WelcomeView onOpen={handleOpenFile} onNew={handleNewFile} isSupported={isSupported} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      <Sidebar 
        currentView={currentView} setCurrentView={setCurrentView}
        fileHandle={fileHandle} fileName={fileName} isUnsaved={isUnsaved} statusMsg={statusMsg}
        onOpenFile={handleOpenFile} onNewFile={handleNewFile} onSaveFile={handleSaveFile}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-auto w-full">
            {renderContent()}
        </div>
      </main>
      {isModalOpen && editingProject && (
        <EditProjectModal project={editingProject} onUpdate={handleUpdateProject} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default App;