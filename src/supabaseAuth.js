import { supabase } from './lib/supabaseClient.js'

const PRODUCTION_SITE_URL = 'https://adaptive-smart-diary.vercel.app'
const AUTH_CALLBACK_PATH = '/auth/callback'

function getDisplayUser(user) {
  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
  }
}

export function subscribeToAuthChanges(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(getDisplayUser(session?.user ?? null)),
  )

  return () => subscription.unsubscribe()
}

function getEmailRedirectTo() {
  const siteUrl = import.meta.env.DEV
    ? window.location.origin
    : (import.meta.env.VITE_SITE_URL || PRODUCTION_SITE_URL)

  return new URL(AUTH_CALLBACK_PATH, siteUrl).toString()
}

function getConfirmationErrorMessage(errorCode = '', description = '') {
  const errorText = `${errorCode} ${description}`.toLowerCase()
  if (
    errorText.includes('otp_expired')
    || errorText.includes('expired')
    || errorText.includes('already used')
    || errorText.includes('already been used')
    || errorText.includes('invalid token')
    || errorText.includes('flow_state_not_found')
  ) {
    return 'This confirmation link has expired or has already been used. If your email is confirmed, log in. Otherwise, enter your email and request a new confirmation email.'
  }

  return 'We could not complete email confirmation. Try logging in, or enter your email and request a new confirmation email.'
}

export async function completeAuthCallback() {
  const url = new URL(window.location.href)
  if (url.pathname !== AUTH_CALLBACK_PATH) return null

  const callbackParams = new URLSearchParams(url.search)
  new URLSearchParams(url.hash.slice(1)).forEach((value, key) => {
    if (!callbackParams.has(key)) callbackParams.set(key, value)
  })

  const errorCode = callbackParams.get('error_code') ?? callbackParams.get('error') ?? ''
  const errorDescription = callbackParams.get('error_description') ?? ''
  let result

  try {
    if (errorCode || errorDescription) {
      result = {
        status: 'error',
        message: getConfirmationErrorMessage(errorCode, errorDescription),
      }
    } else if (callbackParams.has('code')) {
      const { error } = await supabase.auth.exchangeCodeForSession(callbackParams.get('code'))
      result = error
        ? { status: 'error', message: getConfirmationErrorMessage(error.code, error.message) }
        : { status: 'success' }
    } else if (callbackParams.has('access_token') && callbackParams.has('refresh_token')) {
      const { error } = await supabase.auth.setSession({
        access_token: callbackParams.get('access_token'),
        refresh_token: callbackParams.get('refresh_token'),
      })
      result = error
        ? { status: 'error', message: getConfirmationErrorMessage(error.code, error.message) }
        : { status: 'success' }
    } else {
      result = {
        status: 'error',
        message: getConfirmationErrorMessage(),
      }
    }
  } catch (error) {
    result = {
      status: 'error',
      message: getConfirmationErrorMessage(error?.code, error?.message),
    }
  } finally {
    window.history.replaceState(window.history.state, document.title, AUTH_CALLBACK_PATH)
  }

  return result
}

export async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: getEmailRedirectTo(),
    },
  })

  if (error) throw error
  return { needsEmailConfirmation: !data.session }
}

export async function resendConfirmationEmail(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: getEmailRedirectTo() },
  })

  if (error) throw error
}

export async function logIn({ email, password }) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) throw error
}

export async function logOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
