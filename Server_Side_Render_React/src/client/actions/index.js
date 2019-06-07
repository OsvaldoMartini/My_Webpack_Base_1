import axios from 'axios';
/**
|--------------------------------------------------
| Action Creator for List of Users
| The FETCH_USERS is NOT SERVER SIDE rendering going on here yet
| The Rendering has be done by the CLIENT SIDE FUNCTIONS
|--------------------------------------------------
*/
export const FETCH_USERS = 'fetch_users';
export const fetchUsers = () => async (dispatch, getState, api) => {
  const res = await api.get('/users');

  dispatch({
    type: FETCH_USERS,
    payload: res
  });
};

/**
|--------------------------------------------------
| FETCH_CURRENT_USER Action Creator
|--------------------------------------------------
*/
export const FETCH_CURRENT_USER = 'fetch_current_user';
export const fetchCurrentUser = () => async (dispatch, getState, api) => {
  const res = await api.get('/current_user');

  dispatch({
    type: FETCH_CURRENT_USER,
    payload: res
  });
};

/**
|--------------------------------------------------
| Asxios Instance to Request Ramdom Images
|--------------------------------------------------
*/
const axiosInstance = axios.create({
  baseUrl: 'https://api.unsplash.com',
  headers: {
    Authotization:
      'Client-ID 43d68399a648aab9b8b72502c3feddddabbc9399d2d5f0cdd2df7a284d27c64f'
  }
});

/**
|--------------------------------------------------
| Action Creator for Random Images
|--------------------------------------------------
*/
export const FETCH_IMAGES = 'fetch_images';
export const fetchImages = () => async dispatch => {
  const res = await axiosInstance.get('/search/photos', {
    params: { query: term }
  });

  dispatch({
    type: FETCH_IMAGES,
    payload: res
  });
};

/**
|--------------------------------------------------
| Action Creator for List of Admins
|--------------------------------------------------
*/
export const FETCH_ADMINS = 'fetch_admins';
export const fetchAdmins = () => async (dispatch, getState, api) => {
  const res = await api.get('/admins');

  dispatch({
    type: FETCH_ADMINS,
    payload: res
  });
};
