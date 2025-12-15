
import React, { useState } from 'react';
import { Plus, Trash2, Check, CheckCircle, Circle, NotebookPen, Search } from 'lucide-react';
import { Note } from '../types';

interface NotesListProps {
  notes: Note[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ notes, onAdd, onToggle, onDelete }) => {
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const filteredNotes = notes.filter(note => {
    if (filter === 'active') return !note.completed;
    if (filter === 'completed') return note.completed;
    return true;
  });

  const completedCount = notes.filter(n => n.completed).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full shadow-lg mb-4">
          <NotebookPen size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">طلبات وملاحظات البيت</h2>
        <p className="text-slate-500 dark:text-slate-400">سجل كل ما تحتاجه لشرائه أو تذكره في مكان واحد</p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-20 z-10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="أضف طلب جديد (مثلاً: حليب، مسحوق غسيل...)"
            className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 text-lg"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg shadow-primary-500/20"
          >
            <Plus size={24} />
          </button>
        </form>
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            الكل ({notes.length})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'active' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            جاري ({notes.length - completedCount})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'completed' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            مكتمل ({completedCount})
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center">
            <NotebookPen size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">
              {filter === 'completed' ? 'لا توجد طلبات مكتملة' : 'لا توجد طلبات حالياً'}
            </p>
            {filter !== 'completed' && <p className="text-sm">أضف طلباتك من الخانة أعلاه</p>}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                note.completed
                  ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-100 dark:hover:border-primary-900/30'
              }`}
            >
              <button
                onClick={() => onToggle(note.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  note.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-primary-400'
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </button>
              
              <div 
                className={`flex-1 text-lg cursor-pointer select-none transition-all ${
                  note.completed 
                    ? 'text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600' 
                    : 'text-slate-800 dark:text-slate-100'
                }`}
                onClick={() => onToggle(note.id)}
              >
                {note.text}
              </div>

              <button
                onClick={() => onDelete(note.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="حذف"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;
