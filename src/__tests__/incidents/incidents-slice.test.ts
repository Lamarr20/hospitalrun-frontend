import { AnyAction } from 'redux'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import IncidentFilter from '../../incidents/IncidentFilter'
import incidents, {
  fetchIncidentsStart,
  fetchIncidentsSuccess,
  searchIncidents,
} from '../../incidents/incidents-slice'
import IncidentRepository from '../../shared/db/IncidentRepository'
import Incident from '../../shared/model/Incident'
import { RootState } from '../../shared/store'

const mockStore = createMockStore<RootState, any>([thunk])

describe('Incidents Slice', () => {
  describe('actions', () => {
    it('should setup the default state correctly', () => {
      const incidentsStore = incidents(undefined, {} as AnyAction)
      expect(incidentsStore.status).toEqual('loading')
      expect(incidentsStore.incidents).toEqual([])
    })

    it('should handle fetch incidents start', () => {
      const incidentsStore = incidents(undefined, fetchIncidentsStart())
      expect(incidentsStore.status).toEqual('loading')
    })

    it('should handle fetch incidents success', () => {
      const expectedIncidents = [{ id: '123' }] as Incident[]
      const incidentsStore = incidents(undefined, fetchIncidentsSuccess(expectedIncidents))
      expect(incidentsStore.status).toEqual('completed')
      expect(incidentsStore.incidents).toEqual(expectedIncidents)
    })

    describe('fetch incidents', () => {
      it('should fetch all of the incidents', async () => {
        const expectedIncidents = [{ id: '123' }] as Incident[]
        jest.spyOn(IncidentRepository, 'findAll').mockResolvedValue(expectedIncidents)
        const store = mockStore()

        await store.dispatch(searchIncidents(IncidentFilter.all))

        expect(store.getActions()[0]).toEqual(fetchIncidentsStart())
        expect(IncidentRepository.findAll).toHaveBeenCalledTimes(1)
        expect(store.getActions()[1]).toEqual(fetchIncidentsSuccess(expectedIncidents))
      })

      it('should fetch incidents filtering by status', async () => {
        const expectedIncidents = [{ id: '123' }] as Incident[]
        jest.spyOn(IncidentRepository, 'search').mockResolvedValue(expectedIncidents)
        const store = mockStore()

        await store.dispatch(searchIncidents(IncidentFilter.reported))

        expect(store.getActions()[0]).toEqual(fetchIncidentsStart())
        expect(IncidentRepository.search).toHaveBeenCalledTimes(1)
        expect(store.getActions()[1]).toEqual(fetchIncidentsSuccess(expectedIncidents))
      })
    })
  })
})
