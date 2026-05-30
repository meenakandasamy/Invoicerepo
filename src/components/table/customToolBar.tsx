import {
      OctagonPause ,
  Users,

} from 'lucide-react';
import { useRef } from 'react';
import CustomTooltip from '@/utils/common/components/CustomTooltip';

export const CustomToolbar = ({
  access,
  addFn,
  hide = { reassign: false, hold: true, filter: false, download: false }
}: {
  access: any;
  addFn: (type: string) => void;
  hide?: hide;

}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  return (
 <div className="flex items-center gap-4">
  {/* Reassign */}
   {!hide.reassign && (
  <CustomTooltip
    content="Reassign"
    children={
      <Users
        className={`h-4 w-4 ${
          access.hasCreateAccess
            ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        onClick={() =>
          access.hasCreateAccess && addFn('reassign')
        }
      />
    }
  />)}

   {!hide.hold && (
  <CustomTooltip
    content="Hold"
    children={
      <OctagonPause 
        className={`h-4 w-4 ${
          access.hasCreateAccess
            ? 'text-violet-600 hover:text-violet-700 cursor-pointer'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        onClick={() =>
          access.hasCreateAccess && addFn('hold')
        }
      />
    }
  />)}
</div>
  );
};
