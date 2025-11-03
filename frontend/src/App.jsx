import { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  AlertTriangle,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Target,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  getDashboard,
  getSimpleForecast,
  getExecutiveSummary,
  getTrendAnalysis,
  getQuarterlyInsights,
  getDetailedStats,
  getCorrelation
} from './services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [executive, setExecutive] = useState(null);
  const [trend, setTrend] = useState(null);
  const [quarterly, setQuarterly] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, forecastRes, execRes, trendRes, quarterlyRes, detailedRes, corrRes] = await Promise.all([
        getDashboard(),
        getSimpleForecast(4),
        getExecutiveSummary(),
        getTrendAnalysis(),
        getQuarterlyInsights(),
        getDetailedStats(),
        getCorrelation()
      ]);

      setDashboard(dashRes.data);
      setForecast(forecastRes.data);
      setExecutive(execRes.data);
      setTrend(trendRes.data);
      setQuarterly(quarterlyRes.data);
      setDetailed(detailedRes.data);
      setCorrelation(corrRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('API Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Məlumatlar yüklənir...</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('az-AZ').format(Math.round(num));
  };

  const StatCard = ({ title, value, change, changePercent, icon: Icon, trend: trendDir }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {formatNumber(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trendDir === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
              {trendDir === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
              {trendDir === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
              <span className={`text-sm font-semibold ml-1 ${
                trendDir === 'up' ? 'text-green-600' :
                trendDir === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {changePercent !== undefined ? `${changePercent}%` : formatNumber(change)}
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl shadow-sm ${
          trendDir === 'up' ? 'bg-gradient-to-br from-green-100 to-green-200' :
          trendDir === 'down' ? 'bg-gradient-to-br from-red-100 to-red-200' :
          'bg-gradient-to-br from-blue-100 to-blue-200'
        }`}>
          <Icon className={`h-7 w-7 ${
            trendDir === 'up' ? 'text-green-600' :
            trendDir === 'down' ? 'text-red-600' :
            'text-blue-600'
          }`} />
        </div>
      </div>
    </div>
  );

  // Prepare quarterly distribution data for pie chart
  const quarterlyPieData = quarterly ? Object.entries(quarterly.rüblər_üzrə_statistika).map(([key, value]) => ({
    name: key,
    value: value.ortalama || 0
  })) : [];

  // Prepare trend data for time series
  const trendTimeSeriesData = trend && trend.illik_artım_templəri ?
    Object.entries(trend.illik_artım_templəri).map(([year, data]) => ({
      il: year,
      ortalama: data.ortalama || 0,
      cəm: data.cəm || 0,
      artım: data.artım_faizi || 0
    })) : [];

  // Prepare volatility comparison data
  const volatilityData = detailed ? [
    { metric: 'Ortalama', dəyər: detailed.mərkəzi_tendensiya.ortalama.dəyər },
    { metric: 'Median', dəyər: detailed.mərkəzi_tendensiya.median.dəyər },
    { metric: 'Std Dev', dəyər: detailed.yayılma_və_dəyişkənlik.standart_sapma.dəyər }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <span className="text-3xl">💰</span>
                <span>Kredit Satışı Analitika</span>
              </h1>
              <p className="text-blue-100 text-sm mt-1">İnteraktiv Analytics Dashboard</p>
            </div>
            <button
              onClick={loadData}
              className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <span className="text-lg">🔄</span>
              <span>Yenilə</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: BarChart3 },
              { id: 'charts', label: '📈 Qrafiklər', icon: TrendingUp },
              { id: 'insights', label: '💡 Təhlillər', icon: PieChart },
              { id: 'quarterly', label: '📅 Rüblər', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            {/* Critical Alerts */}
            {dashboard.kritik_məlumatlar && dashboard.kritik_məlumatlar.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-5 shadow-lg">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  Kritik Məlumatlar
                </h3>
                <ul className="space-y-2">
                  {dashboard.kritik_məlumatlar.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Son Dövr"
                value={dashboard.əsas_göstəricilər.son_dövr.dəyər}
                change={dashboard.əsas_göstəricilər.son_dövr.artım}
                changePercent={dashboard.əsas_göstəricilər.son_dövr.artım_faiz}
                icon={DollarSign}
                trend={dashboard.əsas_göstəricilər.son_dövr.artım > 0 ? 'up' : dashboard.əsas_göstəricilər.son_dövr.artım < 0 ? 'down' : 'neutral'}
              />
              <StatCard
                title="Ortalama"
                value={dashboard.əsas_göstəricilər.ortalama_dəyər.dəyər}
                icon={Activity}
                trend="neutral"
              />
              <StatCard
                title="Minimum"
                value={dashboard.diapazon.minimum.dəyər}
                icon={TrendingDown}
                trend="down"
              />
              <StatCard
                title="Maksimum"
                value={dashboard.diapazon.maksimum.dəyər}
                icon={TrendingUp}
                trend="up"
              />
            </div>

            {/* Performance Overview Chart */}
            {dashboard.illik_müqayisə && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  İllik Müqayisə
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { il: `${dashboard.illik_müqayisə.keçən_il}`, ortalama: dashboard.illik_müqayisə.keçən_il_ortalama || 0 },
                    { il: `${dashboard.illik_müqayisə.cari_il}`, ortalama: dashboard.illik_müqayisə.cari_il_ortalama || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="il" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Bar dataKey="ortalama" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold">
                    İllik Artım: <span className={dashboard.illik_müqayisə.illik_artım_faiz > 0 ? 'text-green-600' : 'text-red-600'}>
                      {dashboard.illik_müqayisə.illik_artım_faiz}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{dashboard.illik_müqayisə.təklif}</p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            {dashboard.növbəti_addımlar && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6 text-purple-600" />
                  Növbəti Addımlar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(dashboard.növbəti_addımlar).map(([key, value]) => (
                    <div key={key} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 text-sm uppercase mb-2">
                        {key.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Quarterly Distribution Pie Chart */}
            {quarterlyPieData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PieChart className="h-6 w-6 text-green-600" />
                  Rüblər üzrə Paylanma
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RePieChart>
                    <Pie
                      data={quarterlyPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {quarterlyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trend Line Chart */}
            {trendTimeSeriesData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  İllik Trend və Artım
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={trendTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="il" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cəm" fill="#3b82f6" name="İllik Cəm" radius={[8, 8, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="artım" stroke="#10b981" strokeWidth={3} name="Artım %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Forecast Area Chart */}
            {forecast && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔮</span>
                  Gələcək Proqnozlar (Interval Qrafiki)
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecast.proqnozlar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dövr" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="yuxarı_sərhəd_95"
                      stackId="1"
                      stroke="#93c5fd"
                      fill="#dbeafe"
                      name="Yuxarı Sərhəd (95%)"
                    />
                    <Area
                      type="monotone"
                      dataKey="kombinə_proqnoz"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#60a5fa"
                      name="Proqnoz"
                    />
                    <Area
                      type="monotone"
                      dataKey="aşağı_sərhəd_95"
                      stackId="3"
                      stroke="#93c5fd"
                      fill="#dbeafe"
                      name="Aşağı Sərhəd (95%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Statistical Distribution */}
            {volatilityData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-purple-600" />
                  Statistik Göstəricilər Müqayisəsi
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volatilityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" />
                    <YAxis dataKey="metric" type="category" />
                    <Tooltip
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Bar dataKey="dəyər" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quarterly Radar Chart */}
            {quarterlyPieData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Rüblər - Radar Görünüş
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={quarterlyPieData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="Ortalama" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && executive && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200 hover:shadow-xl transition-all">
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">💵 Cari Dəyər</h3>
                <p className="text-2xl sm:text-3xl font-bold mt-2 text-blue-900">{formatNumber(executive.əsas_rəqəmlər.cari_dəyər.məbləğ)}</p>
                <p className="text-xs text-blue-600 mt-1">min ₼</p>
              </div>
              <div className={`rounded-xl shadow-md p-6 border-2 hover:shadow-xl transition-all ${
                executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz > 0
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
              }`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  📊 Rüb-Rüb Dəyişiklik
                </h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-2 ${
                  executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz > 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz > 0 ? '+' : ''}
                  {executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz}%
                </p>
              </div>
              <div className={`rounded-xl shadow-md p-6 border-2 hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1 ${
                executive.risk_qiymətləndirməsi.səviyyə === 'Yüksək'
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300' :
                executive.risk_qiymətləndirməsi.səviyyə === 'Orta'
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' :
                  'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
              }`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  executive.risk_qiymətləndirməsi.səviyyə === 'Yüksək' ? 'text-red-700' :
                  executive.risk_qiymətləndirməsi.səviyyə === 'Orta' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  ⚠️ Risk Səviyyəsi
                </h3>
                <p className={`text-2xl sm:text-3xl font-bold mt-2 ${
                  executive.risk_qiymətləndirməsi.səviyyə === 'Yüksək' ? 'text-red-900' :
                  executive.risk_qiymətləndirməsi.səviyyə === 'Orta' ? 'text-yellow-900' :
                  'text-green-900'
                }`}>
                  {executive.risk_qiymətləndirməsi.səviyyə}
                </p>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Əsas Təhlillər
              </h2>
              <div className="space-y-4">
                {executive.əsas_təhlillər.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 p-4 rounded-r-lg shadow-sm ${
                      insight.tip === 'Pozitiv' ? 'border-green-500 bg-gradient-to-r from-green-50 to-white' :
                      insight.tip === 'Neqativ' ? 'border-red-500 bg-gradient-to-r from-red-50 to-white' :
                      'border-yellow-500 bg-gradient-to-r from-yellow-50 to-white'
                    }`}
                  >
                    <h4 className="font-bold text-lg">{insight.başlıq}</h4>
                    <p className="text-sm mt-2 text-gray-700">{insight.məzmun}</p>
                    <span className={`text-xs mt-3 inline-block px-3 py-1 rounded-full font-semibold ${
                      insight.prioritet === 'Yüksək' ? 'bg-red-100 text-red-700' :
                      insight.prioritet === 'Orta' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      Prioritet: {insight.prioritet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Tövsiyələr
              </h2>
              <div className="space-y-4">
                {executive.tövsiyələr.map((rec, idx) => (
                  <div key={idx} className="border-2 border-blue-200 rounded-lg p-5 hover:shadow-md transition-all bg-gradient-to-r from-blue-50 to-white">
                    <h4 className="font-bold text-blue-600 flex items-center gap-2">
                      <span className="text-xl">📌</span>
                      {rec.sahə}
                    </h4>
                    <p className="text-sm mt-2 text-gray-700">{rec.tövsiyə}</p>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800">
                        <strong>💪 Gözlənilən təsir:</strong> {rec.gözlənilən_təsir}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quarterly' && quarterly && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Rüblər üzrə Statistika
              </h2>

              {/* Quarterly Comparison Chart */}
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={Object.entries(quarterly.rüblər_üzrə_statistika).map(([key, value]) => ({
                  rüb: key,
                  ortalama: value.ortalama,
                  minimum: value.minimum,
                  maksimum: value.maksimum
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="rüb" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="ortalama" fill="#3b82f6" name="Ortalama" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="minimum" fill="#93c5fd" name="Minimum" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="maksimum" fill="#1e40af" name="Maksimum" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Best/Worst Quarter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="border-2 border-green-300 rounded-xl p-6 bg-gradient-to-br from-green-50 to-white shadow-lg">
                  <h4 className="font-bold text-green-800 text-lg flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    Ən Yaxşı Rüb
                  </h4>
                  <p className="text-3xl font-bold mt-3 text-green-900">{quarterly.müqayisəli_təhlil.ən_yaxşı_rüb.rüb}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Ortalama:</strong> {formatNumber(quarterly.müqayisəli_təhlil.ən_yaxşı_rüb.ortalama)} min ₼
                  </p>
                  {quarterly.müqayisəli_təhlil.ən_yaxşı_rüb.fəaliyyət_planı && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-xs font-semibold text-green-900">Fəaliyyət Planı:</p>
                      <ul className="text-xs text-green-800 mt-2 space-y-1">
                        {quarterly.müqayisəli_təhlil.ən_yaxşı_rüb.fəaliyyət_planı.slice(0, 2).map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="border-2 border-red-300 rounded-xl p-6 bg-gradient-to-br from-red-50 to-white shadow-lg">
                  <h4 className="font-bold text-red-800 text-lg flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Ən Zəif Rüb
                  </h4>
                  <p className="text-3xl font-bold mt-3 text-red-900">{quarterly.müqayisəli_təhlil.ən_zəif_rüb.rüb}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Ortalama:</strong> {formatNumber(quarterly.müqayisəli_təhlil.ən_zəif_rüb.ortalama)} min ₼
                  </p>
                  {quarterly.müqayisəli_təhlil.ən_zəif_rüb.təkmilləşdirmə_strategiyaları && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg">
                      <p className="text-xs font-semibold text-red-900">Təkmilləşdirmə:</p>
                      <ul className="text-xs text-red-800 mt-2 space-y-1">
                        {quarterly.müqayisəli_təhlil.ən_zəif_rüb.təkmilləşdirmə_strategiyaları.slice(0, 2).map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategy Overview */}
              {quarterly.ümumi_strategiya && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-lg mb-4 text-purple-900">🎯 Ümumi Strategiya</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(quarterly.ümumi_strategiya).map(([key, value]) => (
                      <div key={key} className="p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-xs font-semibold text-purple-900 uppercase">{key.replace(/_/g, ' ')}</p>
                        {typeof value === 'object' && value !== null ? (
                          <div className="text-xs text-gray-700 mt-2 space-y-1">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <div key={subKey}>
                                <span className="font-medium">{subKey.replace(/_/g, ' ')}:</span> {subValue}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">{value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
