// src/resourceManager/pages/EditPrompt.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { PromptForm } from './PromptForm';
import { API_ENDPOINTS } from '../../api/apiConfig';


const EditPrompt = () => {
  const { prompt_name, version } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    system_prompt: '',
    user_template: '',
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    output_parser_type: 'json_output_parser',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promptId, setPromptId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const historyRes = await axios.get(API_ENDPOINTS.GET_PROMPT_VERSION_HISTORY(prompt_name), { withCredentials: true });
        const draftVersion = historyRes.data.find(v => v.version === parseInt(version) && v.is_draft);

        if (!draftVersion) {
          alert('This version is not a draft or has been published.');
          navigate(`/manage-prompts/${prompt_name}`);
          return;
        }

        setPromptId(draftVersion.id);

        const detailRes = await axios.get(API_ENDPOINTS.GET_SPECIFIC_PROMPT_VERSION(prompt_name, version), { withCredentials: true });
        const data = detailRes.data;

        setFormData({
          system_prompt: data.system_prompt || '',
          user_template: data.user_template || '',
          temperature: data.temperature ?? 0.3,
          max_tokens: data.max_tokens ?? 2000,
          top_p: data.top_p ?? 0.95,
          frequency_penalty: data.frequency_penalty ?? 0,
          presence_penalty: data.presence_penalty ?? 0,
          output_parser_type: data.output_parser_type || 'json_output_parser',
        });
      } catch (err) {
        alert('Failed to load draft: ' + (err.response?.data?.detail || err.message));
        navigate(`/manage-prompts/${prompt_name}`);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [prompt_name, version, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Save changes to this draft?')) return;

    setSaving(true);
    try {
      await axios.patch(API_ENDPOINTS.UPDATE_DRAFT_PROMPT(promptId), formData, { withCredentials: true });
      alert('Draft updated successfully!');
      navigate(`/manage-prompts/${prompt_name}`);
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Thêm loading state
  if (loading) {
    return <div className="full-screen-loader"><div className="spinner"></div><p>Loading draft...</p></div>;
  }

  return (
    <PromptForm
      title={`Edit Draft v${version} – ${prompt_name}`}
      subtitle="Directly update this draft version"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      submitText="Save Draft Changes"
      saving={saving}
      showChangeSummary={false}
    />
  );
};

export default EditPrompt; // Đã sửa: bỏ dấu () ở đây