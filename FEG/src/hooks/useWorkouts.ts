/**
 * TanStack Query hooks for the Workout & Fitness Tracking module.
 * Provides queries and mutations for exercises, workouts, sets, measurements,
 * personal records, progress, wearables, goals, and social posts.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type {
  Exercise, Workout, WorkoutExercise, WorkoutSet, BodyMeasurement,
  WearableDevice, WorkoutGoal, WorkoutPost,
  ProgressResponse, RecordType,
} from '@/types';

// ===========================================================================
// Exercise Library
// ===========================================================================
export interface ExerciseParams {
  search?: string; category?: string; muscle?: string;
  difficulty?: string; bookmarked?: boolean; page?: number; page_size?: number;
}

export function useExercises(params?: ExerciseParams) {
  return useQuery({
    queryKey: ['exercises', params],
    queryFn: () => workoutsApi.getExercises(params),
  });
}

export function useExercise(id: number | undefined) {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => workoutsApi.getExercise(id as number),
    enabled: !!id,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.toggleBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Exercise>) => workoutsApi.createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise added');
    },
    onError: () => toast.error('Failed to add exercise'),
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Exercise> }) =>
      workoutsApi.updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise updated');
    },
    onError: () => toast.error('Failed to update exercise'),
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise deleted');
    },
    onError: () => toast.error('Failed to delete exercise'),
  });
}

// ===========================================================================
// Workouts
// ===========================================================================
export interface WorkoutParams {
  search?: string; status?: string; workout_type?: string;
  date_from?: string; date_to?: string; page?: number; page_size?: number;
}

export function useWorkouts(params?: WorkoutParams) {
  return useQuery({
    queryKey: ['workouts', params],
    queryFn: () => workoutsApi.getWorkouts(params),
  });
}

export function useWorkout(id: number | undefined) {
  return useQuery({
    queryKey: ['workouts', id],
    queryFn: () => workoutsApi.getWorkout(id as number),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Workout>) => workoutsApi.createWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout created successfully');
    },
    onError: () => toast.error('Failed to create workout'),
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Workout> }) =>
      workoutsApi.updateWorkout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout updated successfully');
    },
    onError: () => toast.error('Failed to update workout'),
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout deleted');
    },
    onError: () => toast.error('Failed to delete workout'),
  });
}

export function useCompleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.completeWorkout(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['personal-records'] });
      const count = data?.data?.new_records?.length ?? 0;
      if (count > 0) {
        toast.success(`Workout completed! ${count} new personal record${count > 1 ? 's' : ''} 🎉`);
      } else {
        toast.success('Workout completed successfully');
      }
    },
    onError: () => toast.error('Failed to complete workout'),
  });
}

// ===========================================================================
// Workout Exercises & Sets
// ===========================================================================
export function useAddWorkoutExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkoutExercise>) => workoutsApi.addWorkoutExercise(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      if (variables.workout) queryClient.invalidateQueries({ queryKey: ['workouts', variables.workout] });
    },
    onError: () => toast.error('Failed to add exercise'),
  });
}

export function useDeleteWorkoutExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deleteWorkoutExercise(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    onError: () => toast.error('Failed to remove exercise'),
  });
}

export function useAddSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkoutSet>) => workoutsApi.addSet(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    onError: () => toast.error('Failed to add set'),
  });
}

export function useUpdateSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkoutSet> }) =>
      workoutsApi.updateSet(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
    onError: () => toast.error('Failed to update set'),
  });
}

export function useDeleteSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deleteSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: () => toast.error('Failed to delete set'),
  });
}

// ===========================================================================
// Body Measurements
// ===========================================================================
export function useMeasurements(params?: { date_from?: string; date_to?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['measurements', params],
    queryFn: () => workoutsApi.getMeasurements(params),
  });
}

export function useCreateMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BodyMeasurement>) => workoutsApi.createMeasurement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      toast.success('Measurement recorded');
    },
    onError: () => toast.error('Failed to save measurement'),
  });
}

export function useDeleteMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: () => toast.error('Failed to delete measurement'),
  });
}

// ===========================================================================
// Personal Records
// ===========================================================================
export function usePersonalRecords(params?: { record_type?: RecordType; page_size?: number }) {
  return useQuery({
    queryKey: ['personal-records', params],
    queryFn: () => workoutsApi.getPersonalRecords(params),
  });
}

// ===========================================================================
// Progress
// ===========================================================================
export interface ProgressParams {
  metric?: string; grouping?: string; range?: string;
}

export function useProgress(params?: ProgressParams) {
  return useQuery({
    queryKey: ['progress', params],
    queryFn: () => workoutsApi.getProgress(params),
  });
}

// ===========================================================================
// Wearables
// ===========================================================================
export function useWearableDevices() {
  return useQuery({
    queryKey: ['wearable-devices'],
    queryFn: () => workoutsApi.getWearableDevices(),
  });
}

export function useWearableData(params?: { date_from?: string }) {
  return useQuery({
    queryKey: ['wearable-data', params],
    queryFn: () => workoutsApi.getWearableData(params),
  });
}

export function useConnectWearable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WearableDevice>) => workoutsApi.connectWearable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearable-devices'] });
      toast.success('Wearable device connected');
    },
    onError: () => toast.error('Failed to connect device'),
  });
}

export function useDisconnectWearable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.disconnectWearable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearable-devices'] });
      toast.success('Device disconnected');
    },
    onError: () => toast.error('Failed to disconnect device'),
  });
}

// ===========================================================================
// Goals
// ===========================================================================
export function useGoals(params?: { status?: string }) {
  return useQuery({
    queryKey: ['goals', params],
    queryFn: () => workoutsApi.getGoals(params),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkoutGoal>) => workoutsApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created');
    },
    onError: () => toast.error('Failed to create goal'),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkoutGoal> }) =>
      workoutsApi.updateGoal(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
    onError: () => toast.error('Failed to update goal'),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
    onError: () => toast.error('Failed to delete goal'),
  });
}

// ===========================================================================
// Social / Posts
// ===========================================================================
export function usePosts(params?: { page?: number }) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => workoutsApi.getPosts(params),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkoutPost>) => workoutsApi.createPost(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    onError: () => toast.error('Failed to create post'),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.deletePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    onError: () => toast.error('Failed to delete post'),
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.likePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      workoutsApi.addComment(id, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
    onError: () => toast.error('Failed to add comment'),
  });
}

// ===========================================================================
// Progress helper - typed wrapper for direct React usage
// ===========================================================================
export type { ProgressResponse };
