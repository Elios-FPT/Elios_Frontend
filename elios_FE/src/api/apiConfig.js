// elios_FE/src/api/apiConfig.js
const baseUrl = process.env.REACT_APP_DEVELOPMENT_API_URL;

export const API_ENDPOINTS = {
    LOGIN_PATH: 'http://oauth2.elios.com/oauth2/start?rd=http%3A%2F%2Fwww.elios.com',
    LOGOUT_PATH: 'http://oauth2.elios.com/oauth2/sign_out?rd=http%3A%2F%2Fwww.elios.com',

    HEALTH_CHECK: '/health',
    ROOT: '/',

    CREATE_INITIAL_PROMPT: `${baseUrl}/api/ai/prompts`,

    LIST_PROMPTS: `${baseUrl}/api/ai/prompts`,

    CREATE_PROMPT_VERSION: (name) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/versions`,

    GET_PROMPT_VERSION_HISTORY: (name) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/versions`,

    ROLLBACK_PROMPT: (name) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/rollback`,

    GET_SPECIFIC_PROMPT_VERSION: (name, version) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/versions/${version}`,

    GET_PROMPT_BY_ID: (promptId) => `${baseUrl}/api/ai/prompts/${promptId}`,

    DELETE_PROMPT: (promptId) => `${baseUrl}/api/ai/prompts/${promptId}`,

    ACTIVATE_PROMPT_VERSION: (promptId) => `${baseUrl}/api/ai/prompts/${promptId}/activate`,

    ADJUST_PROMPT_TRAFFIC: (promptId) => `${baseUrl}/api/ai/prompts/${promptId}/traffic`,

    GET_ACTIVE_PROMPT: (name) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/active`,

    GET_PROMPT_ANALYTICS: (name) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/analytics`,

    GET_PROMPT_AUDIT_TRAIL: (name) => `${baseUrl}/api/ai/prompts/${encodeURIComponent(name)}/audit-trail`,

    PUBLISH_DRAFT_PROMPT: (promptId) => `${baseUrl}/api/ai/prompts/${promptId}/publish`,

    UPDATE_DRAFT_PROMPT: (promptId) => `${baseUrl}/api/ai/prompts/${promptId}/draft`,

    UPLOAD_CV: '/api/interviews/cv/upload',
    PLAN_INTERVIEW: '/api/interviews/plan',
    GET_PLANNING_STATUS: (interviewId) => `/api/interviews/${interviewId}/plan`,
    GET_INTERVIEW_DETAIL: (interviewId) => `/api/interviews/${interviewId}`,
    START_INTERVIEW: (interviewId) => `/api/interviews/${interviewId}/start`,
    GET_CURRENT_QUESTION: (interviewId) => `/api/interviews/${interviewId}/questions/current`,
    GET_INTERVIEW_SUMMARY: (interviewId) => `/api/interviews/${interviewId}/summary`,

    // User API Endpoints
    GET_USER_PROFILE: `${baseUrl}/api/users/me/profile`,
    GET_USER_BY_ID: (id) => `${baseUrl}/api/users/${id}`,
    UPDATE_USER: `${baseUrl}/api/users`,

    // CV API Endpoints
    GET_USER_CV: `${baseUrl}/api/cvbuilder/UserCvs`,
    CREATE_USER_CV: `${baseUrl}/api/cvbuilder/UserCvs`,
    GET_USER_CV_DETAIL: (cvId) => `${baseUrl}/api/cvbuilder/UserCvs/${cvId}`,
    SAVE_DRAFT_USER_CV: (cvId) => `${baseUrl}/api/cvbuilder/UserCvs/${cvId}`,
    DELETE_USER_CV: (cvId) => `${baseUrl}/api/cvbuilder/UserCvs/${cvId}`,

    // Forum API Endpoints
    GET_POSTS_FORUM: `${baseUrl}/api/forum/posts`,
    GET_CATEGORIES_FORUM: `${baseUrl}/api/forum/Category`,
    GET_POST_CONTENT: (postId) => `${baseUrl}/api/forum/posts/${postId}`,
    CREATE_POST: `${baseUrl}/api/forum/posts`,
    DRAFT_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}`,
    SUBMIT_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}/submit`,
    CREATE_COMMENT: `${baseUrl}/api/forum/Comment`,
    EDIT_COMMENT: (commentId) => `${baseUrl}/api/forum/Comment/${commentId}`,
    DELETE_COMMENT: (commentId) => `${baseUrl}/api/forum/Comment/${commentId}`,
    UPVOTE_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}/upvote`,
    DOWNVOTE_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}/downvote`,
    GET_MY_POSTS: `${baseUrl}/api/forum/posts/my-posts`,
    GET_MY_POST_CONTENT: (postId) => `${baseUrl}/api/forum/posts/my-posts/${postId}`,
    DELETE_MY_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}`,
    UPLOAD_IMAGE: `${baseUrl}/api/forum/upload`,
    GET_MY_IMAGE_POOL: `${baseUrl}/api/forum/upload/images`,
    DELETE_IMAGE_FROM_POOL: (imageId) => `${baseUrl}/api/forum/upload/${imageId}`,
    GET_MY_BANNED_STATUS: `${baseUrl}/api/forum/bans/myStatus`,
    REPORT_POST: `${baseUrl}/api/forum/reports`,
    REPORT_COMMENT: `${baseUrl}/api/forum/reports`,
    CREATE_SOLUTION: `${baseUrl}/api/forum/posts`,
    GET_SOLUTION: `${baseUrl}/api/forum/posts`,



    //Admin forum API Endpoints
    GET_PENDING_POSTS: `${baseUrl}/api/forum/moderator/posts/pending`,
    APPROVE_PENDING_POST: (postId) => `${baseUrl}/api/forum/moderator/posts/${postId}/approve`,
    REJECT_PENDING_POST: (postId) => `${baseUrl}/api/forum/moderator/posts/${postId}/reject`,
    MODERATOR_DELETE_POST: (postId) => `${baseUrl}/api/forum/moderator/posts/${postId}`,
    GET_CATEGORIES: `${baseUrl}/api/forum/Category`,
    CREATE_CATEGORY: `${baseUrl}/api/forum/Category`,
    UPDATE_CATEGORY: (categoryId) => `${baseUrl}/api/forum/Category/${categoryId}`,
    DELETE_CATEGORY: (categoryId) => `${baseUrl}/api/forum/Category/${categoryId}`,
    REPORTED_CONTENT: `${baseUrl}/api/forum/reports`,
    GET_DETAIL_REPORTED_CONTENT: (reportId) => `${baseUrl}/api/forum/reports/${reportId}`,
    RESOLVE_REPORTED_CONTENT: (reportId) => `${baseUrl}/api/forum/reports/${reportId}/resolve`,
    BAN_USER: `${baseUrl}/api/forum/bans`,
    UN_BAN_USER: (banId) => `${baseUrl}/api/forum/bans/${banId}/unban`,



    // Codeing Challenge API Endpoints
    GET_CODE_PRACTICES_LIST: `${baseUrl}/api/code-practices`,
    GET_CODE_PRACTICE_DETAIL: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}`,
    RUN_CODE_SOLUTION: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/run`,
    CREATE_CODE_PRACTICE: `${baseUrl}/api/code-practices`,
    UPDATE_CODE_PRACTICE: (id) => `${baseUrl}/api/code-practices/${id}`,
    DELETE_CODE_PRACTICE: (id) => `${baseUrl}/api/code-practices/${id}`,
    SUBMIT_CODE_SOLUTION: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/submissions`,
    GET_SUBMISSION_HISTORY: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/submissions`,
    GET_SUBMISSION_HISTORY_DETAIL: (submissionId) => `${baseUrl}/api/code-practices/submissions/${submissionId}`,
    GET_SOLUTION_FORUM: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/forum`,

    // Mock Interview API Endpoints

    // MOCK PROJECT API ENDPOINTS
    GET_MOCK_PROJECTS_LIST: `${baseUrl}/api/mockproject/mock-projects`,
    GET_MOCK_PROJECT_DETAIL: (projectId) => `${baseUrl}/api/mockproject/mock-projects/${projectId}`,
    CREATE_MOCK_PROJECT: `${baseUrl}/api/mockproject/mock-projects`,
    UPDATE_MOCK_PROJECT: (projectId) => `${baseUrl}/api/mockproject/mock-projects/${projectId}`,
    DELETE_MOCK_PROJECT: (projectId) => `${baseUrl}/api/mockproject/mock-projects/${projectId}`,

    GET_MOCK_PROJECT_PROCESSES: (projectId) => `${baseUrl}/api/mockproject/mock-projects/${projectId}/processes`,
    ADD_MOCK_PROJECT_PROCESS: (projectId) => `${baseUrl}/api/mockproject/mock-projects/${projectId}/processes`,

    GET_MOCK_PROJECTS_STATISTICS: `${baseUrl}/api/mockproject/mock-projects/statistics`,
    GET_TOP_SUBMISSIONS: (projectId, top = 10) => `${baseUrl}/api/mockproject/mock-projects/${projectId}/top-submissions?top=${top}`,
    AUTO_EVALUATE_SUBMISSION: (projectId) => `${baseUrl}/api/mockproject/mock-projects/${projectId}/auto-evaluate`,
    UPLOAD_ZIP: `${baseUrl}/api/mockproject/mock-projects/upload-zip`,

    // PROCESS API ENDPOINTS
    GET_PROCESS_DETAIL: (processId) => `${baseUrl}/api/mockproject/processes/${processId}`,
    UPDATE_PROCESS: (processId) => `${baseUrl}/api/mockproject/processes/${processId}`,
    DELETE_PROCESS: (processId) => `${baseUrl}/api/mockproject/processes/${processId}`,

    // SUBMISSION API ENDPOINTS
    GET_SUBMISSIONS_LIST: `${baseUrl}/api/mockproject/submissions`,
    GET_SUBMISSIONS_LIST_CURRENT_USER: `${baseUrl}/api/mockproject/submissions/current`,
    GET_SUBMISSION_DETAIL: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}`,
    CREATE_SUBMISSION: `${baseUrl}/api/mockproject/submissions`,
    UPDATE_SUBMISSION: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}`,
    RESUBMIT_SUBMISSION: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}/resubmit`,
    EVALUATE_SUBMISSION: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}/evaluate`,
    SAVE_FEEDBACK: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}/feedback`,
    GET_SUBMISSION_SCORE: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}/score`,
    GET_SUBMISSIONS_STATISTICS: `${baseUrl}/api/mockproject/submissions/statistics`,
    GET_SUBMISSIONS_STATISTICS_CURRENT: `${baseUrl}/api/mockproject/submissions/statistics/current`,

    // Submission Classes
    GET_SUBMISSIONS_CLASSES: `${baseUrl}/api/mockproject/submissions/classes`,
    GET_SUBMISSIONS_CLASSES_BY_SUBMISSION: (submissionId) => `${baseUrl}/api/mockproject/submissions/${submissionId}/classes`,
    GET_SUBMISSIONS_CLASS_DETAIL: (classId) => `${baseUrl}/api/mockproject/submissions/classes/${classId}`,
    CREATE_SUBMISSIONS_CLASS: `${baseUrl}/api/mockproject/submissions/classes`,
    UPDATE_SUBMISSIONS_CLASS: (classId) => `${baseUrl}/api/mockproject/submissions/classes/${classId}`,
    DELETE_SUBMISSIONS_CLASS: (classId) => `${baseUrl}/api/mockproject/submissions/classes/${classId}`,

    PEER_BROWSE_PUBLIC_POOL: `${baseUrl}/api/peerreview/SharedInterviews?status=open`,
    PEER_SHARE_INTERVIEW: `${baseUrl}/api/peerreview/SharedInterviews`,
    PEER_GET_MY_SHARED_INTERVIEWS: `${baseUrl}/api/peerreview/SharedInterviews/mine`,
    PEER_GET_REVIEWS_RECEIVED: (sharedId) => `${baseUrl}/api/peerreview/SharedInterviews/${sharedId}/reviews`,
    PEER_CLOSE_INTERVIEW: (sharedId) => `${baseUrl}/api/peerreview/SharedInterviews/${sharedId}/close`,

    PEER_START_REVIEW: `${baseUrl}/api/peerreview/ReviewSubmissions/start`,
    PEER_SUBMIT_REVIEW: (submissionId) => `${baseUrl}/api/peerreview/ReviewSubmissions/${submissionId}/submit`,
    PEER_GET_PROGRESS: (submissionId) => `${baseUrl}/api/peerreview/ReviewSubmissions/${submissionId}`,
    PEER_DELETE_DRAFT: (submissionId) => `${baseUrl}/api/peerreview/ReviewSubmissions/${submissionId}`,

    PEER_SAVE_DRAFT_REVIEW: `${baseUrl}/api/peerreview/AnswerReviews`,

    PEER_RATE_SUBMISSION: `${baseUrl}/api/peerreview/OwnerRatings`,

    PEER_GET_REVIEWER_STATS: (userId) => `${baseUrl}/api/peerreview/ReviewerStats/${userId}/stats`,
    PEER_GET_MY_STATS: `${baseUrl}/api/peerreview/my-stats`,

    PAY_GET_USER_ORDERS: (userId) => `${baseUrl}/api/payment/Order/user/${userId}`,
    PAY_GET_CURRENT_ORDERS: `${baseUrl}/api/payment/Order/user/current`, 
    PAY_GET_ORDER_DETAIL: (orderId) => `${baseUrl}/api/payment/Order/${orderId}`,
    PAY_CREATE_ORDER: `${baseUrl}/api/payment/Order`,
    PAY_CANCEL_ORDER: (orderId) => `${baseUrl}/api/payment/Order/${orderId}/cancel`,
    PAY_GET_INVOICES: (orderId) => `${baseUrl}/api/payment/Order/${orderId}/invoices`,
    PAY_DOWNLOAD_INVOICE: (orderId, invoiceId) => `${baseUrl}/api/payment/Order/${orderId}/invoices/${invoiceId}/download`,

    PAY_GET_ACCOUNT_BALANCE: `${baseUrl}/api/payment/Transfer/account-balance`,
    PAY_CREATE_TRANSFER: `${baseUrl}/api/payment/Transfer`,
    PAY_CREATE_BATCH_TRANSFER: `${baseUrl}/api/payment/Transfer/batch`,
    PAY_ESTIMATE_CREDIT: `${baseUrl}/api/payment/Transfer/estimate-credit`,
    PAY_GET_TRANSFERS: `${baseUrl}/api/payment/Transfer`,
    PAY_GET_TRANSFER_DETAIL: (id) => `${baseUrl}/api/payment/Transfer/${id}`,

    WEBHOOK_SUTILITY_PAYMENT: `${baseUrl}/api/payment/webhook/sutility-payment`,
};

export const NAME_CONFIG = {

}