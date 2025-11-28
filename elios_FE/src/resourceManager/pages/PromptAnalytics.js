import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/PromptAnalytics.css';

const PromptAnalytics = () => {
  const { prompt_name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          API_ENDPOINTS.GET_PROMPT_ANALYTICS(prompt_name),
          { withCredentials: true }
        );
        console.log(res.data);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'No analytics data available yet');
      } finally {
        setLoading(false);
      }
    };

    if (prompt_name) fetchAnalytics();
  }, [prompt_name]);

  // Dữ liệu cho Bar Chart
  const barData = data ? [
    { name: 'Prompt Tokens', value: Math.round(data.avg_prompt_tokens), fill: '#8b5cf6' },
    { name: 'Completion Tokens', value: Math.round(data.avg_completion_tokens), fill: '#3b82f6' },
    { name: 'Latency (ms)', value: Math.round(data.avg_latency_ms), fill: '#ef4444' },
  ] : [];

  // Dữ liệu cho Radar Chart (chuẩn hóa về 0-100)
  const radarData = data ? [
    {
      metric: 'Prompt Tokens',
      value: Math.min(100, (data.avg_prompt_tokens / 1000) * 100), // ~1000 tokens = 100
      fullMark: 100
    },
    {
      metric: 'Completion Tokens',
      value: Math.min(100, (data.avg_completion_tokens / 500) * 100),
      fullMark: 100
    },
    {
      metric: 'Latency (ms)',
      value: Math.max(0, 100 - Math.min(100, (data.avg_latency_ms / 10000) * 100)), // càng thấp càng tốt → đảo ngược
      fullMark: 100
    },
    {
      metric: 'Success Rate',
      value: data.success_rate * 100,
      fullMark: 100
    },
    {
      metric: 'Cost Efficiency',
      value: Math.max(0, 100 - Math.min(100, (data.estimated_cost_usd / 0.5) * 100)), // <0.5$ = tốt
      fullMark: 100
    },
  ] : [];

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading analytics...</p></div>;
  if (error && !data) return <div className="full-screen-loader error-text"><p>{error}</p></div>;

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="tab-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h1>Analytics: {prompt_name}</h1>
              <p className="intro-text">
                Performance metrics • Token usage • Latency • Cost
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          {!data ? (
            <div className="project-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <h3>No execution data yet</h3>
              <p>This prompt hasn't been used in production.</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                <div className="project-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#8b5cf6' }}>Total Executions</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{data.total_executions}</p>
                </div>
                <div className="project-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>Success Rate</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: data.success_rate === 1 ? '#10b981' : '#ef4444' }}>
                    {(data.success_rate * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="project-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#f59e0b' }}>Est. Cost</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>${data.estimated_cost_usd.toFixed(5)}</p>
                </div>
                <div className="project-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#6b7280' }}>Last Used</h3>
                  <p style={{ fontSize: '1.1rem', margin: 0 }}>
                    {new Date(data.last_executed_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Bar Chart */}
                <div className="project-card" style={{ padding: '2rem' }}>
                  <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Average Usage</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(v) => v.toLocaleString()} />
                      <Bar dataKey="value" fill={(entry) => entry.fill} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar Chart */}
                <div className="project-card" style={{ padding: '2rem' }}>
                  <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Performance Radar</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#444" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name={prompt_name}
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                        strokeWidth={3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Higher score = better performance
                  </p>
                </div>
              </div>

              {/* Token & Cost Details */}
              <div className="project-card" style={{ padding: '2rem', color: '#D3D3D3' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Detailed Metrics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <strong>Avg Prompt Tokens:</strong> {data.avg_prompt_tokens.toFixed(1)}
                  </div>
                  <div>
                    <strong>Avg Completion Tokens:</strong> {data.avg_completion_tokens.toFixed(1)}
                  </div>
                  <div>
                    <strong>Avg Latency:</strong> {(data.avg_latency_ms / 1000).toFixed(2)}s
                  </div>
                  <div>
                    <strong>Estimated Total Cost:</strong> ${data.estimated_cost_usd.toFixed(5)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default PromptAnalytics;