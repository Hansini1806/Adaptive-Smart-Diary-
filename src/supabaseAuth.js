import { supabase } from './lib/supabaseClient.js'

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

export async function signUp({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: name.trim() },
    },
  })

  if (error) throw error
  return { needsEmailConfirmation: !data.session }
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
