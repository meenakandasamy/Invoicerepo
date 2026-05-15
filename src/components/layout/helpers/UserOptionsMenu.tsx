import { CircleUserRound, LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteSessionCookie } from '@/utils/common/cookieHandler';
// import { useSidebarStore } from '@/stores/sidebarStore';

export default function UserOptionsMenu() {
  // const { mode, setMode } = useSidebarStore();

  // const toggleSidebar = () => {
  //   setMode(mode === 'menu' ? 'settings' : 'menu');
  // };
const navigate = useNavigate();
  const handleLogout = () => {
    DeleteSessionCookie();
    sessionStorage.removeItem('session');
   window.location.replace('/saas-po/login');
    window.location.reload();
  };

  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none">
          <CircleUserRound
  size={28}
  className="text-black hover:[color:var(--primary)] dark:text-[var(--foreground)] dark:hover:[color:var(--primary)] transition-colors"
/>

        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-44 p-1.5 border border-gray-200 shadow-md rounded-md"
      >
        {/* <DropdownMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50"
        // onClick={toggleSidebar}
        >
          <Settings className="h-4 w-4 text-gray-600" />
          <span>{mode === 'menu' ? 'Admin Settings' : 'Return to Menu'}</span>
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}