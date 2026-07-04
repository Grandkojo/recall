import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useUploadMemory, useGetPatientMemories } from '../../hooks/useMemories';
import { MEDIA_TYPES } from '../../services/memories';
import type { MediaType } from '../../types';
import { usePatientStore } from '../../store/patientStore';
import { Card, FieldLabel, inputCls, ArrowLeftIcon } from './shared';

export function AddMemoryPage() {
  const patientId = usePatientStore((s) => s.patientId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-6 pb-12 md:px-6 md:pt-10 md:pb-16">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark">
        <ArrowLeftIcon /> Back to Dashboard
      </Link>

      <UploadCard patientId={patientId} />
      {patientId > 0 && <RecentUploads patientId={patientId} />}
    </main>
  );
}

function RecentUploads({ patientId }: { patientId: number }) {
  const { data: memories } = useGetPatientMemories(patientId);
  const recent = memories?.slice(0, 5) || [];

  if (recent.length === 0) return null;

  return (
    <Card title="Recent Uploads" className="border-primary/30 mt-2">
      <div className="flex flex-col gap-3">
        {recent.map((m) => {
          const statusBadge = m.status === 'processing' ? '🔄 Processing' : m.status === 'failed' ? '❌ Failed' : '✅ Ready';
          return (
            <div key={m.id} className="flex items-center justify-between border border-line bg-surface p-3">
              <span className="text-[13px] font-semibold text-ink">
                [{m.media_type.toUpperCase()}] {m.caption ? (m.caption.length > 40 ? m.caption.substring(0, 40) + '...' : m.caption) : `Memory #${m.id}`}
              </span>
              <span className="text-[12px] font-bold tracking-wide text-muted">{statusBadge}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function UploadCard({ patientId }: { patientId: number }) {
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const { mutate, isPending, isSuccess, isError, error, data } = useUploadMemory();

  const needsFile = mediaType !== 'text';
  let acceptAttr = '*/*';
  if (mediaType === 'photo') acceptAttr = 'image/*';
  else if (mediaType === 'voice') acceptAttr = 'audio/*';
  else if (mediaType === 'video') acceptAttr = 'video/*';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate(
      { patientId, mediaType, caption: caption || undefined, file },
      {
        onSuccess: () => {
          setCaption('');
          setFile(null);
        },
      }
    );
  };

  const disabled = isPending || patientId <= 0 || (needsFile && !file) || (!needsFile && !caption.trim()) || !!fileError;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    let maxSize = 0;
    if (mediaType === 'photo') maxSize = 5 * 1024 * 1024; // 5MB
    else if (mediaType === 'voice') maxSize = 10 * 1024 * 1024; // 10MB
    else if (mediaType === 'video') maxSize = 50 * 1024 * 1024; // 50MB

    if (maxSize > 0 && selected.size > maxSize) {
      setFileError(`File is too large. Max size for ${mediaType} is ${maxSize / (1024 * 1024)}MB.`);
      setFile(null);
      e.target.value = ''; // reset input
      return;
    }

    setFile(selected);
  };

  return (
    <Card title="Add a memory">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Media Type</FieldLabel>
          <select className={inputCls} value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)}>
            {MEDIA_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Caption or Story</FieldLabel>
          <textarea
            className={`${inputCls} h-auto py-3`}
            rows={4}
            placeholder={needsFile ? 'Describe this memory, who is in it, where it happened...' : 'Write the memory...'}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {needsFile && (
          <div className="flex flex-col gap-1.5">
            <FieldLabel>
              {mediaType === 'photo' ? 'Upload Photo' : mediaType === 'voice' ? 'Upload Audio File' : mediaType === 'video' ? 'Upload Video' : 'Upload File'}
            </FieldLabel>
            <input
              type="file"
              accept={acceptAttr}
              className="w-full cursor-pointer text-sm text-body transition-colors file:mr-4 file:border-0 file:bg-primary-soft file:px-4 file:py-2.5 file:font-semibold file:text-primary hover:file:bg-primary/20"
              onChange={handleFileChange}
            />
            {fileError && <p className="text-[13px] font-medium text-error">{fileError}</p>}
          </div>
        )}

        <Button type="submit" size="lg" disabled={disabled} className="mt-2 w-full">
          {isPending ? 'Uploading & Processing...' : 'Save memory to graph'}
        </Button>

        {patientId <= 0 && (
          <p className="text-[13px] font-medium text-muted">Please configure a patient in Settings first.</p>
        )}
        {isSuccess && data && (
          <p className="animate-rise mt-1 border border-success/40 bg-success-soft px-3 py-2.5 text-[13px] font-medium text-success">
            Memory #{data.media_id} saved! The AI is building the knowledge graph (this takes about a minute). You can check its status in Data Management.
          </p>
        )}
        {isError && (
          <p className="text-[13px] font-medium text-error">{error instanceof Error ? error.message : 'Upload failed'}</p>
        )}
      </form>
    </Card>
  );
}
