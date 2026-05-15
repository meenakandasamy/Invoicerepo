import type {
  WarehouseSiteMapDTOType,
  WarehouseSiteMapUpdateDTOType,
} from '@/utils/Validators/Schema/WarehouseSiteMapSchema';

export interface WarehouseSiteMapDTO extends WarehouseSiteMapDTOType {}

export interface WarehouseSiteMapUpdateDTO extends WarehouseSiteMapUpdateDTOType {
    siteName: Array<string>,
    warehouseName: string
}