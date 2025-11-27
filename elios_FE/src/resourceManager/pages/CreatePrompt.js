// src/resourceManager/pages/CreatePrompt.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { PromptForm } from './PromptForm';
import { API_ENDPOINTS } from '../../api/apiConfig';

const CreatePrompt = () => {
  const { prompt_name, from_version } = useParams();
  const navigate = useNavigate();

  const [nextVersion, setNextVersion] = useState(null);
  const [formData, setFormData] = useState({
    change_summary: '',
    system_prompt: '',
    user_template: '',
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    output_parser_type: 'json_output_parser',
    created_by: 'admin'
  });

  const isBrandNew = from_version === '-1';

  useEffect(() => {
    const fetch = async () => {
      try {
        const historyRes = await axios.get(API_ENDPOINTS.GET_PROMPT_VERSION_HISTORY(prompt_name), { withCredentials: true });
        const maxVer = historyRes.data.length > 0 
          ? Math.max(...historyRes.data.map(v => v.version)) 
          : 0;
        setNextVersion(maxVer + 1);

        if (!isBrandNew && from_version) {
          const sourceVer = parseInt(from_version);
          const detailRes = await axios.get(API_ENDPOINTS.GET_SPECIFIC_PROMPT_VERSION(prompt_name, sourceVer), { withCredentials: true });
          const data = detailRes.data;

          setFormData(prev => ({
            ...prev,
            system_prompt: data.system_prompt || '',
            user_template: data.user_template || '',
            temperature: data.temperature ?? 0.3,
            max_tokens: data.max_tokens ?? 2000,
            top_p: data.top_p ?? 0.95,
            frequency_penalty: data.frequency_penalty ?? 0,
            presence_penalty: data.presence_penalty ?? 0,
            output_parser_type: data.output_parser_type || 'json_output_parser',
          }));
        }
      } catch (err) {
        console.error('Failed to load base version:', err);
      }
    };

    fetch();
  }, [prompt_name, from_version, isBrandNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isBrandNew && !formData.change_summary.trim()) {
      alert('Please provide a change summary');
      return;
    }

    try {
      const payload = {
        ...formData,
        parent_version: isBrandNew ? null : parseInt(from_version),
        change_summary: isBrandNew ? 'Initial version' : formData.change_summary.trim(),
      };

      await axios.post(API_ENDPOINTS.CREATE_PROMPT_VERSION(prompt_name), payload, { withCredentials: true });
      
      alert(`Version v${nextVersion} created as draft!`);
      navigate(`/manage-prompts/${prompt_name}`);
    } catch (err) {
      alert('Create failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Title và subtitle đúng theo ngữ cảnh
  const title = isBrandNew 
    ? `Create New Prompt: ${prompt_name}` 
    : `New Version v${nextVersion} – ${prompt_name}`;
  
  const subtitle = isBrandNew 
    ? 'Create the brand new version of this prompt' 
    : `Based on v${from_version}`;

  if (!nextVersion) {
    return <div className="full-screen-loader"><div className="spinner"></div><p>Loading...</p></div>;
  }

  return (
    <PromptForm
      title={title}
      subtitle={subtitle}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      submitText={`Create v${nextVersion} (Draft)`}
      saving={false}
      showChangeSummary={!isBrandNew}
    />
  );
};

export default CreatePrompt; // Đã sửa: bỏ ()