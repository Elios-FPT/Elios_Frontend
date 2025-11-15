// Mock conversation data for the chat interface
export const mockMessages = [
  {
    id: 1,
    text: "Hello! It's great to see you. I understand you wanted to check in with me about my performance and communication with stakeholders.",
    sender: "ai",
    timestamp: "01:19",
    type: "text"
  },
  {
    id: 2,
    text: "Thank you for taking the time to meet with me. I've been working on several projects and would love to get your feedback on how I'm doing.",
    sender: "user",
    timestamp: "01:25",
    type: "text"
  },
  {
    id: 3,
    text: "I'd be happy to provide feedback. Let's start with your recent work on the client presentation. How do you feel that went?",
    sender: "ai",
    timestamp: "01:26",
    type: "text"
  },
  {
    id: 4,
    text: "I think it went well overall. I prepared thoroughly and made sure to address all the key points we discussed beforehand.",
    sender: "user",
    timestamp: "01:28",
    type: "text"
  }
];

// DetailedInterviewFeedback DTO mock data for testing
export const mockFeedback = {
  interview_id: "110e8400-e29b-41d4-a716-446655440000",
  overall_score: 72.5,
  theoretical_score_avg: 68.0,
  speaking_score_avg: 55.0,
  total_questions: 5,
  total_follow_ups: 7,
  question_feedback: [
    {
      question_id: "550e8400-e29b-41d4-a716-446655440000",
      question_text: "Explain the event loop in Node.js",
      main_evaluation: {
        answer_id: "660e8400-e29b-41d4-a716-446655440001",
        question_id: "550e8400-e29b-41d4-a716-446655440000",
        attempt_number: 1,
        raw_score: 65.0,
        penalty: 0.0,
        final_score: 65.0,
        similarity_score: 0.72,
        completeness: 0.7,
        relevance: 0.85,
        sentiment: "uncertain",
        reasoning: "Candidate mentioned call stack but missed microtask queue",
        strengths: [
          "Correctly identified call stack role",
          "Mentioned non-blocking I/O concept"
        ],
        weaknesses: [
          "Did not explain microtask vs macrotask priority",
          "Lacked concrete example"
        ],
        improvement_suggestions: [
          "Study microtask queue (Promises, process.nextTick)",
          "Provide setImmediate vs setTimeout example"
        ],
        gaps: [
          { concept: "microtask queue", severity: "major", resolved: false },
          { concept: "event loop phases", severity: "moderate", resolved: false }
        ],
        evaluated_at: "2025-11-15T10:30:00Z"
      },
      follow_up_evaluations: [
        {
          answer_id: "660e8400-e29b-41d4-a716-446655440002",
          question_id: "550e8400-e29b-41d4-a716-446655440000",
          attempt_number: 2,
          raw_score: 70.0,
          penalty: 0.0,
          final_score: 70.0,
          similarity_score: 0.75,
          completeness: 0.75,
          relevance: 0.80,
          sentiment: "confident",
          reasoning: "Improved explanation with Promise example",
          strengths: [
            "Added Promise example",
            "Better understanding of async operations"
          ],
          weaknesses: [
            "Still missing libuv phases explanation"
          ],
          improvement_suggestions: [
            "Study libuv event loop phases documentation"
          ],
          gaps: [
            { concept: "event loop phases", severity: "moderate", resolved: false }
          ],
          evaluated_at: "2025-11-15T10:32:00Z"
        },
        {
          answer_id: "660e8400-e29b-41d4-a716-446655440003",
          question_id: "550e8400-e29b-41d4-a716-446655440000",
          attempt_number: 3,
          raw_score: 80.0,
          penalty: 0.0,
          final_score: 80.0,
          similarity_score: 0.85,
          completeness: 0.85,
          relevance: 0.90,
          sentiment: "confident",
          reasoning: "Comprehensive answer covering all major aspects",
          strengths: [
            "Complete explanation of event loop",
            "Good examples with setTimeout and Promise",
            "Mentioned libuv phases"
          ],
          weaknesses: [],
          improvement_suggestions: [],
          gaps: [],
          evaluated_at: "2025-11-15T10:34:00Z"
        }
      ],
      score_progression: [65.0, 70.0, 80.0],
      gap_filled_count: 2
    },
    {
      question_id: "550e8400-e29b-41d4-a716-446655440001",
      question_text: "What is closure in JavaScript?",
      main_evaluation: {
        answer_id: "660e8400-e29b-41d4-a716-446655440004",
        question_id: "550e8400-e29b-41d4-a716-446655440001",
        attempt_number: 1,
        raw_score: 75.0,
        penalty: 0.0,
        final_score: 75.0,
        similarity_score: 0.80,
        completeness: 0.80,
        relevance: 0.85,
        sentiment: "confident",
        reasoning: "Good understanding of closure concept with example",
        strengths: [
          "Clear definition of closure",
          "Provided practical example",
          "Mentioned lexical scoping"
        ],
        weaknesses: [
          "Could explain memory implications better"
        ],
        improvement_suggestions: [
          "Study closure memory management",
          "Practice explaining closure use cases"
        ],
        gaps: [
          { concept: "closure memory management", severity: "minor", resolved: false }
        ],
        evaluated_at: "2025-11-15T10:36:00Z"
      },
      follow_up_evaluations: [
        {
          answer_id: "660e8400-e29b-41d4-a716-446655440005",
          question_id: "550e8400-e29b-41d4-a716-446655440001",
          attempt_number: 2,
          raw_score: 85.0,
          penalty: 0.0,
          final_score: 85.0,
          similarity_score: 0.88,
          completeness: 0.90,
          relevance: 0.90,
          sentiment: "confident",
          reasoning: "Excellent explanation with memory considerations",
          strengths: [
            "Complete closure explanation",
            "Discussed memory implications",
            "Multiple use case examples"
          ],
          weaknesses: [],
          improvement_suggestions: [],
          gaps: [],
          evaluated_at: "2025-11-15T10:38:00Z"
        }
      ],
      score_progression: [75.0, 85.0],
      gap_filled_count: 1
    },
    {
      question_id: "550e8400-e29b-41d4-a716-446655440002",
      question_text: "Explain the difference between let, const, and var",
      main_evaluation: {
        answer_id: "660e8400-e29b-41d4-a716-446655440006",
        question_id: "550e8400-e29b-41d4-a716-446655440002",
        attempt_number: 1,
        raw_score: 60.0,
        penalty: 0.0,
        final_score: 60.0,
        similarity_score: 0.65,
        completeness: 0.60,
        relevance: 0.70,
        sentiment: "uncertain",
        reasoning: "Basic understanding but missing key differences",
        strengths: [
          "Mentioned block scope for let/const",
          "Knew var is function scoped"
        ],
        weaknesses: [
          "Did not explain temporal dead zone",
          "Missing const immutability details",
          "No hoisting differences explained"
        ],
        improvement_suggestions: [
          "Study temporal dead zone concept",
          "Understand const immutability rules",
          "Review hoisting behavior differences"
        ],
        gaps: [
          { concept: "temporal dead zone", severity: "major", resolved: false },
          { concept: "const immutability", severity: "moderate", resolved: false }
        ],
        evaluated_at: "2025-11-15T10:40:00Z"
      },
      follow_up_evaluations: [
        {
          answer_id: "660e8400-e29b-41d4-a716-446655440007",
          question_id: "550e8400-e29b-41d4-a716-446655440002",
          attempt_number: 2,
          raw_score: 72.0,
          penalty: 0.0,
          final_score: 72.0,
          similarity_score: 0.75,
          completeness: 0.70,
          relevance: 0.75,
          sentiment: "confident",
          reasoning: "Better explanation with TDZ mention",
          strengths: [
            "Mentioned temporal dead zone",
            "Improved scope explanation"
          ],
          weaknesses: [
            "Still missing const immutability details"
          ],
          improvement_suggestions: [
            "Study const immutability rules"
          ],
          gaps: [
            { concept: "const immutability", severity: "moderate", resolved: false }
          ],
          evaluated_at: "2025-11-15T10:42:00Z"
        },
        {
          answer_id: "660e8400-e29b-41d4-a716-446655440008",
          question_id: "550e8400-e29b-41d4-a716-446655440002",
          attempt_number: 3,
          raw_score: 78.0,
          penalty: 0.0,
          final_score: 78.0,
          similarity_score: 0.82,
          completeness: 0.80,
          relevance: 0.85,
          sentiment: "confident",
          reasoning: "Comprehensive answer covering all key differences",
          strengths: [
            "Complete explanation of all three",
            "TDZ and hoisting differences covered",
            "Good const immutability explanation"
          ],
          weaknesses: [],
          improvement_suggestions: [],
          gaps: [],
          evaluated_at: "2025-11-15T10:44:00Z"
        }
      ],
      score_progression: [60.0, 72.0, 78.0],
      gap_filled_count: 2
    },
    {
      question_id: "550e8400-e29b-41d4-a716-446655440003",
      question_text: "What is the difference between == and === in JavaScript?",
      main_evaluation: {
        answer_id: "660e8400-e29b-41d4-a716-446655440009",
        question_id: "550e8400-e29b-41d4-a716-446655440003",
        attempt_number: 1,
        raw_score: 70.0,
        penalty: 0.0,
        final_score: 70.0,
        similarity_score: 0.75,
        completeness: 0.70,
        relevance: 0.80,
        sentiment: "confident",
        reasoning: "Correct basic explanation",
        strengths: [
          "Knew === checks type and value",
          "Mentioned == does type coercion"
        ],
        weaknesses: [
          "Could provide more examples",
          "Missing edge cases discussion"
        ],
        improvement_suggestions: [
          "Study type coercion edge cases",
          "Practice with more examples"
        ],
        gaps: [
          { concept: "type coercion edge cases", severity: "minor", resolved: false }
        ],
        evaluated_at: "2025-11-15T10:46:00Z"
      },
      follow_up_evaluations: [],
      score_progression: [70.0],
      gap_filled_count: 0
    },
    {
      question_id: "550e8400-e29b-41d4-a716-446655440004",
      question_text: "Explain async/await in JavaScript",
      main_evaluation: {
        answer_id: "660e8400-e29b-41d4-a716-446655440010",
        question_id: "550e8400-e29b-41d4-a716-446655440004",
        attempt_number: 1,
        raw_score: 68.0,
        penalty: 0.0,
        final_score: 68.0,
        similarity_score: 0.70,
        completeness: 0.65,
        relevance: 0.75,
        sentiment: "uncertain",
        reasoning: "Basic understanding but missing error handling",
        strengths: [
          "Correct syntax explanation",
          "Mentioned it's syntactic sugar for Promises"
        ],
        weaknesses: [
          "Did not explain error handling",
          "Missing try/catch discussion",
          "No parallel execution examples"
        ],
        improvement_suggestions: [
          "Study async/await error handling",
          "Learn Promise.all for parallel execution",
          "Practice with try/catch blocks"
        ],
        gaps: [
          { concept: "async/await error handling", severity: "major", resolved: false },
          { concept: "parallel async execution", severity: "moderate", resolved: false }
        ],
        evaluated_at: "2025-11-15T10:48:00Z"
      },
      follow_up_evaluations: [
        {
          answer_id: "660e8400-e29b-41d4-a716-446655440011",
          question_id: "550e8400-e29b-41d4-a716-446655440004",
          attempt_number: 2,
          raw_score: 75.0,
          penalty: 0.0,
          final_score: 75.0,
          similarity_score: 0.78,
          completeness: 0.75,
          relevance: 0.80,
          sentiment: "confident",
          reasoning: "Better explanation with error handling",
          strengths: [
            "Added try/catch explanation",
            "Better understanding of error propagation"
          ],
          weaknesses: [
            "Still missing parallel execution discussion"
          ],
          improvement_suggestions: [
            "Study Promise.all for parallel async operations"
          ],
          gaps: [
            { concept: "parallel async execution", severity: "moderate", resolved: false }
          ],
          evaluated_at: "2025-11-15T10:50:00Z"
        }
      ],
      score_progression: [68.0, 75.0],
      gap_filled_count: 1
    }
  ],
  gap_progression: {
    questions_with_followups: 4,
    gaps_filled: 6,
    gaps_remaining: 3,
    avg_followups_per_question: 1.75
  },
  strengths: [
    "Strong understanding of async patterns",
    "Good explanation of closure mechanics",
    "Clear communication of complex concepts",
    "Shows improvement through follow-up questions"
  ],
  weaknesses: [
    "Lacks depth in memory management details",
    "Needs more concrete examples in answers",
    "Nervous when discussing advanced topics",
    "Some knowledge gaps in fundamental concepts"
  ],
  study_recommendations: [
    "Review Node.js event loop phases (libuv documentation)",
    "Practice explaining garbage collection algorithms",
    "Study V8 engine internals (hidden classes, inline caching)",
    "Deep dive into JavaScript type coercion rules",
    "Master async/await error handling patterns"
  ],
  technique_tips: [
    "Take 5-10 seconds to structure answer before speaking",
    "Use concrete examples early in response",
    "Practice confident tone when discussing advanced topics",
    "Break down complex concepts into smaller parts",
    "Relate new concepts to familiar patterns"
  ],
  completion_time: "2025-11-15T10:52:00Z"
};

export const userProfile = {
  name: "You",
  role: "Manager",
  avatar: "person"
};

export const aiProfile = {
  name: "Sam",
  role: "Direct Report",
  avatar: "star"
};
