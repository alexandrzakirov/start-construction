/**
 * Supabase Client Module
 * Initializes and exports Supabase client for database and storage operations
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check .env file.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - Bucket name (e.g., 'vault')
 * @param {string} path - File path in bucket
 * @param {File} file - File object to upload
 * @returns {Promise<{data, error}>}
 */
export async function uploadFile(bucket, path, file) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`Error uploading to ${bucket}/${path}:`, error)
    return { data: null, error }
  }
}

/**
 * Download a file from Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<Blob>}
 */
export async function downloadFile(bucket, path) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error downloading from ${bucket}/${path}:`, error)
    throw error
  }
}

/**
 * List files in Supabase Storage bucket
 * @param {string} bucket - Bucket name
 * @param {string} path - Directory path (optional)
 * @returns {Promise<Array>}
 */
export async function listFiles(bucket, path = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error listing files in ${bucket}/${path}:`, error)
    return []
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<{error}>}
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error(`Error deleting ${bucket}/${path}:`, error)
    return { error }
  }
}

/**
 * Get public URL for a file in Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} path - File path in bucket
 * @returns {string}
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || ''
}

export default supabase
