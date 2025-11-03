import axios from 'axios';

// In production (when VITE_API_URL is empty), use same origin (relative URLs)
// In development, use localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Analytics
export const getDashboard = () => api.get('/api/analytics/dashboard');
export const getDetailedStats = () => api.get('/api/analytics/detailed-statistics');
export const getOutlierAnalysis = () => api.get('/api/analytics/outlier-analysis');
export const getTrendAnalysis = () => api.get('/api/analytics/trend-analysis');
export const getQuarterlyInsights = () => api.get('/api/analytics/quarterly-insights');

// Statistics
export const getDescriptive = () => api.get('/api/statistics/descriptive');
export const getCorrelation = () => api.get('/api/statistics/correlation');
export const getNormalityTests = () => api.get('/api/statistics/normality-tests');

// Predictions
export const getSimpleForecast = (periods = 4) => api.get(`/api/predictions/simple-forecast?periods=${periods}`);
export const getSeasonalForecast = (periods = 4) => api.get(`/api/predictions/seasonal-forecast?periods=${periods}`);
export const getConfidenceLevels = () => api.get('/api/predictions/confidence-levels');
export const getModelComparison = () => api.get('/api/predictions/model-comparison');

// Advanced Models
export const getAdvancedModelsInfo = () => api.get('/api/predictions/advanced-models-info');
export const getAdvancedForecast = (modelName, periods = 4) =>
  api.post(`/api/predictions/advanced-forecast?model_name=${modelName}&n_periods=${periods}`);

// Insights
export const getExecutiveSummary = () => api.get('/api/insights/executive-summary');
export const getPerformanceMetrics = () => api.get('/api/insights/performance-metrics');
export const getRiskAnalysis = () => api.get('/api/insights/risk-analysis');
export const getComparativeAnalysis = () => api.get('/api/insights/comparative-analysis');
export const getActionPlan = () => api.get('/api/insights/action-plan');

export default api;
