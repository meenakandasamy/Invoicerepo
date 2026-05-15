import { Modal } from '@mui/material';
import { Loader, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const LogPopup = ({
  open,
  onClose,
  pageName,
  tabsValue,
  onTabChange,
  tabList,
  headcells,
  row,
  footerActions, // <-- NEW
  loading,
}: any) => {
  console.log(row);
  console.log(headcells);
  
  
  const activeTab = tabList.find((tab: any) => tab.value === tabsValue);

  const Component = activeTab?.component;
  const activeClassName = activeTab?.className || '';

  const [animating, setAnimating] = useState(false);
  const [displayText, setDisplayText] = useState(
    `${pageName} ${activeTab?.label}`,
  );
  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayText(`${pageName} ${activeTab?.label}`);
      setAnimating(false);
    }, 150); // duration of fade-out

    return () => clearTimeout(t);
  }, [pageName, activeTab]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative bg-card dark:bg-black rounded-lg border max-w-4xl w-full mx-auto my-8 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-card dark:bg-black px-6 py-4 border-b flex justify-between">
          <h2
            className={`
              text-2xl font-bold
              transition-opacity duration-150 ease-in-out
              ${animating ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {displayText}
          </h2>

          <button className="cursor-pointer" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-auto p-6 flex-1">
          {/* Tabs */}
          <div className="flex justify-end mb-1">
            {pageName !== 'Finalized' && (
              <Tabs value={tabsValue} defaultValue={tabsValue}>
                <TabsList className="flex gap-2">
                  {tabList.map((tab: any) => (
                    <TabsTrigger
                      className="cursor-pointer"
                      key={tab.value}
                      value={tab.value}
                      onClick={() => onTabChange(tab.value)}
                    >
                      {tab?.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Dynamic Content */}
          <div className="mb-6 shadow-md rounded-lg p-6 border">
            <div
              className={`break-words ${loading ? 'animate-pulse h-[58vh] flex items-center justify-center' : activeClassName}`}
            >
              {loading ? (
                <Loader />
              ) : (
                Component && <Component row={row} headcells={headcells} />
              )}
            </div>
          </div>
        </div>

        {/* Footer — renders only if custom actions passed */}
        {footerActions && (
          <div className="border-t px-6 py-4 flex justify-end gap-3 bg-card dark:bg-black">
            {footerActions}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LogPopup;
