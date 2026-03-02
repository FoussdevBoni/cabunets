// src/hooks/useCategories.ts
import { User, Vendeur } from '../../utils/database'
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'


export const vendeursService = dataService<Vendeur>('vendeurs')

interface Props {
  filters?: QueryFilters
}

export default function useVendeurs({ filters }: Props) {
  return useData<Vendeur>(vendeursService, filters)
}
