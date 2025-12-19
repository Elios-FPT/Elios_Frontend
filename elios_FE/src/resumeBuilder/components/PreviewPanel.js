// file: elios_FE/src/resumeBuilder/components/PreviewPanel.js
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/PreviewPanel.css';

const PreviewPanel = ({ resumeData }) => {
  const {
    personalInfo = {},
    experience = { items: [] },
    projects = { items: [] },
    education = { items: [] },
    skillsets = {}
  } = resumeData || {};

  // Create an array of contact info, filter out any empty values, and join them
  const contactInfo = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.address
  ].filter(Boolean).join(' | ');

  // Get links array safely
  const socialLinks = personalInfo.links?.items || [];

  // Filter out any skillset subsections that don't have items
  const populatedSkillsets = Object.values(skillsets)
    .filter(subset => subset && Array.isArray(subset.items) && subset.items.length > 0);

  return (
    <div className="resume-paper">
      <div id="resume-preview">
        {/* Personal Info */}
        <header className="preview-header">
          <h1>{personalInfo.firstName} {personalInfo.lastName}</h1>
          <p className="preview-job-title">{personalInfo.jobTitle}</p>
          <p className="preview-contact-info">
            {contactInfo}
          </p>
          
          {/* Social Links Section */}
          {socialLinks.length > 0 && (
            <div id="preview-social-links">
              {socialLinks.map((link, index) => (
                <span key={link.id}>
                  {link.url ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.name || link.url}
                    </a>
                  ) : (
                    <span>{link.name}</span>
                  )}
                  {index < socialLinks.length - 1 && ' | '}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Education Section */}
        {education.items?.length > 0 && (
          <section className="preview-section">
            <h2>EDUCATION</h2>
            {education.items.map(item => (
              <div key={item.id} className="preview-item">
                <h4>{item.degreeType} in {item.fieldOfStudy}</h4>
                <em>{item.institution} | {item.location}</em>
                <p>{item.start} - {item.grad} | GPA: {item.gpa}</p>
              </div>
            ))}
          </section>
        )}

        {/* Experience Section */}
        {experience.items?.length > 0 && (
          <section className="preview-section">
            <h2>EXPERIENCE</h2>
            {experience.items.map(item => (
              <div key={item.id} className="preview-item">
                <h4>{item.jobTitle} at {item.employer}</h4>
                <em>{item.start} - {item.end} | {item.location}</em>
                <p>{item.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {/* Skillsets Section */}
        {populatedSkillsets.length > 0 && (
          <section className="preview-section">
            <h2>SKILLS</h2>
            <div className="skill-grid">
              {populatedSkillsets.map(subset => (
                <div key={subset.id} className="skill-subset">
                  <strong>{subset.title}:</strong>
                  <span>{subset.items.map(item => item.name).join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects.items?.length > 0 && (
          <section className="preview-section">
            <h2>PROJECTS</h2>
            {projects.items.map(item => (
              <div key={item.id} className="preview-item">
                <h4>{item.projectName} | <span className="project-role">{item.role}</span></h4>
                {/* Added Date display here */}
                {(item.start || item.end) && (
                   <em style={{ display: 'block', marginBottom: '5px' }}>
                     {item.start}{item.start && item.end ? ' - ' : ''}{item.end}
                   </em>
                )}
                <p className="project-description">{item.description}</p>
                <p className="project-tech-stack"><strong>Tech Stack:</strong> {item.techStack}</p>

                {item.achievements && (
                  <div className="project-achievements">
                    <ul>
                      {item.achievements.split('\n').filter(line => line.trim() !== '').map((ach, index) => <li key={index}>{ach}</li>)}
                    </ul>
                  </div>
                )}

                {(item.githubUrl || item.liveUrl) && (
                  <div className="project-links">
                    {item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>}
                    {item.githubUrl && item.liveUrl && ' | '}
                    {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
};

PreviewPanel.propTypes = {
  resumeData: PropTypes.object,
};

PreviewPanel.defaultProps = {
  resumeData: {},
};

export default PreviewPanel;