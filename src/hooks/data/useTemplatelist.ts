import { useQuery } from '@tanstack/react-query';

import { useUserList } from './useUserList';
import { useSoplist } from './useSoplist';
import { useTemplatedropdownList } from './usetemplatedropdownliast';
import { useSiteList } from './useSiteList';
import { TemplatemappingQueries, TemplatemappingServices } from '@/integrations/Services/TemplatemapServices';

export const useTemplatemappinglist = (session: Session) => {
    const { data: SiteList } = useSiteList(session);
    const { data: TemplateList } = useTemplatedropdownList(session);
         
  const allDependenciesLoaded =!!SiteList && !!TemplateList;
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
          .find((site: any) => item.siteId===site.siteId)?.siteName || 'Unknown Site',
           templateName: TemplateList
          .find((template: any) => item.sopTemplateId===template.sopTemplateId)?.templateName || 'Unknown Template',
         
          statusName: item.status === 1 ? 'Active' : 'Inactive',
        };
      });
    },
  });
};
