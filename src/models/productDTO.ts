import type {
    ProductDTOType,
  ProductUpdateDTOType,

} from '@/utils/Validators/Schema/ProductSchema';

export interface ProductDTO extends ProductDTOType {}

export interface ProductUpdateDTO extends ProductUpdateDTOType {}
