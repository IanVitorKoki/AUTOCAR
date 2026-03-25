import { ExternalLink, FileImage, FileText, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { buttonStyles } from '../ui/Button';
import { formatFileSize } from '../../utils/formatters';

function getAttachmentIcon(contentType = '') {
  return contentType.startsWith('image/') ? FileImage : FileText;
}

function AttachmentRow({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white p-2 text-brand-700 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

function MaintenanceAttachmentsField({
  inputId,
  helperText,
  existingAttachments,
  newFiles,
  maxFiles,
  onSelectFiles,
  onRemoveExisting,
  onRemoveNew,
}) {
  const totalFiles = existingAttachments.length + newFiles.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-dashed border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-3 text-brand-700 shadow-sm">
            <Paperclip className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Comprovantes e fotos</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{helperText}</p>
            <p className="mt-1 text-sm text-slate-500">
              {totalFiles}/{maxFiles} arquivo(s) selecionado(s)
            </p>
          </div>
        </div>

        <label htmlFor={inputId} className={buttonStyles({ variant: 'secondary' })}>
          <UploadCloud className="h-4 w-4" />
          Adicionar arquivos
        </label>
      </div>

      <input
        id={inputId}
        type="file"
        multiple
        accept="image/*,.pdf"
        className="hidden"
        onChange={onSelectFiles}
      />

      {existingAttachments.length ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Arquivos ja salvos</p>
          {existingAttachments.map((attachment) => {
            const Icon = getAttachmentIcon(attachment.contentType);

            return (
              <AttachmentRow
                key={attachment.path}
                title={attachment.name}
                subtitle={formatFileSize(attachment.size)}
                icon={Icon}
                actions={
                  <>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver
                    </a>
                    <button
                      type="button"
                      className={buttonStyles({
                        variant: 'ghost',
                        size: 'sm',
                        className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
                      })}
                      onClick={() => onRemoveExisting(attachment)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </>
                }
              />
            );
          })}
        </div>
      ) : null}

      {newFiles.length ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Arquivos prontos para upload</p>
          {newFiles.map((file, index) => {
            const Icon = getAttachmentIcon(file.type);

            return (
              <AttachmentRow
                key={`${file.name}-${index}`}
                title={file.name}
                subtitle={formatFileSize(file.size)}
                icon={Icon}
                actions={
                  <button
                    type="button"
                    className={buttonStyles({
                      variant: 'ghost',
                      size: 'sm',
                      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
                    })}
                    onClick={() => onRemoveNew(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Descartar
                  </button>
                }
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default MaintenanceAttachmentsField;

