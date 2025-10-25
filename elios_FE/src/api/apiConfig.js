// elios_FE/src/api/apiConfig.js
const baseUrl = process.env.REACT_APP_DEVELOPMENT_API_URL;

export const API_ENDPOINTS = {
    LOGIN_PATH: 'http://oauth2.elios.com/oauth2/start?rd=http%3A%2F%2Fwww.elios.com',
    LOGOUT_PATH: 'http://oauth2.elios.com/oauth2/sign_out?rd=http%3A%2F%2Fwww.elios.com',

    // Forum API Endpoints
    GET_POSTS_FORUM: `${baseUrl}/api/v1/posts`,
    GET_POST_CONTENT: (postId) => `${baseUrl}/api/v1/posts/${postId}`,
    CREATE_POST: `${baseUrl}/api/v1/posts`,

    // Codeing Challenge API Endpoints
    GET_CODE_CHALLENGES_LIST: `${baseUrl}/api/code-practices`,
    GET_CODE_CHALLENGE_DETAIL: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}`,
    SUBMIT_CODE_SOLUTION: (codePracticeId) => `${baseUrl}/api/code-practices/${codePracticeId}/submissions`,
};

export const NAME_CONFIG = {

}