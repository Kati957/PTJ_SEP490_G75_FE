import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import applyJobService from '../services'
import type { JobApplicationResultDto } from '../type'
import { getCompanyLogoSrc, getJobDetailCached } from '../../../utils/jobPostHelpers'

// Định nghĩa kiểu cho trạng thái của slice
interface AppliedJobsState {
  jobs: JobApplicationResultDto[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

// Trạng thái khởi tạo
const initialState: AppliedJobsState = {
  jobs: [],
  status: 'idle',
  error: null
}

// Async thunk để lấy danh sách công việc đã ứng tuyển
export const fetchAppliedJobs = createAsyncThunk(
  'appliedJobs/fetchAppliedJobs',
  async (jobSeekerId: number, { rejectWithValue }) => {
    try {
      const response = await applyJobService.getAppliedJobsBySeeker(jobSeekerId)
      const jobsWithLogos: JobApplicationResultDto[] = await Promise.all(
        response.data.map(async (job) => {
          const detail = await getJobDetailCached(job.employerPostId.toString())
          return {
            ...job,
            companyLogo: getCompanyLogoSrc(detail?.companyLogo)
          }
        })
      )
      return jobsWithLogos
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Async thunk để rút đơn ứng tuyển
export const withdrawApplication = createAsyncThunk(
  'appliedJobs/withdrawApplication',
  async ({ jobSeekerId, employerPostId }: { jobSeekerId: number; employerPostId: number }, { rejectWithValue }) => {
    try {
      await applyJobService.withdrawApplication(jobSeekerId, employerPostId)
      return employerPostId
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Unknown error')
    }
  }
)

const appliedJobsSlice = createSlice({
  name: 'appliedJobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppliedJobs.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAppliedJobs.fulfilled, (state, action: PayloadAction<JobApplicationResultDto[]>) => {
        state.status = 'succeeded'
        state.jobs = action.payload
      })
      .addCase(fetchAppliedJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(withdrawApplication.fulfilled, (state, action: PayloadAction<number>) => {
        const withdrawnPostId = action.payload
        const jobIndex = state.jobs.findIndex((job) => job.employerPostId === withdrawnPostId)
        if (jobIndex !== -1) {
          // Cập nhật trạng thái của công việc thành 'withdraw'
          state.jobs[jobIndex].status = 'withdraw'
        }
      })
  }
})

export default appliedJobsSlice.reducer
