import { defineStore } from 'pinia';
import { DEFAULT_TIME_SCALES, type TimeScale } from '@/data/models/TimeScale';

interface TimeScaleState {
  availableScales: TimeScale[];
  currentScaleId: string;
  isLoading: boolean;
  error: string | null;
}

export const useTimeScaleStore = defineStore({
  id: 'timeScale',
  
  state: (): TimeScaleState => ({
    availableScales: [...DEFAULT_TIME_SCALES],
    currentScaleId: DEFAULT_TIME_SCALES.find(scale => scale.isDefault)?.id || 'day',
    isLoading: false,
    error: null
  }),
  
  getters: {
    allScales: (state) => state.availableScales,
    
    currentScale: (state) => 
      state.availableScales.find(scale => scale.id === state.currentScaleId) || 
      state.availableScales[0],
    
    scaleById: (state) => (id: string) => 
      state.availableScales.find(scale => scale.id === id),
      
    isQuickScale: (state) => 
      state.currentScaleId === 'quick',
      
    isDayScale: (state) => 
      state.currentScaleId === 'day',
      
    isYearScale: (state) => 
      state.currentScaleId === 'year'
  },
  
  actions: {
    setCurrentScale(scaleId: string) {
      const scale = this.availableScales.find(scale => scale.id === scaleId);
      if (scale) {
        this.currentScaleId = scaleId;
      } else {
        this.error = `Scale with ID ${scaleId} not found`;
      }
    },
    
    addCustomScale(scale: Omit<TimeScale, 'id'>) {
      const id = `custom-${Date.now()}`;
      const newScale: TimeScale = {
        ...scale,
        id,
        isDefault: false
      };
      
      this.availableScales.push(newScale);
      return id;
    },
    
    updateScale(id: string, updates: Partial<Omit<TimeScale, 'id'>>) {
      const index = this.availableScales.findIndex(scale => scale.id === id);
      
      if (index !== -1) {
        // Don't allow modifying default scales
        if (!id.startsWith('custom-') && Object.keys(updates).length > 0) {
          this.error = 'Default scales cannot be modified';
          return false;
        }
        
        this.availableScales[index] = {
          ...this.availableScales[index],
          ...updates
        };
        
        return true;
      } else {
        this.error = `Scale with ID ${id} not found`;
        return false;
      }
    },
    
    removeCustomScale(id: string) {
      if (!id.startsWith('custom-')) {
        this.error = 'Default scales cannot be removed';
        return false;
      }
      
      const index = this.availableScales.findIndex(scale => scale.id === id);
      
      if (index !== -1) {
        // If removing the current scale, switch to the default scale
        if (this.currentScaleId === id) {
          const defaultScale = this.availableScales.find(scale => scale.isDefault);
          this.currentScaleId = defaultScale?.id || 'day';
        }
        
        this.availableScales.splice(index, 1);
        return true;
      } else {
        this.error = `Scale with ID ${id} not found`;
        return false;
      }
    },
    
    zoomIn() {
      const currentIndex = this.availableScales.findIndex(
        scale => scale.id === this.currentScaleId
      );
      
      if (currentIndex > 0) {
        // Zoom in means moving to a smaller time scale (earlier in the array)
        this.currentScaleId = this.availableScales[currentIndex - 1].id;
      }
    },
    
    zoomOut() {
      const currentIndex = this.availableScales.findIndex(
        scale => scale.id === this.currentScaleId
      );
      
      if (currentIndex < this.availableScales.length - 1) {
        // Zoom out means moving to a larger time scale (later in the array)
        this.currentScaleId = this.availableScales[currentIndex + 1].id;
      }
    },
    
    resetToDefault() {
      const defaultScale = this.availableScales.find(scale => scale.isDefault);
      this.currentScaleId = defaultScale?.id || 'day';
    }
  },
  
  persist: {
    storage: localStorage,
    key: 'void-check-timescale'
  }
});
