import { Trash2, Edit2 } from 'lucide-react';

export default function ExpenseCard({ expense, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 
                    hover:bg-gray-50 rounded-lg transition-colors group">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{expense.category?.emoji || '💸'}</span>
        <div>
          <p className="font-medium text-gray-900">{expense.title}</p>
          <p className="text-xs text-gray-400">
            {expense.category?.name} · {new Date(expense.date).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
          {expense.type === 'income' ? '+' : '-'}₹{expense.amount?.toLocaleString('en-IN')}
        </span>
        <div className="hidden group-hover:flex items-center gap-1">
          <button onClick={() => onEdit(expense)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(expense._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}