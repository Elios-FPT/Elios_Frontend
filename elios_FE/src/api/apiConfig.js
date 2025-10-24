// elios_FE/src/api/apiConfig.js
const baseUrl =  process.env.REACT_APP_DEVELOPMENT_LOCAL_API_URL;

export const API_ENDPOINTS = {
GET_POSTS_FORUM: `${baseUrl}/api/v1/posts`,
GET_POST_CONTENT: (postId) => `${baseUrl}/api/v1/posts/${postId}`,
CREATE_POST: `${baseUrl}/api/v1/posts`,
};

export const NAME_CONFIG = {

}