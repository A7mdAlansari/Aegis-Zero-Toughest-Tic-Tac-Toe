import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Check,
  Trash2,
  ArrowUpDown,
  Download,
  RotateCcw,
} from 'lucide-react';

export enum TaskStatus {
  Backlog = 'Backlog',
  InProgress = 'In Progress',
  Review = 'In Review',
  Completed = 'Completed',
}

export enum PriorityLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

interface WorkItem {
  id: string;
  code: string;
  title: string;
  module: string;
  owner: string;
  status: TaskStatus;
  priority: PriorityLevel;
  estimateHours: number;
  updatedAt: string;
}

const INITIAL_ITEMS: WorkItem[] = [
  {
    id: '1',
    code: 'WRK-104',
    title: 'Configure production build pipeline and asset bundling',
    module: 'Infrastructure',
    owner: 'Elena Rostova',
    status: TaskStatus.Completed,
    priority: PriorityLevel.High,
    estimateHours: 6.5,
    updatedAt: '2026-10-28',
  },
  {
    id: '2',
    code: 'WRK-108',
    title: 'Audit database index performance on ledger queries',
    module: 'Core Storage',
    owner: 'Marcus Vance',
    status: TaskStatus.InProgress,
    priority: PriorityLevel.High,
    estimateHours: 12.0,
    updatedAt: '2026-10-29',
  },
  {
    id: '3',
    code: 'WRK-112',
    title: 'Implement keyboard navigation shortcuts for data grid',
    module: 'Interface',
    owner: 'Aria Chen',
    status: TaskStatus.Review,
    priority: PriorityLevel.Medium,
    estimateHours: 4.0,
    updatedAt: '2026-10-29',
  },
  {
    id: '4',
    code: 'WRK-115',
    title: 'Normalize CSV export timestamps to ISO-8601 UTC',
    module: 'Reporting',
    owner: 'David Kim',
    status: TaskStatus.InProgress,
    priority: PriorityLevel.Medium,
    estimateHours: 3.5,
    updatedAt: '2026-10-29',
  },
  {
    id: '5',
    code: 'WRK-119',
    title: 'Write integration test suite for webhook retry queue',
    module: 'Reliability',
    owner: 'Elena Rostova',
    status: TaskStatus.Backlog,
    priority: PriorityLevel.High,
    estimateHours: 8.0,
    updatedAt: '2026-10-27',
  },
  {
    id: '6',
    code: 'WRK-124',
    title: 'Document role-based access policy rules for external auditors',
    module: 'Security',
    owner: 'Marcus Vance',
    status: TaskStatus.Backlog,
    priority: PriorityLevel.Low,
    estimateHours: 5.0,
    updatedAt: '2026-10-26',
  },
];

type ActiveSection = 'roadmap' | 'metrics' | 'modules' | 'export';

export default function App() {
  const [items, setItems] = useState<WorkItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'estimateHours' | 'updatedAt'>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('roadmap');

  // New task modal / inline composer state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newModule, setNewModule] = useState('Infrastructure');
  const [newOwner, setNewOwner] = useState('Elena Rostova');
  const [newPriority, setNewPriority] = useState<PriorityLevel>(PriorityLevel.Medium);
  const [newEstimate, setNewEstimate] = useState('4.0');

  const modules = useMemo(() => {
    const set = new Set(items.map((i) => i.module));
    return ['ALL', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.module.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        const matchesModule = moduleFilter === 'ALL' || item.module === moduleFilter;
        return matchesSearch && matchesStatus && matchesModule;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'code') {
          comparison = a.code.localeCompare(b.code);
        } else if (sortBy === 'estimateHours') {
          comparison = a.estimateHours - b.estimateHours;
        } else {
          comparison = a.updatedAt.localeCompare(b.updatedAt);
        }
        return sortAsc ? comparison : -comparison;
      });
  }, [items, searchQuery, statusFilter, moduleFilter, sortBy, sortAsc]);

  const metrics = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === TaskStatus.Completed).length;
    const inProgress = items.filter((i) => i.status === TaskStatus.InProgress).length;
    const totalHours = items.reduce((acc, item) => acc + item.estimateHours, 0);
    const completedHours = items
      .filter((i) => i.status === TaskStatus.Completed)
      .reduce((acc, item) => acc + item.estimateHours, 0);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      totalHours,
      completedHours,
      completionRate,
    };
  }, [items]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const nextNum = 100 + items.length * 4 + 1;
    const parsedHours = Math.max(0.5, parseFloat(newEstimate) || 2.0);
    const created: WorkItem = {
      id: String(Date.now()),
      code: `WRK-${nextNum}`,
      title: trimmed,
      module: newModule,
      owner: newOwner,
      status: TaskStatus.Backlog,
      priority: newPriority,
      estimateHours: parsedHours,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setItems((prev) => [created, ...prev]);
    setNewTitle('');
    setNewEstimate('4.0');
    setIsCreating(false);
  };

  const handleCycleStatus = (id: string) => {
    const order = [
      TaskStatus.Backlog,
      TaskStatus.InProgress,
      TaskStatus.Review,
      TaskStatus.Completed,
    ];
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextIndex = (order.indexOf(item.status) + 1) % order.length;
        return {
          ...item,
          status: order[nextIndex],
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      })
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExportCsv = () => {
    const headers = ['Code', 'Title', 'Module', 'Owner', 'Status', 'Priority', 'EstimateHours', 'Updated'];
    const rows = filteredItems.map((i) => [
      i.code,
      `"${i.title.replace(/"/g, '""')}"`,
      i.module,
      i.owner,
      i.status,
      i.priority,
      i.estimateHours.toFixed(1),
      i.updatedAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'workspace-tasks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (column: 'code' | 'estimateHours' | 'updatedAt') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('roadmap');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Workspace Studio
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#roadmap"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('roadmap');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'roadmap' ? 'text-slate-900 underline underline-offset-8' : ''
            }`}
          >
            Work Items
          </a>
          <a
            href="#metrics"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('metrics');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'metrics' ? 'text-slate-900 underline underline-offset-8' : ''
            }`}
          >
            Throughput
          </a>
          <a
            href="#modules"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('modules');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'modules' ? 'text-slate-900 underline underline-offset-8' : ''
            }`}
          >
            Modules
          </a>
          <a
            href="#export"
            onClick={(e) => {
              e.preventDefault();
              handleExportCsv();
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Export CSV
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsCreating((prev) => !prev)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Work Item</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8 space-y-8">
        {/* Header & Key Summary Metrics */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Q4 Engineering Cycle</span>
              <span aria-hidden="true">·</span>
              <span>Release 2026.10</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{metrics.total} tracked items</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Release Readiness & Delivery Ledger
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track engineering deliverables, review cycle estimates, and verify module completion before production cutover.
            </p>
          </div>

          {/* Structured Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
            <div>
              <div className="text-xs text-slate-500">Completion Rate</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {metrics.completionRate}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                {metrics.completed} of {metrics.total} done
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Active Work</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {metrics.inProgress}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">In progress</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Scoped Effort</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {metrics.totalHours.toFixed(1)}h
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                {metrics.completedHours.toFixed(1)}h delivered
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Remaining</div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {(metrics.totalHours - metrics.completedHours).toFixed(1)}h
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Estimated</div>
            </div>
          </div>
        </section>

        {/* Task Creation Drawer / Form */}
        {isCreating && (
          <section className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Log New Deliverable</h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Work Item Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Verify zero-downtime migration script"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Module
                </label>
                <select
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Core Storage">Core Storage</option>
                  <option value="Interface">Interface</option>
                  <option value="Reporting">Reporting</option>
                  <option value="Reliability">Reliability</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Owner
                </label>
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={PriorityLevel.High}>High</option>
                  <option value={PriorityLevel.Medium}>Medium</option>
                  <option value={PriorityLevel.Low}>Low</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Est. (h)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={newEstimate}
                  onChange={(e) => setNewEstimate(e.target.value)}
                  className="w-full px-2.5 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filter & Search Toolbar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Interactive Segmented Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
            {(['ALL', TaskStatus.Backlog, TaskStatus.InProgress, TaskStatus.Review, TaskStatus.Completed] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'ALL' ? 'All Statuses' : status}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Module Filter */}
            <select
              aria-label="Filter by module"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {modules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod === 'ALL' ? 'All Modules' : mod}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by code, title, owner..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 w-60"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </section>

        {/* High-Density Data Grid */}
        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4 w-28">
                      <button
                        type="button"
                        onClick={() => handleSort('code')}
                        className="flex items-center gap-1 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Code</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">Deliverable</th>
                    <th className="py-3 px-4 w-36">Module</th>
                    <th className="py-3 px-4 w-40">Owner</th>
                    <th className="py-3 px-4 w-36">Status</th>
                    <th className="py-3 px-4 w-24">Priority</th>
                    <th className="py-3 px-4 w-28 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('estimateHours')}
                        className="flex items-center justify-end gap-1 ml-auto hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Estimate</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 w-32 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('updatedAt')}
                        className="flex items-center justify-end gap-1 ml-auto hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Updated</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-2.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {item.code}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        <span
                          className={
                            item.status === TaskStatus.Completed
                              ? 'line-through text-slate-400'
                              : ''
                          }
                        >
                          {item.title}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {item.module}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                        {item.owner}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(item.id)}
                          title="Click to advance status"
                          className={`text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer underline decoration-dotted underline-offset-4 ${
                            item.status === TaskStatus.Completed
                              ? 'text-emerald-700'
                              : item.status === TaskStatus.InProgress
                              ? 'text-amber-700'
                              : item.status === TaskStatus.Review
                              ? 'text-slate-900'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-xs whitespace-nowrap">
                        <span
                          className={
                            item.priority === PriorityLevel.High
                              ? 'text-red-700 font-semibold'
                              : item.priority === PriorityLevel.Medium
                              ? 'text-slate-700'
                              : 'text-slate-500'
                          }
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {item.estimateHours.toFixed(1)}h
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {item.updatedAt}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCycleStatus(item.id)}
                            aria-label="Advance status"
                            className="p-1 text-slate-500 hover:text-slate-900 rounded transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            aria-label="Delete item"
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 px-6 text-center max-w-md mx-auto space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                No matching work items found
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                No deliverables match your current filter criteria. Reset the active filters or log a new work item to populate the release ledger.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setModuleFilter('ALL');
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log First Entry</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Module Allocation Breakdown */}
        <section id="modules" className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Effort Allocation by Module
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Total: {metrics.totalHours.toFixed(1)}h across {modules.length - 1} modules
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules
              .filter((m) => m !== 'ALL')
              .map((mod) => {
                const modItems = items.filter((i) => i.module === mod);
                const modHours = modItems.reduce((acc, i) => acc + i.estimateHours, 0);
                const modDone = modItems.filter((i) => i.status === TaskStatus.Completed).length;
                return (
                  <div
                    key={mod}
                    className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">{mod}</h3>
                      <span className="text-xs font-mono tabular-nums text-slate-600">
                        {modHours.toFixed(1)}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono tabular-nums">
                        {modDone} / {modItems.length} completed
                      </span>
                      <button
                        type="button"
                        onClick={() => setModuleFilter(mod === moduleFilter ? 'ALL' : mod)}
                        className="text-slate-900 font-medium hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {moduleFilter === mod ? 'Clear filter' : 'Filter view'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>Workspace Studio · Release Engineering Ledger</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setItems(INITIAL_ITEMS)}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Restore Default Dataset
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleExportCsv}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Download CSV
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
