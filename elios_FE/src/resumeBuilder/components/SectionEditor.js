// file: elios_FE/src/resumeBuilder/components/SectionEditor.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import FieldRow from './FieldRow';

const SectionEditor = ({ section, path, onFieldChange, onAddItem, onRemoveItem }) => {
  const { id: sectionId, title } = section;
  // Personal Info section is open by default, others are closed.
  const [isOpen, setIsOpen] = useState(path === 'personalInfo');

  const renderSectionContent = () => {
    // SPECIAL CASE: Custom grid layout for Personal Info
    if (sectionId === 'personalInfo') {
      return (
        <div className="personal-info-grid">
          <Row>
            <Col sm={6}>
              <FieldRow
                label="First Name"
                id={`${path}-firstName`}
                value={section.firstName}
                onChange={(e) => onFieldChange(path, 'firstName', e.target.value)}
              />
            </Col>
            <Col sm={6}>
              <FieldRow
                label="Last Name"
                id={`${path}-lastName`}
                value={section.lastName}
                onChange={(e) => onFieldChange(path, 'lastName', e.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
               <FieldRow
                label="Email"
                id={`${path}-email`}
                type="email"
                value={section.email}
                onChange={(e) => onFieldChange(path, 'email', e.target.value)}
              />
            </Col>
            <Col sm={6}>
              <FieldRow
                label="Phone"
                id={`${path}-phone`}
                type="tel"
                value={section.phone}
                onChange={(e) => onFieldChange(path, 'phone', e.target.value)}
              />
            </Col>
          </Row>
          <FieldRow
            label="Address"
            id={`${path}-address`}
            value={section.address}
            onChange={(e) => onFieldChange(path, 'address', e.target.value)}
          />
          <FieldRow
            label="Job Title"
            id={`${path}-jobTitle`}
            value={section.jobTitle}
            onChange={(e) => onFieldChange(path, 'jobTitle', e.target.value)}
          />
          {/* Links subsection */}
          <SectionEditor 
            section={section.links} 
            path={`${path}.links`}
            onFieldChange={onFieldChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />
        </div>
      );
    }
    
    // Default rendering for sections with items (Experience, Education, Links, etc.)
    if (Array.isArray(section.items)) {
      return (
        <div>
          {section.items.map((item) => (
            <div key={item.id} className="section-item-container">
              {Object.keys(item).filter(key => key !== 'id').map(field => {
                // Determine if the field should be a textarea
                const isTextarea = field === 'description' || field === 'achievements';
                return (
                    <FieldRow
                      key={field}
                      id={`${path}-${item.id}-${field}`}
                      label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      type={isTextarea ? 'textarea' : 'text'}
                      value={item[field]}
                      onChange={(e) => onFieldChange(path, field, e.target.value, item.id)}
                    />
                );
              })}
              <button className="remove-btn" onClick={() => onRemoveItem(path, item.id)}>Remove</button>
            </div>
          ))}
          <button className="add-btn" onClick={() => onAddItem(path)}>+ Add {title}</button>
        </div>
      );
    }

    // Container for sub-sections (Skillsets)
    const subSections = Object.values(section).filter(val => typeof val === 'object' && val.id && val.title);
    if (subSections.length > 1) {
       return (
         <div>
          {subSections.map(subSection => (
              <SectionEditor
                key={subSection.id}
                section={subSection}
                path={`${path}.${subSection.id}`}
                onFieldChange={onFieldChange}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
              />
          ))}
         </div>
       );
    }

    return null; // Should not happen with the current data structure
  };
  
  // Don't render an accordion for the inner "Links" title
  if (sectionId === 'links') {
    return renderSectionContent();
  }

  return (
    <div className="accordion-section">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}></span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {renderSectionContent()}
        </div>
      )}
    </div>
  );
};

SectionEditor.propTypes = {
  section: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
};

export default SectionEditor;