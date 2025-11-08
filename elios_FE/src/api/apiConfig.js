// elios_FE/src/api/apiConfig.js
const baseUrl = process.env.REACT_APP_DEVELOPMENT_API_URL;

export const API_ENDPOINTS = {
    LOGIN_PATH: 'http://oauth2.elios.com/oauth2/start?rd=http%3A%2F%2Fwww.elios.com%2Fforum',
    LOGOUT_PATH: 'http://oauth2.elios.com/oauth2/sign_out?rd=http%3A%2F%2Fwww.elios.com',

    // User API Endpoints
    GET_USER_PROFILE: `${baseUrl}/api/users/me/profile`,

    // CV API Endpoints
    GET_USER_CV: `${baseUrl}/api/cvbuilder/UserCvs`,
    CREATE_USER_CV: `/api/cvbuilder/UserCvs`,
    GET_USER_CV_DETAIL: (cvId) => `${baseUrl}/api/cvbuilder/UserCvs/${cvId}`,
    SAVE_DRAFT_USER_CV: (cvId) => `${baseUrl}/api/cvbuilder/UserCvs/${cvId}`,
    DELETE_USER_CV: (cvId) => `${baseUrl}/api/cvbuilder/UserCvs/${cvId}`,

    // Forum API Endpoints
    GET_POSTS_FORUM: `${baseUrl}/api/forum/posts`,
    GET_POST_CONTENT: (postId) => `${baseUrl}/api/forum/posts/${postId}`,
    CREATE_POST:`${baseUrl}/api/forum/posts`,
    DRAFT_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}`,
    SUBMIT_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}/submit`,
    CREATE_COMMENT: `${baseUrl}/api/forum/Comment`,
    UPVOTE_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}/upvote`,
    DOWNVOTE_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}/downvote`,
    GET_MY_POSTS: `${baseUrl}/api/forum/posts/my-posts`,
    GET_MY_POST_CONTENT: (postId) => `${baseUrl}/api/forum/posts/my-posts/${postId}`,
    DELETE_MY_POST: (postId) => `${baseUrl}/api/forum/posts/${postId}`,
    UPLOAD_IMAGE: `${baseUrl}/api/forum/upload`,
    GET_MY_IMAGE_POOL: `${baseUrl}/api/forum/upload/images`,
    //DELETE_IMAGE_FROM_POOL: (imageId) => `${baseUrl}/api/forum/images/${imageId}`,
    


    //Admin forum API Endpoints
    GET_PENDING_POSTS: `${baseUrl}/api/forum/moderator/posts/pending`,
    APPROVE_PENDING_POST: (postId) => `${baseUrl}/api/forum/moderator/posts/${postId}/approve`,
    REJECT_PENDING_POST: (postId) => `${baseUrl}/api/forum/moderator/posts/${postId}/reject`,
    MODERATOR_DELETE_POST: (postId) => `${baseUrl}/api/forum/moderator/posts/${postId}`,

    // Codeing Challenge API Endpoints
    GET_CODE_CHALLENGES_LIST: `${baseUrl}/api/code-practices`,
    GET_CODE_CHALLENGE_DETAIL: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}`,
    RUN_CODE_SOLUTION: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/run`,
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

};

export const NAME_CONFIG = {

}