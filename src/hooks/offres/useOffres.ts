// src/hooks/useOffres.ts
import { Offre } from '../../utils/database'
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'

export const offresService = dataService<Offre>('offres')

interface Props {
  filters?: QueryFilters
}

export default function useOffres({ filters }: Props) {
  return useData<Offre>(offresService, filters)
}
