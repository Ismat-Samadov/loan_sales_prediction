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
  Minus
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
  AreaChart
} from 'recharts';
import {
  getDashboard,
  getSimpleForecast,
  getExecutiveSummary,
  getTrendAnalysis,
  getQuarterlyInsights
} from './services/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [executive, setExecutive] = useState(null);
  const [trend, setTrend] = useState(null);
  const [quarterly, setQuarterly] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, forecastRes, execRes, trendRes, quarterlyRes] = await Promise.all([
        getDashboard(),
        getSimpleForecast(4),
        getExecutiveSummary(),
        getTrendAnalysis(),
        getQuarterlyInsights()
      ]);

      setDashboard(dashRes.data);
      setForecast(forecastRes.data);
      setExecutive(execRes.data);
      setTrend(trendRes.data);
      setQuarterly(quarterlyRes.data);
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(value)}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trendDir === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
              {trendDir === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
              {trendDir === 'neutral' && <Minus className="h-4 w-4 text-gray-500" />}
              <span className={`text-sm ml-1 ${
                trendDir === 'up' ? 'text-green-600' :
                trendDir === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {changePercent !== undefined ? `${changePercent}%` : formatNumber(change)}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          trendDir === 'up' ? 'bg-green-100' :
          trendDir === 'down' ? 'bg-red-100' :
          'bg-blue-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            trendDir === 'up' ? 'text-green-600' :
            trendDir === 'down' ? 'text-red-600' :
            'text-blue-600'
          }`} />
        </div>
      </div>
    </div>
  );

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
              <p className="text-blue-100 text-sm mt-1">Real-time Analytics Dashboard</p>
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
              { id: 'forecast', label: '🔮 Proqnoz', icon: TrendingUp },
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Son Dövr"
                value={dashboard.əsas_göstəricilər.son_dövr.dəyər}
                change={dashboard.əsas_göstəricilər.son_dövr.artım}
                changePercent={dashboard.əsas_göstəricilər.son_dövr.artım_faiz}
                icon={DollarSign}
                trend={dashboard.əsas_göstəricilər.son_dövr.artım > 0 ? 'up' : 'down'}
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
                icon={ArrowDownRight}
                trend="down"
              />
              <StatCard
                title="Maksimum"
                value={dashboard.diapazon.maksimum.dəyər}
                icon={ArrowUpRight}
                trend="up"
              />
            </div>

            {/* Trend Chart */}
            {trend && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">📈 Trend Təhlili</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">Trend İstiqaməti</p>
                    <p className="text-xl font-bold">{trend.ümumi_trend.trend_istiqaməti}</p>
                  </div>
                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">R² (Güclülük)</p>
                    <p className="text-xl font-bold">{trend.ümumi_trend.güclülük['R²']}</p>
                  </div>
                  <div className="border rounded p-4">
                    <p className="text-sm text-gray-600">Rüblük Dəyişmə</p>
                    <p className="text-xl font-bold">{formatNumber(trend.ümumi_trend.ortalama_rüblük_dəyişmə)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Alert */}
            {executive && executive.risk_qiymətləndirməsi.səviyyə === 'Yüksək' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="font-semibold text-red-800">Yüksək Risk Səviyyəsi</p>
                    <p className="text-sm text-red-700">{executive.risk_qiymətləndirməsi.təsvir}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'forecast' && forecast && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">🔮 Gələcək Proqnozlar</h2>

              {/* Forecast Chart */}
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecast.proqnozlar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dövr" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="yuxarı_sərhəd_95"
                    fill="#93c5fd"
                    stroke="#3b82f6"
                    name="Yuxarı Sərhəd (95%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="kombinə_proqnoz"
                    fill="#60a5fa"
                    stroke="#2563eb"
                    name="Proqnoz"
                  />
                  <Area
                    type="monotone"
                    dataKey="aşağı_sərhəd_95"
                    fill="#dbeafe"
                    stroke="#3b82f6"
                    name="Aşağı Sərhəd (95%)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Forecast Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dövr</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proqnoz</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aşağı Sərhəd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yuxarı Sərhəd</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecast.proqnozlar.map((f, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{f.dövr}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatNumber(f.kombinə_proqnoz)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatNumber(f.aşağı_sərhəd_95)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatNumber(f.yuxarı_sərhəd_95)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && executive && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Cari Dəyər</h3>
                <p className="text-2xl font-bold mt-2">{formatNumber(executive.əsas_rəqəmlər.cari_dəyər.məbləğ)} min ₼</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Rüb-Rüb Dəyişiklik</h3>
                <p className={`text-2xl font-bold mt-2 ${
                  executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {executive.əsas_rəqəmlər.rüb_rüb_dəyişiklik.faiz}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600">Risk Səviyyəsi</h3>
                <p className={`text-2xl font-bold mt-2 ${
                  executive.risk_qiymətləndirməsi.səviyyə === 'Yüksək' ? 'text-red-600' :
                  executive.risk_qiymətləndirməsi.səviyyə === 'Orta' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {executive.risk_qiymətləndirməsi.səviyyə}
                </p>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">💡 Əsas Təhlillər</h2>
              <div className="space-y-4">
                {executive.əsas_təhlillər.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`border-l-4 p-4 ${
                      insight.tip === 'Pozitiv' ? 'border-green-500 bg-green-50' :
                      insight.tip === 'Neqativ' ? 'border-red-500 bg-red-50' :
                      'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <h4 className="font-semibold">{insight.başlıq}</h4>
                    <p className="text-sm mt-1">{insight.məzmun}</p>
                    <span className="text-xs text-gray-600 mt-2 inline-block">
                      Prioritet: {insight.prioritet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📝 Tövsiyələr</h2>
              <div className="space-y-4">
                {executive.tövsiyələr.map((rec, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600">{rec.sahə}</h4>
                    <p className="text-sm mt-2">{rec.tövsiyə}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      <strong>Gözlənilən təsir:</strong> {rec.gözlənilən_təsir}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quarterly' && quarterly && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">📅 Rüblər üzrə Statistika</h2>

              {/* Quarterly Comparison Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(quarterly.rüblər_üzrə_statistika).map(([key, value]) => ({
                  rüb: key,
                  ortalama: value.ortalama,
                  minimum: value.minimum,
                  maksimum: value.maksimum
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rüb" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="ortalama" fill="#3b82f6" name="Ortalama" />
                  <Bar dataKey="minimum" fill="#93c5fd" name="Minimum" />
                  <Bar dataKey="maksimum" fill="#1e40af" name="Maksimum" />
                </BarChart>
              </ResponsiveContainer>

              {/* Best/Worst Quarter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-800">✅ Ən Yaxşı Rüb</h4>
                  <p className="text-2xl font-bold mt-2">{quarterly.müqayisəli_təhlil.ən_yaxşı_rüb.rüb}</p>
                  <p className="text-sm text-gray-600">
                    Ortalama: {formatNumber(quarterly.müqayisəli_təhlil.ən_yaxşı_rüb.ortalama)}
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800">⚠️ Ən Zəif Rüb</h4>
                  <p className="text-2xl font-bold mt-2">{quarterly.müqayisəli_təhlil.ən_zəif_rüb.rüb}</p>
                  <p className="text-sm text-gray-600">
                    Ortalama: {formatNumber(quarterly.müqayisəli_təhlil.ən_zəif_rüb.ortalama)}
                  </p>
                </div>
              </div>

              {/* Business Recommendations */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3">📊 Biznes Tövsiyələri</h3>
                <ul className="space-y-2">
                  {quarterly.biznes_tövsiyələri.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
