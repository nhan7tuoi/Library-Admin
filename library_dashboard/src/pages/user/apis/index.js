import {api} from '../../../apis/config';

export const _banUser = async (userId) => {
    const url = '/ban-user';
    return await api.post(url, {userId});
}

export const _getUsers = async (page, limit, keyword) => {
    const url = "/users";
    return await api.post(url); 
}

export const _getUserPage = async (page, limit, keyword) => {
    const url = "/users/find-user";
    return await api.post(url, {page, limit, keyword}); 
}

export const _getMajors = async () => {
    const url = '/majors';
    return await api.get(url);
}