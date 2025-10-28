// file: elios_FE/src/resumeBuilder/components/FieldRow.js
import React from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable component for a single form field.
 */
const FieldRow = ({ label, id, type = 'text', value, placeholder, onChange, error }) => {
  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div id={`field-container-${id}`} className="field-row">
      <label htmlFor={id}>{label}</label>
      <InputComponent
        id={id}
        type={type}
        value={value}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        onChange={onChange}
        // Add rows attribute for textareas to make them larger
        rows={type === 'textarea' ? 4 : undefined}
      />
      {error && <span id={`error-msg-${id}`}>{error}</span>}
    </div>
  );
};

FieldRow.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default FieldRow;