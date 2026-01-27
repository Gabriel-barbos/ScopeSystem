import React from "react";
import { DatePicker, Button, Space } from "antd";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface DateRangeFilterProps {
  onChange: (dates: [string, string] | null) => void;
  onClear: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onChange, onClear }) => {
  const [dates, setDates] = React.useState<[Dayjs, Dayjs] | null>(null);

  const handleChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values && values[0] && values[1]) {
      setDates([values[0], values[1]]);
      onChange([values[0].toISOString(), values[1].toISOString()]);
    }
  };

  const handleClear = () => {
    setDates(null);
    onClear();
  };

  return (
    <div className="p-2">
      <RangePicker
        value={dates}
        onChange={handleChange}
        format="DD/MM/YYYY"
        placeholder={["Data inicial", "Data final"]}
        className="w-full mb-2"
      />
      <Button size="small" onClick={handleClear} className="w-full">
        Limpar
      </Button>
    </div>
  );
};