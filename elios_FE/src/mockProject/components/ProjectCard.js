import React from 'react';
import '../styles/ProjectCard.css';

const ProjectCard = ({ project, onSelect }) => {
  return (
    <div className="project-card" onClick={() => onSelect(project.id)}>
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className={`difficulty ${project.difficulty.toLowerCase()}`}>
          {project.difficulty}
        </span>
      </div>

      <div className="project-info">
        <span className="language">{project.language}</span>
        <p className="description">
          {project.description
            .split(' ')
            .slice(0, 10)
            .join(' ') + (project.description.split(' ').length > 10 ? '...' : '')}
        </p>
      </div>

      <div className="project-footer">
        <span className="created-date">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </span>
        {project.updateAt && (
          <span className="updated-date">
            Updated: {new Date(project.updateAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;