// src/interview/components/interview/ReviewItem.jsx
import React, { useState, useEffect } from 'react';
import toast from '../utils/toast';

const ReviewItem = ({ item, isSaving, onSave }) => {
  const [skillRating, setSkillRating] = useState(item.review?.skillRating || '');
  const [softSkillRating, setSoftSkillRating] = useState(item.review?.softSkillRating || '');
  const [comment, setComment] = useState(item.review?.comment || '');
  const [isDirty, setIsDirty] = useState(false);

  // Lấy questionId thực tế để gửi lên server
  const questionId = item.reviewId.startsWith('unanswered-')
    ? item.reviewId.substring(11)
    : item.reviewId;

  // Theo dõi thay đổi để bật nút Lưu
  useEffect(() => {
    const hasChanged =
      skillRating !== (item.review?.skillRating || '') ||
      softSkillRating !== (item.review?.softSkillRating || '') ||
      comment !== (item.review?.comment || '');

    setIsDirty(hasChanged);
  }, [skillRating, softSkillRating, comment, item.review]);

  const handleSave = () => {
    if (!skillRating || !softSkillRating) {
      toast.warning('Vui lòng chấm cả 2 điểm số trước khi lưu!');
      return;
    }
    onSave(questionId, skillRating, softSkillRating, comment);
  };

  const isSaved = !!item.review?.skillRating && !!item.review?.softSkillRating;
  const hasAnswer = !!item.answer;

  return (
    <div
      className="review-item"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 28,
        marginBottom: 32,
        background: '#ffffff',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        position: 'relative',
      }}
    >
      {/* Badge trạng thái góc phải */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          color: 'white',
          background: isSaved ? '#10b981' : '#f59e0b',
        }}
      >
        {isSaved ? 'Đã lưu' : 'Chưa lưu'}
      </div>

      {/* Badge Follow-up góc trái */}
      {item.isFollowUp && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 20,
            background: '#7c3aed',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          FOLLOW-UP
        </div>
      )}

      {/* Câu hỏi */}
      <h3
        style={
          item.isFollowUp
            ? { margin: '20px 0 16px', color: '#1e293b', fontSize: 19, fontWeight: 600 }
            : { margin: '0 0 16px', color: '#1e293b', fontSize: 19, fontWeight: 600 }
        }
      >
        Câu hỏi: {item.question.text}
      </h3>

      {/* Trả lời */}
      <div
        style={{
          background: hasAnswer ? '#f8fafc' : '#fee2e2',
          padding: 18,
          borderRadius: 12,
          margin: '20px 0',
          borderLeft: hasAnswer ? '6px solid #3b82f6' : '6px solid #ef4444',
          fontSize: 15.5,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: hasAnswer ? '#1e40af' : '#991b1b' }}>
          Trả lời:
        </strong>{' '}
        {hasAnswer ? (
          item.answer.is_voice ? (
            <div style={{ marginTop: 10 }}>
              <audio
                controls
                src={item.answer.audio_path}
                style={{ width: '100%', maxWidth: 500 }}
              >
                Trình duyệt không hỗ trợ audio.
              </audio>
              <p style={{ fontStyle: 'italic', color: '#64748b', marginTop: 8 }}>
                (Giọng nói – vui lòng nghe để đánh giá)
              </p>
            </div>
          ) : (
            <span>{item.answer.text || '(Không có nội dung)'}</span>
          )
        ) : (
          <span style={{ color: '#991b1b', fontWeight: 600 }}>
            Ứng viên chưa trả lời câu này
          </span>
        )}
      </div>

      {/* Điểm số */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, margin: '28px 0' }}>
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 10,
              fontWeight: 600,
              color: '#1e40af',
              fontSize: 16,
            }}
          >
            Kỹ năng kỹ thuật (Technical Skill)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={skillRating}
            onChange={(e) => setSkillRating(e.target.value)}
            style={{
              width: 90,
              padding: '12px 14px',
              fontSize: 18,
              borderRadius: 10,
              border: '2px solid #cbd5e1',
              textAlign: 'center',
            }}
          />
          <span style={{ marginLeft: 16, fontSize: 22, fontWeight: 600, color: '#1e40af' }}>
            {skillRating ? `${skillRating}/5` : '–/5'}
          </span>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 10,
              fontWeight: 600,
              color: '#1e40af',
              fontSize: 16,
            }}
          >
            Giao tiếp & Trình bày
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={softSkillRating}
            onChange={(e) => setSoftSkillRating(e.target.value)}
            style={{
              width: 90,
              padding: '12px 14px',
              fontSize: 18,
              borderRadius: 10,
              border: '2px solid #cbd5e1',
              textAlign: 'center',
            }}
          />
          <span style={{ marginLeft: 16, fontSize: 22, fontWeight: 600, color: '#1e40af' }}>
            {softSkillRating ? `${softSkillRating}/5` : '–/5'}
          </span>
        </div>
      </div>

      {/* Nhận xét */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Nhận xét chi tiết – rất hữu ích cho ứng viên... (khuyến khích)"
        rows={6}
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          border: '2px solid #cbd5e1',
          marginTop: 8,
          fontSize: 15.5,
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />

      {/* Nút Lưu */}
      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving || !skillRating || !softSkillRating}
          style={{
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 600,
            border: 'none',
            borderRadius: 12,
            background: isDirty && skillRating && softSkillRating ? '#6366f1' : '#94a3b8',
            color: 'white',
            cursor: isDirty && skillRating && softSkillRating ? 'pointer' : 'not-allowed',
            minWidth: 140,
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu đánh giá'}
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;