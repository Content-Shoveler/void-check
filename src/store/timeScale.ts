import { defineStore } from 'pinia';
import { 
  TimeScaleOption, 
  DEFAULT_TIME_SCALE, 
  TIME_SCALE_OPTIONS 
} from '@/data/models/TimeScale';

/**
 * Interface for the time scale store state
 */
interface TimeScaleState {
  currentScale: TimeScaleOption;
  showGridLines: boolean;
  showLabels: boolean;
  isAnimating: boolean;
}

/**
 * Time scale store using Pinia
 */
export const useTimeScaleStore = defineStore('timeScale', {
  state: (): TimeScaleState => ({
    currentScale: DEFAULT_TIME_SCALE,
    showGridLines: true,
    showLabels: true,
    isAnimating: false
  }),
  
  /**
   * Getters for derived state
   */
  getters: {
    /**
     * Get all available time scale options
     */
    availableScales: () => TIME_SCALE_OPTIONS,
    
    /**
     * Get current scale in milliseconds
     */
    currentScaleMs: (state) => state.currentScale.msValue,
    
    /**
     * Get scale configuration
     */
    scaleConfig: (state) => ({
      scale: state.currentScale,
      showGridLines: state.showGridLines,
      showLabels: state.showLabels
    })
  },
  
  /**
   * Actions for modifying state
   */
  actions: {
    /**
     * Set the current time scale
     */
    setTimeScale(scaleId: string) {
      const scale = TIME_SCALE_OPTIONS.find(scale => scale.id === scaleId);
      if (scale) {
        // Start animation
        this.isAnimating = true;
        
        // Set the new scale
        this.currentScale = scale;
        
        // End animation after transition
        setTimeout(() => {
          this.isAnimating = false;
        }, 500);
      }
    },
    
    /**
     * Toggle grid lines visibility
     */
    toggleGridLines() {
      this.showGridLines = !this.showGridLines;
    },
    
    /**
     * Toggle labels visibility
     */
    toggleLabels() {
      this.showLabels = !this.showLabels;
    },
    
    /**
     * Zoom in (switch to a more detailed time scale)
     */
    zoomIn() {
      const currentIndex = TIME_SCALE_OPTIONS.findIndex(
        scale => scale.id === this.currentScale.id
      );
      
      if (currentIndex > 0) {
        this.setTimeScale(TIME_SCALE_OPTIONS[currentIndex - 1].id);
      }
    },
    
    /**
     * Zoom out (switch to a broader time scale)
     */
    zoomOut() {
      const currentIndex = TIME_SCALE_OPTIONS.findIndex(
        scale => scale.id === this.currentScale.id
      );
      
      if (currentIndex < TIME_SCALE_OPTIONS.length - 1) {
        this.setTimeScale(TIME_SCALE_OPTIONS[currentIndex + 1].id);
      }
    }
  },
  
  /**
   * Configure persistence
   */
  persist: {
    storage: localStorage,
    paths: ['currentScale', 'showGridLines', 'showLabels']
  }
});
