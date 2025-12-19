import React, { useState } from 'react';
import { mockFeedback } from '../data/mockData';
import '../style/FeedbackModal.css';

function FeedbackModal({ detailedFeedback = null, onClose }) {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  // Use detailedFeedback if available, otherwise fallback to mock data
  const feedback = detailedFeedback || mockFeedback;

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Render score progression visualization
  const renderScoreProgression = (progression) => {
    if (!progression || progression.length === 0) return null;

    const maxScore = Math.max(...progression, 100);
    const minScore = Math.min(...progression, 0);

    return (
      <div className="score-progression">
        <div className="progression-label">Score Progression</div>
        <div className="progression-bars">
          {progression.map((score, index) => (
            <div key={index} className="progression-bar-container">
              <div className="progression-bar-label">Attempt {index + 1}</div>
              <div className="progression-bar-wrapper">
                <div
                  className="progression-bar"
                  style={{
                    width: `${((score - minScore) / (maxScore - minScore || 1)) * 100}%`,
                    backgroundColor: score >= 70 ? '#4caf50' : score >= 50 ? '#ff9800' : '#f44336'
                  }}
                >
                  <span className="progression-bar-value">{score.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render evaluation details
  const renderEvaluationDetails = (evaluation) => {
    if (!evaluation) return null;

    return (
      <div className="evaluation-details">
        <div className="evaluation-scores">
          <div className="evaluation-score-item">
            <span className="score-label">Final Score:</span>
            <span className="score-value">{evaluation.final_score?.toFixed(1) || 'N/A'}</span>
          </div>
          {evaluation.similarity_score !== undefined && (
            <div className="evaluation-score-item">
              <span className="score-label">Similarity:</span>
              <span className="score-value">{(evaluation.similarity_score * 100).toFixed(1)}%</span>
            </div>
          )}
          {evaluation.completeness !== undefined && (
            <div className="evaluation-score-item">
              <span className="score-label">Completeness:</span>
              <span className="score-value">{(evaluation.completeness * 100).toFixed(1)}%</span>
            </div>
          )}
          {evaluation.relevance !== undefined && (
            <div className="evaluation-score-item">
              <span className="score-label">Relevance:</span>
              <span className="score-value">{(evaluation.relevance * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {evaluation.reasoning && (
          <div className="evaluation-reasoning">
            <strong>Reasoning:</strong>
            <p>{evaluation.reasoning}</p>
          </div>
        )}

        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div className="evaluation-strengths">
            <strong>Strengths:</strong>
            <ul>
              {evaluation.strengths.map((strength, idx) => (
                <li key={idx}>✓ {strength}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
          <div className="evaluation-weaknesses">
            <strong>Weaknesses:</strong>
            <ul>
              {evaluation.weaknesses.map((weakness, idx) => (
                <li key={idx}>• {weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvement_suggestions && evaluation.improvement_suggestions.length > 0 && (
          <div className="evaluation-improvements">
            <strong>Improvement Suggestions:</strong>
            <ul>
              {evaluation.improvement_suggestions.map((suggestion, idx) => (
                <li key={idx}>→ {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.gaps && evaluation.gaps.length > 0 && (
          <div className="evaluation-gaps">
            <strong>Knowledge Gaps:</strong>
            <ul>
              {evaluation.gaps.map((gap, idx) => (
                <li key={idx}>
                  <span className={`gap-severity ${gap.severity}`}>
                    {gap.severity === 'major' ? '🔴' : gap.severity === 'moderate' ? '🟡' : '🟢'} {gap.concept}
                  </span>
                  {gap.resolved && <span className="gap-resolved">(Resolved)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render question feedback card
  const renderQuestionFeedback = (questionFeedback, index) => {
    if (!questionFeedback) return null;

    const isExpanded = expandedQuestions.has(questionFeedback.question_id);
    const hasFollowUps = questionFeedback.follow_up_evaluations && questionFeedback.follow_up_evaluations.length > 0;

    return (
      <div key={questionFeedback.question_id || index} className="question-feedback-card">
        <div
          className="question-feedback-header"
          onClick={() => toggleQuestion(questionFeedback.question_id)}
        >
          <div className="question-header-content">
            <h4 className="question-number">Question {index + 1}</h4>
            <p className="question-text">{questionFeedback.question_text}</p>
          </div>
          <span className="expand-icon material-icons">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        {isExpanded && (
          <div className="question-feedback-content">
            {/* Main Evaluation */}
            {questionFeedback.main_evaluation && (
              <div className="main-evaluation">
                <h5>Main Evaluation</h5>
                {renderEvaluationDetails(questionFeedback.main_evaluation)}
              </div>
            )}

            {/* Follow-up Evaluations */}
            {hasFollowUps && (
              <div className="follow-up-evaluations">
                <h5>Follow-up Evaluations</h5>
                {questionFeedback.follow_up_evaluations.map((followUp, idx) => (
                  <div key={idx} className="follow-up-evaluation">
                    <div className="follow-up-header">
                      <span className="follow-up-label">Follow-up #{followUp.attempt_number || idx + 1}</span>
                      <span className="follow-up-score">Score: {followUp.final_score?.toFixed(1) || 'N/A'}</span>
                    </div>
                    {renderEvaluationDetails(followUp)}
                  </div>
                ))}
              </div>
            )}

            {/* Score Progression */}
            {questionFeedback.score_progression && questionFeedback.score_progression.length > 0 && (
              <div className="question-score-progression">
                {renderScoreProgression(questionFeedback.score_progression)}
              </div>
            )}

            {/* Gap Filled Count */}
            {questionFeedback.gap_filled_count !== undefined && (
              <div className="gap-filled-info">
                <span className="gap-filled-label">Gaps Filled:</span>
                <span className="gap-filled-value">{questionFeedback.gap_filled_count}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="interview-feedback-modal" className="modal-overlay">
      <div className="feedback-modal">
        <div className="modal-header">
          <h2>Session Feedback</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Overall Score Section */}
          <div className="score-section">
            <div className="overall-score">
              <div className="score-number">
                {feedback.overall_score !== undefined ? feedback.overall_score.toFixed(1) : feedback.overallScore || 'N/A'}
              </div>
              <div className="score-label">Overall Performance</div>
              {feedback.total_questions !== undefined && (
                <div className="score-sublabel">
                  {feedback.total_questions} questions, {feedback.total_follow_ups || 0} follow-ups
                </div>
              )}
            </div>
          </div>

          {/* Category Scores */}
          {(feedback.theoretical_score_avg !== undefined || feedback.speaking_score_avg !== undefined) && (
            <div className="categories-section">
              <h3>Performance Breakdown</h3>
              <div className="categories-grid">
                {feedback.theoretical_score_avg !== undefined && (
                  <div className="category-card">
                    <div className="category-name">Theoretical Knowledge</div>
                    <div className="category-score">{feedback.theoretical_score_avg.toFixed(1)}</div>
                    <div className="category-feedback">Average theoretical understanding score</div>
                  </div>
                )}
                {feedback.speaking_score_avg !== undefined && (
                  <div className="category-card">
                    <div className="category-name">Speaking & Communication</div>
                    <div className="category-score">{(feedback.speaking_score_avg ?? 0).toFixed(1)}</div>
                    <div className="category-feedback">Average communication effectiveness score</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Section */}
          {(feedback.total_questions !== undefined || feedback.total_follow_ups !== undefined) && (
            <div className="statistics-section">
              <h3>Interview Statistics</h3>
              <div className="statistics-grid">
                {feedback.total_questions !== undefined && (
                  <div className="stat-item">
                    <span className="stat-value">{feedback.total_questions}</span>
                    <span className="stat-label">Total Questions</span>
                  </div>
                )}
                {feedback.total_follow_ups !== undefined && (
                  <div className="stat-item">
                    <span className="stat-value">{feedback.total_follow_ups}</span>
                    <span className="stat-label">Follow-up Questions</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gap Progression Section */}
          {feedback.gap_progression && (
            <div className="gap-progression-section">
              <h3>Gap Progression</h3>
              <div className="gap-progression-grid">
                {feedback.gap_progression.questions_with_followups !== undefined && (
                  <div className="gap-stat-item">
                    <span className="gap-stat-value">{feedback.gap_progression.questions_with_followups}</span>
                    <span className="gap-stat-label">Questions with Follow-ups</span>
                  </div>
                )}
                {feedback.gap_progression.gaps_filled !== undefined && (
                  <div className="gap-stat-item">
                    <span className="gap-stat-value">{feedback.gap_progression.gaps_filled}</span>
                    <span className="gap-stat-label">Gaps Filled</span>
                  </div>
                )}
                {feedback.gap_progression.gaps_remaining !== undefined && (
                  <div className="gap-stat-item">
                    <span className="gap-stat-value">{feedback.gap_progression.gaps_remaining}</span>
                    <span className="gap-stat-label">Gaps Remaining</span>
                  </div>
                )}
                {feedback.gap_progression.avg_followups_per_question !== undefined && (
                  <div className="gap-stat-item">
                    <span className="gap-stat-value">{feedback.gap_progression.avg_followups_per_question.toFixed(2)}</span>
                    <span className="gap-stat-label">Avg Follow-ups per Question</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Feedback Section */}
          {feedback.question_feedback && feedback.question_feedback.length > 0 && (
            <div className="questions-section">
              <h3>Question-by-Question Feedback</h3>
              <div className="questions-list">
                {feedback.question_feedback.map((questionFeedback, index) =>
                  renderQuestionFeedback(questionFeedback, index)
                )}
              </div>
            </div>
          )}

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="strengths-section">
              <h3>Strengths</h3>
              <ul className="strengths-list">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="strength-item">✓ {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {feedback.weaknesses && feedback.weaknesses.length > 0 && (
            <div className="improvement-section">
              <h3>Areas for Improvement</h3>
              <ul className="improvement-list">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="improvement-item">• {weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Study Recommendations */}
          {feedback.study_recommendations && feedback.study_recommendations.length > 0 && (
            <div className="study-recommendations-section">
              <h3>Study Recommendations</h3>
              <ul className="recommendations-list">
                {feedback.study_recommendations.map((recommendation, index) => (
                  <li key={index} className="recommendation-item">📚 {recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Technique Tips */}
          {feedback.technique_tips && feedback.technique_tips.length > 0 && (
            <div className="technique-tips-section">
              <h3>Technique Tips</h3>
              <ul className="tips-list">
                {feedback.technique_tips.map((tip, index) => (
                  <li key={index} className="tip-item">💡 {tip}</li>
                ))}
              </ul>
            </div>
          )}
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