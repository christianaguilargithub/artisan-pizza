interface StatusBadgeProps {
  status: string;
}

const colorMap: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  preparing:  'bg-blue-100 text-blue-800',
  ready:      'bg-green-100 text-green-800',
  completed:  'bg-gray-100 text-gray-800',
  cancelled:  'bg-red-100 text-red-800',
  paid:       'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = colorMap[status] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${color}`}>
      {status}
    </span>
  );
}
