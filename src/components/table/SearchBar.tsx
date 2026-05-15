import { Search } from 'lucide-react';
import { Input } from '../ui/input';

export const SearchBar = ({
  searchTerm,
  onChange,
}: {
  searchTerm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative w-full h-full max-w-sm">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-3" />
    <Input
      type="text"
      placeholder="Search..."
      className="pl-10 w-50 h-9 text-sm"
      value={searchTerm}
      onChange={onChange}
    />
  </div>
);
