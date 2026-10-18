'use client';

import { useState } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';

type Doc = {
  id: string;
  file_name: string;
  doc_type: string;
  created_at: string;
  url: string | null;
};

export function CaseDocumentsList({
  documents,
  isAr,
}: {
  documents: Doc[];
  isAr: boolean;
}) {
  const [preview, setPreview] = useState<Doc | null>(null);

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {isAr ? 'لا توجد مستندات مرفوعة لهذه القضية بعد.' : 'No documents uploaded for this case yet.'}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((d) => (
          <div key={d.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-surface/50">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate" dir="ltr">{d.file_name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {d.doc_type} · {new Date(d.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
              </div>
            </div>
            {d.url && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreview(d)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo hover:bg-indigo/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {isAr ? 'معاينة' : 'Preview'}
                </button>
                <a
                  href={d.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isAr ? 'تحميل' : 'Download'}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* In-platform PDF preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-sm truncate" dir="ltr">{preview.file_name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={preview.url!} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isAr ? 'تحميل' : 'Download'}
                </a>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                  aria-label={isAr ? 'إغلاق' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={preview.url!}
              title={preview.file_name}
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}
