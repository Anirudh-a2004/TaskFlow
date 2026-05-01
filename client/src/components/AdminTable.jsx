import { ArrowDownUp } from 'lucide-react';

export default function AdminTable({ columns, rows, keyField = '_id' }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.05] text-xs uppercase text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 font-black">
                  <span className="inline-flex items-center gap-2">{column.label}<ArrowDownUp size={12} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row[keyField]} className="transition hover:bg-white/[0.055]">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 align-middle text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
