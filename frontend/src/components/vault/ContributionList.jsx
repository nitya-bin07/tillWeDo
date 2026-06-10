import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';

export default function ContributionList({ contributions = [], labelA = 'Partner A', labelB = 'Partner B' }) {
  if (!contributions.length) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No contributions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-2 font-medium">Cycle</th>
            <th className="px-4 py-2 font-medium">{labelA}</th>
            <th className="px-4 py-2 font-medium">{labelB}</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((c) => (
            <tr key={c._id} className="border-t border-gray-50">
              <td className="px-4 py-2 text-gray-700">{formatDate(c.cycleDate)}</td>
              <td className="px-4 py-2">
                <span className="mr-2 text-gray-700">{formatCurrency(c.amountA)}</span>
                <Badge status={c.statusA} />
              </td>
              <td className="px-4 py-2">
                <span className="mr-2 text-gray-700">{formatCurrency(c.amountB)}</span>
                <Badge status={c.statusB} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}