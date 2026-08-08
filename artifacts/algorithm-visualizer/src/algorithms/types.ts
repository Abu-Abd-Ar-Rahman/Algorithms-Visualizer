export type VisualizationStepType = 'compare' | 'swap' | 'markSorted' | 'complete';

export interface VisualizationStep {
  type: VisualizationStepType;
  indices?: [number, number];
  index?: number;
}
