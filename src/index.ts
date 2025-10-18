import VStatField from './VStatField.vue';
import type { App } from 'vue';

// Export component
export { VStatField };

// Export plugin for Vue.use()
export default {
  install(app: App) {
    app.component('VStatField', VStatField);
  }
};

// Export types
export interface StatFieldRollResult {
  notation: string;
  total: number;
  rolls: number[];
  modifier: number;
}
