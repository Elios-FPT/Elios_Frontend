// elios_FE/src/api/apiConfig.js
const baseUrl = process.env.REACT_APP_DEVELOPMENT_LOCAL_API_URL;

export const API_ENDPOINTS = {
    LOGIN_PATH: 'http://oauth2.elios.com/oauth2/start?rd=http%3A%2F%2Fwww.elios.com',
    LOGOUT_PATH: 'http://oauth2.elios.com/oauth2/sign_out?rd=http%3A%2F%2Fwww.elios.com',

    GET_POSTS_FORUM: `${baseUrl}/api/v1/posts`,
    GET_POST_CONTENT: (postId) => `${baseUrl}/api/v1/posts/${postId}`,
    CREATE_POST: `${baseUrl}/api/v1/posts`,
};

export const NAME_CONFIG = {

}