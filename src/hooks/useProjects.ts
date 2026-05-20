import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectFile,
  deleteProjectFile,
} from '@/lib/api/projects'
import type { Project } from '@/types/project'

// ─── Query keys ──────────────────────────────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  list: (userId: string) => ['projects', 'list', userId] as const,
  detail: (projectId: string) => ['projects', 'detail', projectId] as const,
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useProjects(userId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.list(userId ?? ''),
    queryFn: () => listProjects(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? ''),
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      projectId,
      blob,
      meta,
    }: {
      userId: string
      projectId: string
      blob: Blob
      meta: Omit<Parameters<typeof createProject>[0], 'file_path'>
    }) =>
      uploadProjectFile(userId, projectId, blob).then((filePath) =>
        createProject({ ...meta, file_path: filePath }),
      ),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(userId) })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string
      updates: Partial<Omit<Project, 'id' | 'owner_id' | 'created_at'>>
    }) => updateProject(projectId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(data.owner_id) })
      queryClient.setQueryData(projectKeys.detail(data.id), data)
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, filePath }: { projectId: string; filePath: string }) => {
      await deleteProject(projectId)
      await deleteProjectFile(filePath)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
