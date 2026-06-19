import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPath';
import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPath';

const API_BASE = process.env.REACT_APP_API_URL;

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/users`);
  return res.json();
}

const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch dashboard data' };
  }
};

const resetProgress = async () => {
  try {
    const response = await axiosInstance.post(API_PATHS.PROGRESS.RESET_PROGRESS);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset learning statistics. Please check your network and try again.' };
  }
};

const progressService = {
  getDashboardData,
  resetProgress,
};

export default progressService;


const getQuizzesForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quizzes' };
  }
};

const getQuizById = async (quizId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quiz' };
  }
};

const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), { answers });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit quiz' };
  }
};

const getQuizResults = async (quizId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch quiz results' };
  }
};

const deleteQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete quiz' };
  }
};

const quizService = {
  getQuizzesForDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
 
export default quizService;
