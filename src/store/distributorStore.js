import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useSyncStore } from './syncStore';

// Nigerian States with Zone Mapping
export const NIGERIAN_STATES = [
  { name: 'Abia', zone: 'South East' },
  { name: 'Adamawa', zone: 'North East' },
  { name: 'Akwa Ibom', zone: 'South South' },
  { name: 'Anambra', zone: 'South East' },
  { name: 'Bauchi', zone: 'North East' },
  { name: 'Bayelsa', zone: 'South South' },
  { name: 'Benue', zone: 'North Central' },
  { name: 'Borno', zone: 'North East' },
  { name: 'Cross River', zone: 'South South' },
  { name: 'Delta', zone: 'South South' },
  { name: 'Ebonyi', zone: 'South East' },
  { name: 'Edo', zone: 'South South' },
  { name: 'Ekiti', zone: 'South West' },
  { name: 'Enugu', zone: 'South East' },
  { name: 'FCT', zone: 'North Central' },
  { name: 'Gombe', zone: 'North East' },
  { name: 'Imo', zone: 'South East' },
  { name: 'Jigawa', zone: 'North West' },
  { name: 'Kaduna', zone: 'North West' },
  { name: 'Kano', zone: 'North West' },
  { name: 'Katsina', zone: 'North West' },
  { name: 'Kebbi', zone: 'North West' },
  { name: 'Kogi', zone: 'North Central' },
  { name: 'Kwara', zone: 'North Central' },
  { name: 'Lagos', zone: 'South West' },
  { name: 'Nasarawa', zone: 'North Central' },
  { name: 'Niger', zone: 'North Central' },
  { name: 'Ogun', zone: 'South West' },
  { name: 'Ondo', zone: 'South West' },
  { name: 'Osun', zone: 'South West' },
  { name: 'Oyo', zone: 'South West' },
  { name: 'Plateau', zone: 'North Central' },
  { name: 'Rivers', zone: 'South South' },
  { name: 'Sokoto', zone: 'North West' },
  { name: 'Taraba', zone: 'North East' },
  { name: 'Yobe', zone: 'North East' },
  { name: 'Zamfara', zone: 'North West' }
];

// Mock Distributors
export const DISTRIBUTORS = [
  {
    id: 'dist-lagos-1',
    name: 'Lagos Prime Distributors',
    state: 'Lagos',
    zone: 'South West',
    phone: '+234-801-234-5678',
    email: 'lagos@bonnesante-dist.com',
    bankName: 'First Bank',
    accountNumber: '1234567890',
    accountName: 'Lagos Prime Distributors Ltd',
    isActive: true,
    isPrimary: true
  },
  {
    id: 'dist-abuja-1',
    name: 'FCT Medical Supplies',
    state: 'FCT',
    zone: 'North Central',
    phone: '+234-802-345-6789',
    email: 'fct@bonnesante-dist.com',
    bankName: 'GTBank',
    accountNumber: '0987654321',
    accountName: 'FCT Medical Supplies Ltd',
    isActive: true,
    isPrimary: true
  },
  {
    id: 'dist-ph-1',
    name: 'Rivers Healthcare Partners',
    state: 'Rivers',
    zone: 'South South',
    phone: '+234-803-456-7890',
    email: 'rivers@bonnesante-dist.com',
    bankName: 'Access Bank',
    accountNumber: '1122334455',
    accountName: 'Rivers Healthcare Partners',
    isActive: true,
    isPrimary: true
  },
  {
    id: 'dist-kano-1',
    name: 'Kano Medical Hub',
    state: 'Kano',
    zone: 'North West',
    phone: '+234-804-567-8901',
    email: 'kano@bonnesante-dist.com',
    bankName: 'Zenith Bank',
    accountNumber: '5566778899',
    accountName: 'Kano Medical Hub Ltd',
    isActive: true,
    isPrimary: true
  },
  {
    id: 'dist-enugu-1',
    name: 'Enugu WoundCare Centre',
    state: 'Enugu',
    zone: 'South East',
    phone: '+234-805-678-9012',
    email: 'enugu@bonnesante-dist.com',
    bankName: 'UBA',
    accountNumber: '6677889900',
    accountName: 'Enugu WoundCare Centre',
    isActive: true,
    isPrimary: true
  }
];

export const useDistributorStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        distributors: DISTRIBUTORS,
        stateDistributorMap: {},
        
        // Set all distributors (for sync from server)
        setDistributors: (distributorsArray) => {
          if (!Array.isArray(distributorsArray)) return;
          
          // If server has distributors, merge with local (keeping local changes)
          if (distributorsArray.length === 0) {
            console.log('📥 Server has no distributors, keeping local data');
            return;
          }
          
          // Merge server data with local data - prefer local if updated more recently
          const currentDistributors = get().distributors;
          const mergedDistributors = distributorsArray.map(serverDist => {
            const localDist = currentDistributors.find(d => d.id === serverDist.id);
            // If local version exists, merge (server wins for now, but keep structure)
            return localDist ? { ...serverDist } : serverDist;
          });
          
          // Add any local distributors not on server
          currentDistributors.forEach(localDist => {
            if (!mergedDistributors.find(d => d.id === localDist.id)) {
              mergedDistributors.push(localDist);
            }
          });
          
          set({ distributors: mergedDistributors });
          console.log(`📥 Distributors store updated with ${mergedDistributors.length} distributors`);
          
          // Re-initialize mapping with new distributors
          get().initializeMapping();
        },
        
        // Initialize state-distributor mapping
        initializeMapping: () => {
          const mapping = {};
          
          NIGERIAN_STATES.forEach(state => {
            // Find primary distributor for the zone
            const zoneDistributor = DISTRIBUTORS.find(
              d => d.zone === state.zone && d.isPrimary && d.isActive
            );
            
            // Find state-specific distributor
            const stateDistributor = DISTRIBUTORS.find(
              d => d.state === state.name && d.isPrimary && d.isActive
            );
            
            mapping[state.name] = stateDistributor || zoneDistributor || DISTRIBUTORS[0];
          });
          
          set({ stateDistributorMap: mapping });
        },
        
        // Get distributor for a state
        getDistributorForState: (stateName) => {
          const { stateDistributorMap, distributors } = get();
          
          // First check direct mapping
          if (stateDistributorMap[stateName]) {
            return stateDistributorMap[stateName];
          }
          
          // Find by state
          const stateDistributor = distributors.find(
            d => d.state === stateName && d.isActive
          );
          if (stateDistributor) return stateDistributor;
          
          // Find by zone
          const stateInfo = NIGERIAN_STATES.find(s => s.name === stateName);
          if (stateInfo) {
            const zoneDistributor = distributors.find(
              d => d.zone === stateInfo.zone && d.isActive
            );
            if (zoneDistributor) return zoneDistributor;
          }
          
          // Default to first active distributor
          return distributors.find(d => d.isActive) || distributors[0];
        },
        
        // Add new distributor
        addDistributor: (distributor) => {
          const newDistributor = {
            ...distributor,
            id: `dist-${Date.now()}`,
            isActive: true
          };
          
          set((state) => ({
            distributors: [...state.distributors, newDistributor]
          }));
          
          useSyncStore.getState().notifyStateChange('distributors', { 
            action: 'add', 
            distributor: newDistributor 
          });
          
          return newDistributor;
        },
        
        // Update distributor
        updateDistributor: async (id, updates) => {
          console.log(`📝 Updating distributor ${id}:`, updates);
          set((state) => ({
            distributors: state.distributors.map(d => 
              d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
            )
          }));
          
          console.log(`✅ Distributor ${id} updated locally`);
          
          // Immediately sync to server
          try {
            const updatedDistributor = get().distributors.find(d => d.id === id);
            if (updatedDistributor) {
              const response = await fetch('/api/distributors/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDistributor)
              });
              if (response.ok) {
                console.log(`✅ Distributor ${id} synced to server`);
              } else {
                console.error(`❌ Failed to sync distributor ${id} to server`);
              }
            }
          } catch (error) {
            console.error(`❌ Error syncing distributor ${id}:`, error);
          }
          
          useSyncStore.getState().notifyStateChange('distributors', { 
            action: 'update', 
            id, 
            updates 
          });
        },
        
        // Deactivate distributor
        deactivateDistributor: (id) => {
          get().updateDistributor(id, { isActive: false });
        },
        
        // Get all active distributors
        getActiveDistributors: () => {
          return get().distributors.filter(d => d.isActive);
        }
      }),
      {
        name: 'astrobsm-distributors'
      }
    )
  )
);
