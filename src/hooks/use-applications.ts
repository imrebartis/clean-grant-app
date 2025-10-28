'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  type GrantApplication,
  type GrantApplicationFormDataType,
  type ApplicationId,
} from '@/types'

interface UseApplicationsReturn {
  applications: GrantApplication[]
  isLoading: boolean
  error: string | null
  createApplication: (data: {
    title: string
    form_data?: GrantApplicationFormDataType
  }) => Promise<GrantApplication>
  updateApplication: (
    id: ApplicationId,
    data: Partial<GrantApplication>
  ) => Promise<GrantApplication>
  deleteApplication: (id: ApplicationId) => Promise<void>
  getApplication: (id: ApplicationId) => Promise<GrantApplication>
  refreshApplications: () => Promise<void>
}

export function useApplications(): UseApplicationsReturn {
  const [applications, setApplications] = useState<GrantApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/applications')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch applications')
      }

      const data = await response.json()
      setApplications(data.applications || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching applications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createApplication = useCreateApplication(setApplications, setError)
  const updateApplication = useUpdateApplication(setApplications, setError)
  const deleteApplication = useDeleteApplication(setApplications, setError)
  const getApplication = useGetApplication(setError)

  const refreshApplications = useCallback(async () => {
    await fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  return {
    applications,
    isLoading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
    refreshApplications,
  }
}

function useCreateApplication(
  setApplications: React.Dispatch<React.SetStateAction<GrantApplication[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  return useCallback(
    async (data: {
      title: string
      form_data?: GrantApplicationFormDataType
    }): Promise<GrantApplication> => {
      try {
        setError(null)

        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            form_data: data.form_data || {},
            status: 'draft',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create application')
        }

        const result = await response.json()
        const newApplication = result.application

        setApplications((prev: GrantApplication[]) => [newApplication, ...prev])

        return newApplication
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      }
    },
    [setApplications, setError]
  )
}

function useUpdateApplication(
  setApplications: React.Dispatch<React.SetStateAction<GrantApplication[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  return useCallback(
    async (
      id: ApplicationId,
      data: Partial<GrantApplication>
    ): Promise<GrantApplication> => {
      try {
        setError(null)

        const response = await fetch(`/api/applications/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update application')
        }

        const result = await response.json()
        const updatedApplication = result.application

        setApplications((prev: GrantApplication[]) =>
          prev.map(app => (app.id === id ? updatedApplication : app))
        )

        return updatedApplication
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      }
    },
    [setApplications, setError]
  )
}

function useDeleteApplication(
  setApplications: React.Dispatch<React.SetStateAction<GrantApplication[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  return useCallback(
    async (id: ApplicationId): Promise<void> => {
      try {
        setError(null)

        const response = await fetch(`/api/applications/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete application')
        }

        setApplications((prev: GrantApplication[]) =>
          prev.filter(app => app.id !== id)
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      }
    },
    [setApplications, setError]
  )
}

function useGetApplication(
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  return useCallback(
    async (id: ApplicationId): Promise<GrantApplication> => {
      try {
        setError(null)

        const response = await fetch(`/api/applications/${id}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch application')
        }

        const result = await response.json()
        return result.application
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        throw err
      }
    },
    [setError]
  )
}
