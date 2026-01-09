import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import type { QualityDistributionResponse } from '../types';

function QualityDashboard() {
  const [data, setData] = useState<QualityDistributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format numbers with k suffix for thousands (used in chart labels)
  const formatNumber = (value: number): string => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  };

  // Format counts with commas (used in tooltips and table)
  const formatCount = (value: number): string => {
    return value.toLocaleString();
  };

  // Format quality score with 4 decimals (used in tooltips and table)
  const formatQuality = (value: number): string => {
    return value.toFixed(4);
  };

  // Custom tooltip that uses consistent formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const fetchQualityData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/quality/distribution');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: QualityDistributionResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data once on component mount
    fetchQualityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quality Score Distribution by Study</h2>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-blue-600 border-r-transparent"></div>
            <div className="absolute top-0 left-0 h-16 w-16 animate-ping rounded-full border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading quality data...</p>
          <p className="mt-2 text-sm text-gray-400">Analyzing 500,000+ measurements</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchQualityData}
          className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.data.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">No quality data available</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.data.map(item => ({
    name: item.study_name.length > 30 ? item.study_name.substring(0, 30) + '...' : item.study_name,
    'High Quality (≥0.9)': item.high_quality_count,
    'Low Quality (<0.8)': item.low_quality_count,
    avgQuality: (parseFloat(item.avg_quality_score.toString()) * 100).toFixed(1)
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quality Score Distribution by Study</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of data quality across all clinical studies
          </p>
        </div>

        <div className="mb-6">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} margin={{ top: 30, right: 10, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="name"
                angle={-15}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 14, fill: '#1f2937' }}
              />
              <YAxis
                tick={{ fontSize: 14, fill: '#1f2937' }}
                label={{ value: 'Record count', angle: -90, position: 'left', style: { fontSize: 14, fill: '#1f2937' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 14 }} />
              <Bar dataKey="High Quality (≥0.9)" fill="#10b981">
                <LabelList
                  dataKey="High Quality (≥0.9)"
                  position="top"
                  formatter={formatNumber}
                  style={{ fontSize: 12, fontWeight: 600, fill: '#1f2937' }}
                />
              </Bar>
              <Bar dataKey="Low Quality (<0.8)" fill="#ef4444">
                <LabelList
                  dataKey="Low Quality (<0.8)"
                  position="top"
                  formatter={formatNumber}
                  style={{ fontSize: 12, fontWeight: 600, fill: '#1f2937' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 text-center mt-2">
            Note: Values from 0.80–0.89 are not included in Low Quality.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Study Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Study
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Measurements
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1">
                      Avg Quality
                      <span
                        className="inline-block cursor-help"
                        title="Average of record-level quality scores (0-1 scale)&#10;&#10;Green: ≥ 0.90 (High Quality)&#10;Yellow: ≥ 0.80 (Medium Quality)&#10;Red: < 0.80 (Low Quality)&#10;&#10;Note: Demo data generated during seeding"
                        aria-label="Average quality score explanation: Scores range from 0 to 1, with green for high quality (0.90 or above), yellow for medium quality (0.80 to 0.89), and red for low quality (below 0.80). This is demo data."
                      >
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </span>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    High Quality
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Quality
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((item, index) => (
                  <tr key={item.study_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.study_name}</div>
                        <div className="text-sm text-gray-500">{item.study_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 tabular-nums">
                      {formatCount(item.total_measurements)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex text-base font-semibold tabular-nums ${
                        parseFloat(item.avg_quality_score.toString()) >= 0.9
                          ? 'text-green-600'
                          : parseFloat(item.avg_quality_score.toString()) >= 0.8
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {formatQuality(parseFloat(item.avg_quality_score.toString()))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium text-gray-900 tabular-nums">
                      {formatCount(item.high_quality_count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium text-gray-900 tabular-nums">
                      {formatCount(item.low_quality_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QualityDashboard;
