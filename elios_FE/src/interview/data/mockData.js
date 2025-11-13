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

export const mockFeedback = {
  overallScore: 8.5,
  categories: [
    {
      name: "Communication",
      score: 9.0,
      feedback: "Excellent communication skills demonstrated throughout the session."
    },
    {
      name: "Technical Knowledge",
      score: 8.0,
      feedback: "Strong technical foundation with room for growth in advanced topics."
    },
    {
      name: "Problem Solving",
      score: 8.5,
      feedback: "Good analytical thinking and systematic approach to challenges."
    },
    {
      name: "Collaboration",
      score: 9.0,
      feedback: "Works well with team members and stakeholders effectively."
    }
  ],
  strengths: [
    "Clear and articulate communication",
    "Strong preparation and organization",
    "Good stakeholder management",
    "Proactive approach to challenges"
  ],
  areasForImprovement: [
    "Could benefit from more technical depth in certain areas",
    "Consider taking on more complex projects",
    "Opportunity to mentor junior team members"
  ],
  nextSteps: [
    "Continue current project management approach",
    "Take on a more challenging technical project",
    "Consider leadership opportunities"
  ]
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
