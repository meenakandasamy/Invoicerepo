import { ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteSessionCookie } from '@/utils/common/cookieHandler';

export default function UserOptionsMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    DeleteSessionCookie();
    sessionStorage.removeItem('session');
    window.location.replace('/saas-ticket/login');
  };
const sessionData = JSON.parse(sessionStorage.getItem('session'));

const userName = sessionData?.userName;
console.log('User Name:', userName); // Debugging log
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none group text-left">
          {/* Avatar / Initials Circle */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-700 text-white font-medium text-sm border-2 border-white dark:border-gray-900 shadow-sm">
            {userName?.charAt(0).toUpperCase()}
          </div>

          {/* User Info Labels */}
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
             {userName}
            </span>
           
          </div>

          {/* Chevron Icon */}
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="w-48 p-1.5 border border-gray-200 dark:border-gray-800 shadow-lg rounded-xl bg-white dark:bg-gray-950"
      >
        {/* <DropdownMenuItem
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => navigate({ to: '/profile' })} // Example path
        >
        
        </DropdownMenuItem> */}

        <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

        <DropdownMenuItem
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium rounded-md cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}