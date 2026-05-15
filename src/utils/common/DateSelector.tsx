import { CalendarIcon } from 'lucide-react'; // Using lucide-react as in your component
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// A reusable, controlled version of your custom DatePicker
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
  variant="outline"
  className={`h-8 w-full justify-start text-left font-normal ${
    !value ? 'text-muted-foreground' : ''
  }`}
>

          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}