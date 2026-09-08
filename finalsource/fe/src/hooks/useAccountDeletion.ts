import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { accountService } from '../api/account.service'
import type { AccountDeletionTarget } from '../components/AccountDeletion/DeleteAccountModal'

interface AccountDeletionOptions {
  readonly onCompleted: () => void | Promise<void>
  readonly onUnavailableDismiss: () => void | Promise<void>
}

const safeMessage = (value: unknown, fallback: string): string => {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value.join(' ')
  return fallback
}

export const useAccountDeletion = ({ onCompleted, onUnavailableDismiss }: AccountDeletionOptions) => {
  const [target, setTarget] = useState<AccountDeletionTarget | null>(null)
  const [phase, setPhase] = useState<'closed' | 'confirm' | 'success'>('closed')
  const [isDeleting, setIsDeleting] = useState(false)
  const [targetUnavailable, setTargetUnavailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const requestSequence = useRef(0)
  const timerRef = useRef<number | null>(null)
  const originRef = useRef<HTMLElement | null>(null)
  const targetRef = useRef<AccountDeletionTarget | null>(null)
  const completingRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const finishSuccess = useCallback(() => {
    if (completingRef.current) return
    completingRef.current = true
    clearTimer()
    setPhase('closed')
    setTarget(null)
    targetRef.current = null
    void Promise.resolve(onCompleted()).finally(() => {
      completingRef.current = false
    })
  }, [clearTimer, onCompleted])

  useEffect(() => () => {
    requestSequence.current += 1
    requestRef.current?.abort()
    clearTimer()
  }, [clearTimer])

  const open = useCallback((nextTarget: AccountDeletionTarget, origin: HTMLElement) => {
    if (isDeleting) return
    originRef.current = origin
    targetRef.current = nextTarget
    setTarget(nextTarget)
    setError(null)
    setTargetUnavailable(false)
    setPhase('confirm')
  }, [isDeleting])

  const dismiss = useCallback(() => {
    if (isDeleting) return
    const shouldReload = targetUnavailable
    setPhase('closed')
    setTarget(null)
    targetRef.current = null
    setError(null)
    setTargetUnavailable(false)
    if (shouldReload) void onUnavailableDismiss()
    else window.setTimeout(() => originRef.current?.focus(), 0)
  }, [isDeleting, onUnavailableDismiss, targetUnavailable])

  const confirm = useCallback(async () => {
    const selected = targetRef.current
    if (isDeleting) return
    if (
      !selected ||
      !Number.isInteger(selected.id) ||
      selected.id <= 0 ||
      !selected.bankName.trim() ||
      !/^\d{4}$/.test(selected.lastFour)
    ) {
      setError('The selected account information is unavailable. Please return to Balances and try again.')
      return
    }

    const controller = new AbortController()
    const sequence = ++requestSequence.current
    requestRef.current = controller
    setError(null)
    setIsDeleting(true)
    try {
      const response = await accountService.deleteAccount(selected.id, controller.signal)
      if (sequence !== requestSequence.current || targetRef.current?.id !== selected.id) return
      if (!response.success || response.data?.deleted_account_id !== selected.id) {
        throw new Error('Malformed account-deletion response')
      }
      setPhase('success')
      timerRef.current = window.setTimeout(finishSuccess, 1500)
    } catch (requestError: unknown) {
      if (axios.isCancel(requestError) || sequence !== requestSequence.current) return
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
      if (status === 401) return
      const responseMessage = axios.isAxiosError<{ message?: string | string[] }>(requestError)
        ? requestError.response?.data?.message
        : undefined
      const fallback = status === 400
        ? 'Invalid account ID.'
        : status === 404
          ? 'The requested account could not be found.'
          : status === 409
            ? 'The operation cannot be completed due to a conflict.'
            : status === 500
              ? 'A system error occurred while processing the request.'
              : 'We could not delete this account. Please try again.'
      setError(safeMessage(responseMessage, fallback))
      if (status === 404) setTargetUnavailable(true)
      window.setTimeout(() => originRef.current?.focus(), 0)
    } finally {
      if (sequence === requestSequence.current) {
        requestRef.current = null
        setIsDeleting(false)
      }
    }
  }, [finishSuccess, isDeleting])

  return { target, phase, isDeleting, targetUnavailable, error, open, dismiss, confirm, finishSuccess }
}
