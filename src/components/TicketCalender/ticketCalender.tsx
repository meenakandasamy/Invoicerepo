import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {CalendarView} from './Calenderview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useSiteList } from '@/hooks/data/useSiteList';

export const Ticketcalender = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: any) => {
   const siteQuery = useSiteList(session);
 const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };
  const siteList = useMemo(
    () =>
      (siteQuery.data ?? [])
        .map((site: any) => site.siteName)
        .filter((site: string) =>
          site.toLowerCase().includes(search.toLowerCase()),
        ),
    [siteQuery.data, search],
  );
const sitelistdata=siteQuery.data
  const [selectedSite, setSelectedSite] = useState('');
 
  const [selectedSiteId, setSelectedSiteId] = useState<number>(0)
    useEffect(() => {
    if (siteQuery.data && !selectedSite) {
      setSelectedSite(siteQuery.data[0].siteName);
      setSelectedSiteId(siteQuery.data[0].siteId);
    }
  }, [siteQuery.data, selectedSite]);

  const events = [
    {
      id: '1',
      title: 'Visual Inspection',
      date: '2026-06-01',
      color: '#3B82F6',
    },
    {
      id: '2',
      title: 'Inverter Cleaning',
      date: '2026-06-03',
      color: '#EF4444',
    },
    {
      id: '3',
      title: 'Plant Trip',
      date: '2026-06-05',
      color: '#22C55E',
    },
  ];

 
  const handlesite = (value: string) => {
    setSelectedSite(value);
    const siteId=siteQuery.data?.find((site: any) => site.siteName === value)?.siteId;
    console.log('Selected Site ID:', siteId);
    setSelectedSiteId(siteId);
  }

  return (
    <div className="m-2.5">
      <div className="py-2">
        <Card>
          <CardContent className="p-2">
            <div  className="flex justify-between items-center">
            <div className="w-64 ">
              <Select
                value={selectedSite}
                onValueChange={(value) => handlesite(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Site" />
                </SelectTrigger>

                <SelectContent>
                  <div className="relative px-2 py-1">
                    <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />

                    <Input
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {siteList.length > 0 ? (
                      siteList.map((site) => (
                        <SelectItem
                          key={site}
                          value={site}
                        >
                          {site}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        No matching options
                      </div>
                    )}
                  </div>

                  
                </SelectContent>
              </Select>
            </div>
    <div className="flex items-center justify-center gap-6 py-2">
      <button
        onClick={handlePreviousMonth}
        className="px-2 py-1 border rounded"
      >
        ←
      </button>

      <span className="font-semibold text-lg w-[100%] ">
        {currentDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </span>

      <button
        onClick={handleNextMonth}
        className="px-2 py-1 border rounded"
      >
        →
      </button>
    </div>
            
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="m-2.5 rounded-xl bg-white p-4 shadow-sm">
      
  <CalendarView
    selectedSite={selectedSite}
    selectedSiteId={selectedSiteId}
    events={events}
  />

      </div>
    </div>
  );
};