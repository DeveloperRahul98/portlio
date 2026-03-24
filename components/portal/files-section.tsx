'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { PortalFile } from '@/lib/types'
import { Upload, File, FileImage, FileText, Download, Trash2, Loader2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

interface FilesSectionProps {
  projectId: string
  initialFiles: PortalFile[]
  accentColor: string
  portalSlug: string
  readonly?: boolean
}

function getFileIcon(type: string | null) {
  if (!type) return File
  if (type.startsWith('image/')) return FileImage
  return FileText
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FilesSection({ projectId, initialFiles, accentColor, portalSlug, readonly }: FilesSectionProps) {
  const [files, setFiles] = useState<PortalFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setUploading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    let uploadedCount = 0
    for (const file of acceptedFiles) {
      const path = `${user.id}/${portalSlug}/${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage
        .from('portal-files')
        .upload(path, file, { upsert: false })

      if (uploadErr) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const { data, error: dbError } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          storage_path: path,
          file_size: file.size,
          file_type: file.type,
        })
        .select()
        .single()

      if (!dbError && data) {
        setFiles((prev) => [data, ...prev])
        uploadedCount++
      }
    }

    if (uploadedCount > 0) {
      toast.success(
        uploadedCount === 1
          ? 'File uploaded successfully'
          : `${uploadedCount} files uploaded successfully`
      )
    }
    setUploading(false)
  }, [projectId, portalSlug])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: readonly || uploading,
    maxSize: 50 * 1024 * 1024,
  })

  const downloadFile = async (file: PortalFile) => {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('portal-files')
      .createSignedUrl(file.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const deleteFile = async (file: PortalFile) => {
    setDeletingId(file.id)
    const supabase = createClient()
    const { error } = await supabase.storage.from('portal-files').remove([file.storage_path])
    if (!error) {
      await supabase.from('files').delete().eq('id', file.id)
      setFiles(files.filter((f) => f.id !== file.id))
      toast.success('File deleted')
    } else {
      toast.error('Failed to delete file')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      {!readonly && (
        <div
          {...getRootProps()}
          className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all select-none ${
            isDragActive
              ? 'border-primary/60 bg-primary/6'
              : 'border-border/50 hover:border-primary/35 hover:bg-primary/3'
          } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            ) : (
              <Upload
                className="w-7 h-7 text-muted-foreground transition-colors"
                style={{ color: isDragActive ? accentColor : undefined }}
              />
            )}
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse · max 50MB per file</p>
            </div>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-5 h-5 opacity-50" />
          </div>
          <p className="text-sm font-medium">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {files.map((file, i) => {
              const FileIcon = getFileIcon(file.file_type)
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.03 }}
                  className="glass-card rounded-xl p-3.5 flex items-center gap-3 group hover:border-primary/20 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}22` }}
                  >
                    <FileIcon className="w-4 h-4" style={{ color: accentColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)} · {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {!readonly && (
                      <button
                        onClick={() => deleteFile(file)}
                        disabled={deletingId === file.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        {deletingId === file.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
