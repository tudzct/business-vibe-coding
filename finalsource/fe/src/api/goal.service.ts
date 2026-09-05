import axiosInstance from './axiosInstance'
import type {
  ApiResponse,
  CreateGoalRequest,
  CreateGoalResult,
  Goal,
  GoalListResult,
  UpdateGoalRequest,
  UpdateGoalResult,
} from './types'

export const goalService = {
  // Lấy danh sách mục tiêu của user
  getGoals: async (signal?: AbortSignal): Promise<ApiResponse<GoalListResult>> => {
    const response = await axiosInstance.get<ApiResponse<GoalListResult>>('/v1/goals', { signal })
    return response.data
  },

  // Lấy chi tiết một mục tiêu
  getGoal: async (goalId: number): Promise<ApiResponse<Goal>> => {
    const response = await axiosInstance.get(`/goals/${goalId}`)
    return response.data
  },

  // Tạo mục tiêu mới
  createGoal: async (
    data: CreateGoalRequest,
    signal?: AbortSignal,
  ): Promise<ApiResponse<CreateGoalResult>> => {
    const response = await axiosInstance.post<ApiResponse<CreateGoalResult>>('/v1/goals', data, {
      signal,
    })
    return response.data
  },

  // Cập nhật mục tiêu
  updateGoal: async (
    goalId: number,
    data: UpdateGoalRequest,
    signal?: AbortSignal,
  ): Promise<ApiResponse<UpdateGoalResult>> => {
    const response = await axiosInstance.put<ApiResponse<UpdateGoalResult>>(
      `/v1/goals/${goalId}`,
      data,
      { signal },
    )
    return response.data
  },

  // Xóa mục tiêu
  deleteGoal: async (goalId: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/goals/${goalId}`)
    return response.data
  },
}
