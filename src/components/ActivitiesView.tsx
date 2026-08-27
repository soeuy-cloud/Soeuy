import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  History, 
  Plus, 
  UserCheck, 
  ShieldCheck 
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { ActivityTask } from '../types';

export const ActivitiesView: React.FC = () => {
  const { tasks, toggleTask, addTask, auditLogs, subView, setSubView, users } = useAccounting();

  const [activeTab, setActiveTab] = useState<string>(
    subView === 'audit' ? 'audit' : 'tasks'
  );

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(users[0]?.name || 'Somchai Prasert');
  const [taskDueDate, setTaskDueDate] = useState('2026-08-25');
  const [taskPriority, setTaskPriority] = useState<ActivityTask['priority']>('High');
  const [taskCategory, setTaskCategory] = useState<ActivityTask['category']>('Tax Filing');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    addTask({
      title: taskTitle,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
      priority: taskPriority,
      category: taskCategory,
    });

    setIsNewTaskModalOpen(false);
    setTaskTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Activities & Accounting Audit Trail
            </h1>
            <p className="text-xs text-gray-500">
              Monthly closing milestones, statutory tax deadlines, approval queues, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Action Item</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-4 pt-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'tasks'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tasks & Tax Deadlines ({tasks.filter(t => t.status !== 'Completed').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            NetSuite System Audit Trail
          </button>
        </div>
      </div>

      {/* TASKS VIEW */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center text-xs">
            <span className="font-bold text-gray-800">Monthly Accounting Closing Checklist</span>
            <span className="text-gray-500">{tasks.filter(t => t.status === 'Completed').length} of {tasks.length} Completed</span>
          </div>

          <div className="divide-y divide-gray-100 p-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`p-3 flex items-start justify-between gap-4 rounded-md transition ${
                  task.status === 'Completed' ? 'bg-emerald-50/30 opacity-75' : 'hover:bg-orange-50/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'Completed'}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 h-4 w-4 text-[#d65200] rounded border-gray-300 focus:ring-[#d65200] cursor-pointer"
                  />
                  <div>
                    <h3 className={`text-xs font-semibold ${task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-gray-400" /> Due: {task.dueDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-gray-400" /> {task.assignedTo}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 bg-gray-100 text-gray-700 rounded text-[10px]">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  task.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                  task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {task.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT TRAIL VIEW */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record Type</th>
                <th className="py-3 px-4 font-mono">Record ID</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-orange-50/20">
                  <td className="py-2.5 px-4 font-mono text-gray-600">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-semibold text-gray-900">{log.user}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-bold rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">{log.recordType}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#d65200]">{log.recordId}</td>
                  <td className="py-2.5 px-4 text-gray-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-in fade-in-50">
            <h3 className="text-base font-bold text-gray-900">Add Accounting Task / Milestone</h3>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reconcile Kasikorn Bank statement with AR ledger"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Assigned To *</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  >
                    {users.map(u => (
                      <option key={u.id} value={`${u.name} (${u.role})`}>
                        {u.name} — {u.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Tax Filing">Tax Filing</option>
                    <option value="Bank Reconciliation">Bank Reconciliation</option>
                    <option value="Invoice Approval">Invoice Approval</option>
                    <option value="Asset Check">Asset Check</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] text-white rounded text-xs font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
