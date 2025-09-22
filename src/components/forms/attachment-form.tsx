"use client";

import React, { useState, useRef } from 'react';
import { Attachment } from '@/lib/types';
import { createAttachmentMetadata, removeAttachmentMetadata } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Paperclip, Link, X, Upload, FileText, Image, File } from 'lucide-react';

interface AttachmentFormProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  currentUserId: string;
  entityType: 'projects' | 'accounts' | 'opportunities';
  entityId: string;
}

export function AttachmentForm({ attachments, onAttachmentsChange, currentUserId, entityType, entityId }: AttachmentFormProps) {
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    if (newAttachmentName.trim() && newAttachmentUrl.trim()) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: newAttachmentName.trim(),
        type: 'link',
        url: newAttachmentUrl.trim(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUserId,
      };

      onAttachmentsChange([...attachments, newAttachment]);
      setNewAttachmentName('');
      setNewAttachmentUrl('');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from file
      setNewAttachmentName(file.name);
    }
  };

  const handleAddFile = async () => {
    if (selectedFile && newAttachmentName.trim()) {
      try {
        // Create attachment metadata only (no actual file upload)
        const newAttachment = await createAttachmentMetadata(
          selectedFile,
          entityType,
          entityId,
          currentUserId
        );

        // Update the attachment name if user customized it
        if (newAttachmentName.trim() !== selectedFile.name) {
          newAttachment.name = newAttachmentName.trim();
        }

        onAttachmentsChange([...attachments, newAttachment]);
        setNewAttachmentName('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error creating attachment metadata:', error);
        // Handle error (show toast, etc.)
        // You might want to show a toast notification here
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    const attachmentToRemove = attachments.find(att => att.id === attachmentId);
    if (attachmentToRemove) {
      try {
        // Remove attachment metadata (no actual file deletion needed)
        await removeAttachmentMetadata(attachmentId, entityType, entityId);
      } catch (error) {
        console.error('Error removing attachment metadata:', error);
        // Continue anyway - remove from local state even if deletion fails
      }
    }

    // Remove from local state
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-4 w-4" />;
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Attachments</Label>

      {/* Existing Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {attachment.type === 'file' ? (
                    <>
                      {getFileIcon(attachment.mimeType)}
                      <div className="flex-1">
                        <div className="font-medium text-orange-600">{attachment.name} (Metadata Only)</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(attachment.fileSize)} • {attachment.mimeType}
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          💡 File not stored - only metadata saved
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4" />
                      <div
                        className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <div className="font-medium text-blue-600">{attachment.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {attachment.url}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          🔗 Click to open link
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Attachment */}
      <Card className="p-4">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Add File (Metadata Only)
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Add Link (Full URL)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.ppt,.pptx,.xls,.xlsx"
              />
              <p className="text-xs text-amber-600 mt-1">
                💡 Only file metadata (name, size, type) will be saved. The actual file content is not stored.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachment-name">Display Name</Label>
              <Input
                id="attachment-name"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="Enter attachment name"
              />
            </div>
            <Button
              onClick={handleAddFile}
              disabled={!selectedFile || !newAttachmentName.trim()}
              className="w-full"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Add File Attachment
            </Button>
          </TabsContent>

          <TabsContent value="link" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label htmlFor="link-name">Link Name</Label>
              <Input
                id="link-name"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="Enter link name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                type="url"
              />
              <p className="text-xs text-green-600 mt-1">
                ✅ Links are fully functional - users can click to open them
              </p>
            </div>
            <Button
              onClick={handleAddLink}
              disabled={!newAttachmentName.trim() || !newAttachmentUrl.trim()}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              Add Link Attachment
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
