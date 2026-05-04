let pendingFile: File | null = null;

export function setPendingOcrFile(file: File) {
  pendingFile = file;
}

export function consumePendingOcrFile() {
  const next = pendingFile;
  pendingFile = null;
  return next;
}

export function clearPendingOcrFile() {
  pendingFile = null;
}
