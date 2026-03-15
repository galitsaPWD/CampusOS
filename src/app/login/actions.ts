'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: (formData.get('email') as string)?.trim(),
    password: (formData.get('password') as string)?.trim(),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/desktop')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: (formData.get('email') as string)?.trim(),
    password: (formData.get('password') as string)?.trim(),
  }
  const username = (formData.get('username') as string)?.trim() || "Student"

  console.log('Registering user:', data.email)
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    return { error: error.message }
  }

  // If session is null but no error, confirmation might be required
  if (!authData.session && authData.user) {
    console.log('Signup successful: Confirmation required')
    return { confirmationRequired: true }
  }

  // Initialize profile with the provided username
  if (authData.user) {
    const { initializeProfile } = await import('@/app/actions/user')
    await initializeProfile(username)
  }

  console.log('Signup successful: Redirecting...')
  revalidatePath('/', 'layout')
  redirect('/desktop')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
