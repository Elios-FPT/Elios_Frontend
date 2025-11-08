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
    CREATE_POST: `${baseUrl}/api/forum/posts/submit`,
    DRAFT_POST: `${baseUrl}/api/forum/posts/draft`,
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
    SUBMIT_CODE_SOLUTION: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/submissions`,
    GET_SUBMISSION_HISTORY: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/submissions`,
    GET_SUBMISSION_HISTORY_DETAIL: (submissionId) => `${baseUrl}/api/code-practices/submissions/${submissionId}`,




















    // Mock Interview API Endpoints








    




};

export const NAME_CONFIG = {

}