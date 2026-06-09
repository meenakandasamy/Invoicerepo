import { useQuery } from '@tanstack/react-query';

import { useUserList } from './useUserList';
import { useSoplist } from './useSoplist';

import { useSiteList } from './useSiteList';
import { TemplatemappingQueries, TemplatemappingServices } from '@/integrations/Services/TemplatemapServices';
export const useTemplatemappinglist = (session: Session) => {
    const { data: SiteList } = useSiteList(session);
         
  const allDependenciesLoaded =!!SiteList;
  return useQuery({
    queryKey: [TemplatemappingQueries.GET_TEMPLATE_MAPPING],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      let response: Array<any> | undefined = [];
      response = await TemplatemappingServices.fetchgetallTemplatemap(session.companyId);
      return response?.map((item: any) => {
        return {
          ...item,
           siteName: SiteList
          .filter((site: any) => item.siteIds.includes(site.siteId))
          .map((site: any) => site.siteName),
             templateName: SiteList
          .filter((site: any) => item.siteIds.includes(site.siteId))
          .map((site: any) => site.templateName),
          statusName: item.status === 1 ? 'Active' : 'Inactive',
        };
      });
    },
  });
};
