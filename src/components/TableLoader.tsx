export default function TableLoader({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <tbody className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="p-4">
              <div className="h-4 bg-slate-200 rounded w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
