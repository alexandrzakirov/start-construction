/**
 * Vault Storage Module
 * Handles file uploads, downloads, and management for the Vault
 * Migrates from localStorage to Supabase Storage
 */

import { 
  supabase, 
  uploadFile, 
  downloadFile, 
  listFiles, 
  deleteFile, 
  getPublicUrl 
} from './supabase.js'

const VAULT_BUCKET = 'vault'

/**
 * Upload a file to the Vault
 * @param {File} file - File object from input
 * @param {string} category - Document category
 * @returns {Promise<{success, fileId, error}>}
 */
export async function uploadToVault(file, category = 'General') {
  try {
    const fileName = file.name
    const fileSize = file.size
    const timestamp = new Date().getTime()
    const filePath = `${category}/${timestamp}-${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await uploadFile(VAULT_BUCKET, filePath, file)
    
    if (error) throw error

    // Save metadata to documents table
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([
        {
          name: fileName,
          category: category,
          path: filePath,
          file_size: fileSize,
          type: file.type,
        }
      ])
      .select()

    if (docError) throw docError

    return {
      success: true,
      fileId: docData[0].id,
      fileName: fileName,
      path: filePath,
      error: null
    }
  } catch (error) {
    console.error('Error uploading to vault:', error)
    return {
      success: false,
      fileId: null,
      error: error.message
    }
  }
}

/**
 * Download a file from the Vault
 * @param {string} filePath - File path in bucket
 * @returns {Promise<Blob>}
 */
export async function downloadFromVault(filePath) {
  try {
    const blob = await downloadFile(VAULT_BUCKET, filePath)
    return blob
  } catch (error) {
    console.error('Error downloading from vault:', error)
    throw error
  }
}

/**
 * Get all documents from vault
 * @param {string} category - Filter by category (optional)
 * @returns {Promise<Array>}
 */
export async function getVaultDocuments(category = null) {
  try {
    let query = supabase.from('documents').select('*')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching vault documents:', error)
    return []
  }
}

/**
 * Delete a file from the Vault
 * @param {string} fileId - Document ID from database
 * @param {string} filePath - File path in storage
 * @returns {Promise<{success, error}>}
 */
export async function deleteFromVault(fileId, filePath) {
  try {
    // Delete from storage
    const { error: storageError } = await deleteFile(VAULT_BUCKET, filePath)
    if (storageError) throw storageError

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', fileId)

    if (dbError) throw dbError

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting from vault:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get a public URL for a file (for sharing)
 * @param {string} filePath - File path in bucket
 * @returns {string}
 */
export function getVaultFileUrl(filePath) {
  return getPublicUrl(VAULT_BUCKET, filePath)
}

/**
 * Migrate localStorage vault data to Supabase
 * Reads old VAULT_KEY from localStorage and uploads all files
 * @returns {Promise<{migrated, failed, errors}>}
 */
export async function migrateFromLocalStorage() {
  try {
    const vaultData = localStorage.getItem('VAULT_KEY')
    if (!vaultData) {
      return {
        migrated: 0,
        failed: 0,
        errors: ['No vault data found in localStorage']
      }
    }

    const vault = JSON.parse(vaultData)
    const errors = []
    let migratedCount = 0
    let failedCount = 0

    // For each file in localStorage vault
    for (const [fileId, fileData] of Object.entries(vault)) {
      try {
        // Reconstruct file from base64 or other format
        if (fileData.base64) {
          const bytes = atob(fileData.base64)
          const arr = new Uint8Array(bytes.length)
          for (let i = 0; i < bytes.length; i++) {
            arr[i] = bytes.charCodeAt(i)
          }
          const blob = new Blob([arr], { type: fileData.type })
          const file = new File([blob], fileData.name || 'file', { type: fileData.type })

          // Upload to Supabase
          const result = await uploadToVault(file, fileData.category || 'Migrated')
          
          if (result.success) {
            migratedCount++
          } else {
            failedCount++
            errors.push(`Failed to migrate ${fileData.name}: ${result.error}`)
          }
        } else {
          failedCount++
          errors.push(`Unsupported format for ${fileData.name}`)
        }
      } catch (error) {
        failedCount++
        errors.push(`Error migrating file: ${error.message}`)
      }
    }

    return {
      migrated: migratedCount,
      failed: failedCount,
      errors: errors
    }
  } catch (error) {
    console.error('Error during migration:', error)
    return {
      migrated: 0,
      failed: 0,
      errors: [error.message]
    }
  }
}

export default {
  uploadToVault,
  downloadFromVault,
  getVaultDocuments,
  deleteFromVault,
  getVaultFileUrl,
  migrateFromLocalStorage
}
