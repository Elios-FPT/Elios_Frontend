import React, { useMemo } from 'react';
import { mockFeedback } from '../data/mockData';
import '../style/FeedbackModal.css';

function FeedbackModal({ evaluations = [], onClose }) {
  // Transform evaluations to feedback format
  const feedback = useMemo(() => {
    if (!evaluations || evaluations.length === 0) {
      return mockFeedback; // Fallback to mock data
    }

    // Calculate overall score (average of all scores)
    const overallScore = evaluations.reduce((sum, ev) => sum + ev.score, 0) / evaluations.length;

    // Aggregate strengths and weaknesses
    const allStrengths = evaluations.flatMap(ev => ev.strengths || []);
    const allWeaknesses = evaluations.flatMap(ev => ev.weaknesses || []);

    // Extract unique strengths and weaknesses
    const uniqueStrengths = [...new Set(allStrengths)];
    const uniqueWeaknesses = [...new Set(allWeaknesses)];

    // Calculate category scores (simplified - real implementation would be more sophisticated)
    const categories = [
      {
        name: "Communication",
        score: (overallScore / 10) * 9.0,
        feedback: evaluations[0]?.feedback || "Good communication demonstrated",
      },
      {
        name: "Technical Knowledge",
        score: (overallScore / 10) * 8.0,
        feedback: "Technical responses analyzed",
      },
      {
        name: "Problem Solving",
        score: (overallScore / 10) * 8.5,
        feedback: "Analytical approach observed",
      },
      {
        name: "Depth of Response",
        score: overallScore / 10,
        feedback: `Average similarity score: ${(evaluations.reduce((sum, ev) => sum + (ev.similarity_score || 0), 0) / evaluations.length).toFixed(2)}`,
      },
    ];

    // Generate next steps based on gaps
    const nextSteps = [];
    evaluations.forEach(ev => {
      if (ev.gaps && ev.gaps.severity === 'critical') {
        nextSteps.push(`Address critical gaps in: ${ev.gaps.concepts?.join(', ')}`);
      }
    });

    if (nextSteps.length === 0) {
      nextSteps.push('Continue practicing interview techniques');
      nextSteps.push('Focus on providing detailed examples');
    }

    return {
      overallScore: (overallScore / 10).toFixed(1),
      categories,
      strengths: uniqueStrengths.slice(0, 5),
      areasForImprovement: uniqueWeaknesses.slice(0, 5),
      nextSteps: nextSteps.slice(0, 3),
    };
  }, [evaluations]);

  return (
    <div className="modal-overlay">
      <div className="feedback-modal">
        <div className="modal-header">
          <h2>Session Feedback</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Overall Score */}
          <div className="score-section">
            <div className="overall-score">
              <div className="score-number">{feedback.overallScore}</div>
              <div className="score-label">Overall Performance</div>
              <div className="score-sublabel">{evaluations.length} questions evaluated</div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="categories-section">
            <h3>Performance Breakdown</h3>
            <div className="categories-grid">
              {feedback.categories.map((category, index) => (
                <div key={index} className="category-card">
                  <div className="category-name">{category.name}</div>
                  <div className="category-score">{category.score.toFixed(1)}</div>
                  <div className="category-feedback">{category.feedback}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div className="strengths-section">
              <h3>Strengths</h3>
              <ul className="strengths-list">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="strength-item">✓ {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {feedback.areasForImprovement.length > 0 && (
            <div className="improvement-section">
              <h3>Areas for Improvement</h3>
              <ul className="improvement-list">
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index} className="improvement-item">• {area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="next-steps-section">
            <h3>Recommended Next Steps</h3>
            <ul className="next-steps-list">
              {feedback.nextSteps.map((step, index) => (
                <li key={index} className="next-step-item">→ {step}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="close-feedback-button" onClick={onClose}>
            Close Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
