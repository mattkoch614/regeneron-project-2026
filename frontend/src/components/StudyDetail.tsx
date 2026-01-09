import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from './Loading';

interface StudyDetailData {
  study_id: string;
  study_name: string;
  study_phase: string;
  total_participants: number;
  age_distribution: {
    average: string;
    min: number;
    max: number;
  };
  gender_breakdown: Array<{
    gender: string;
    count: number;
    percentage: string;
  }>;
  site_distribution: Array<{
    site_id: string;
    participant_count: number;
  }>;
  total_measurements: number;
  avg_measurements_per_participant: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

function StudyDetail() {
  const { studyId } = useParams<{ studyId: string }>();
  const [data, setData] = useState<StudyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudyDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/studies/${studyId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch study data');
      } finally {
        setLoading(false);
      }
    };

    if (studyId) {
      fetchStudyDetail();
    }
  }, [studyId]);

  if (loading) {
    return (
      <Loading
        message="Loading study details..."
        subtitle="Gathering participant data"
      />
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Link to="/studies" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Studies
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Study not found</p>
        <Link to="/studies" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Studies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Link to="/studies" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Studies
        </Link>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{data.study_name}</h2>
          <p className="mt-1 text-sm text-gray-500">{data.study_id} • {data.study_phase}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-blue-50 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Participants</h3>
            <p className="text-3xl font-semibold text-gray-900">{data.total_participants.toLocaleString()}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Measurements</h3>
            <p className="text-3xl font-semibold text-gray-900">{data.total_measurements.toLocaleString()}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Measurements per Participant</h3>
            <p className="text-3xl font-semibold text-gray-900">{data.avg_measurements_per_participant}</p>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Average Age</p>
              <p className="text-2xl font-semibold text-gray-900">{data.age_distribution.average}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Minimum Age</p>
              <p className="text-2xl font-semibold text-gray-900">{data.age_distribution.min}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Maximum Age</p>
              <p className="text-2xl font-semibold text-gray-900">{data.age_distribution.max}</p>
            </div>
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.gender_breakdown.map((item) => (
              <div key={item.gender} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1 capitalize">{item.gender}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.count.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Site Distribution */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Distribution</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.site_distribution.map((site, index) => (
                  <tr key={site.site_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {site.site_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 tabular-nums">
                      {site.participant_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Collection Period */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Collection Period</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(data.date_range.start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-gray-400">→</div>
              <div>
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(data.date_range.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyDetail;
