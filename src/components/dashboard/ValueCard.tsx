type ValueItem = {
  label: string;
  value: number | string;
  colorClass?: string;
};

type ValueCardProps = {
  title: string;
  values: Array<ValueItem>;
  widthClass?: string;
  heightClass?: string;
};

export const ValueCard = ({
  title,
  values,
  widthClass,
  heightClass,
}: ValueCardProps) => {
  return (
    <div
      className={`bg-white shadow-lg rounded-lg p-6 border ${widthClass ?? ''} ${
        heightClass ?? 'h-[50dvh]'
      } flex flex-col`}
    >
      <h2 className="text-xl font-semibold mb-8">{title}</h2>

      <div className="flex flex-wrap gap-4 flex-1 content-start">
        {values.map(({ label, value, colorClass }, i) => (
          <div
            key={i}
            className={`bg-gray-50 rounded-md p-4 shadow-sm border flex flex-col ${
              i === 0 ? 'w-full' : 'w-[calc(50%-0.5rem)]'
            }`}
          >
            <span className="text-sm text-gray-500">{label}</span>
            <span
              className={`text-lg font-bold mt-1 ${colorClass ?? 'text-gray-700'}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
