import React, { useRef, useState } from "react";

// File icon helper
function FileIcon({ ext }: { ext: string }) {
  if (ext === "pdf") return <span className="mr-2 text-4xl">📄</span>;
  if (ext === "doc" || ext === "docx")
    return <span className="mr-2 text-4xl">📝</span>;
  return <span className="mr-2 text-4xl">📁</span>;
}

// Types
type FileItem = File;
type FolderData = {
  id: string;
  name: string;
  files: FileItem[];
};

export default function FolderSystem() {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [folderName, setFolderName] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [rootFiles, setRootFiles] = useState<FileItem[]>([]);
  const rootFileInputRef = useRef<HTMLInputElement>(null);
  const folderFileInputRef = useRef<HTMLInputElement>(null);

  function handleAddFolder() {
    const name = folderName.trim();
    if (!name) return;
    setFolders((folders) => [
      ...folders,
      { id: Date.now().toString(), name, files: [] },
    ]);
    setFolderName("");
  }

  function openFolder(id: string) {
    setActiveFolderId(id);
  }

  function handleFolderFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const filesArr = e.target.files ? Array.from(e.target.files) : [];
    setFolders((folders) =>
      folders.map((folder) =>
        folder.id === activeFolderId
          ? { ...folder, files: [...folder.files, ...filesArr] }
          : folder
      )
    );
  }

  function handleRootFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const filesArr = e.target.files ? Array.from(e.target.files) : [];
    setRootFiles((prev) => [...prev, ...filesArr]);
  }

  function openFileDialog(inFolder: boolean) {
    if (inFolder) {
      folderFileInputRef.current?.click();
    } else {
      rootFileInputRef.current?.click();
    }
  }

  function handleDeleteFile(fileIdx: number) {
    setFolders((folders) =>
      folders.map((folder) =>
        folder.id === activeFolderId
          ? {
              ...folder,
              files: folder.files.filter((_, i) => i !== fileIdx),
            }
          : folder
      )
    );
  }

  function handleDeleteRootFile(fileIdx: number) {
    setRootFiles((prev) => prev.filter((_, i) => i !== fileIdx));
  }

  function handleOpenFile(file: FileItem) {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function handleDeleteFolder(folderId: string) {
    setFolders((folders) => folders.filter((folder) => folder.id !== folderId));
    if (activeFolderId === folderId) setActiveFolderId(null);
  }

  const activeFolder: FolderData | undefined = activeFolderId
    ? folders.find((folder) => folder.id === activeFolderId)
    : undefined;

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-4xl xl:max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-100">Folders</h2>
        </div>
        {/* Add Folder */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="New folder name"
            className="px-3 py-2 rounded bg-gray-800 text-white w-full sm:w-64"
          />
          <button
            onClick={handleAddFolder}
            className="px-4 py-2 bg-green-600 text-white rounded font-bold"
          >
            Create Folder
          </button>
          <button
            onClick={() => openFileDialog(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
          >
            Upload Files
          </button>
          <input
            type="file"
            ref={rootFileInputRef}
            hidden
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleRootFilesSelected}
          />
        </div>
        {/* Root files (Unsorted) */}
        {activeFolderId == null && rootFiles.length > 0 && (
          <div>
            <div className="font-bold text-lg mb-2 text-gray-200">
              Unsorted Files
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {rootFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 rounded-lg shadow group cursor-pointer p-6 flex flex-col items-center transition hover:shadow-xl hover:bg-white/20 relative"
                  style={{ minHeight: 170 }}
                >
                  <FileIcon
                    ext={file.name.split(".").pop()?.toLowerCase() || ""}
                  />
                  <span
                    className="font-semibold text-gray-100 text-center mt-2 w-full max-w-full wrap-break-word overflow-hidden"
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      textOverflow: "ellipsis",
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span className="mt-1 text-xs text-gray-300">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                    <button
                      className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs"
                      onClick={() => handleOpenFile(file)}
                    >
                      Open
                    </button>
                    <button
                      className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                      onClick={() => handleDeleteRootFile(idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Folder Grid */}
        {activeFolderId == null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {folders.length === 0 ? (
              <div className="text-gray-400 col-span-full mx-auto text-lg">
                No folders yet.
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white/10 rounded-lg shadow p-6 flex flex-col items-center transition hover:shadow-xl hover:bg-white/20 relative cursor-pointer"
                  style={{ minHeight: 130 }}
                  onClick={() => openFolder(folder.id)}
                >
                  <span className="text-4xl mb-2">📁</span>
                  <span className="font-semibold text-gray-100 text-center w-full max-w-full wrap-break-word">
                    {folder.name}
                  </span>
                  <span className="mt-1 text-xs text-gray-300">
                    {folder.files.length} file
                    {folder.files.length !== 1 && "s"}
                  </span>
                  <button
                    className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    title="Delete folder"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        ) : !activeFolder ? (
          <div>
            <button
              className="px-3 py-2 bg-gray-400 rounded font-bold"
              onClick={() => setActiveFolderId(null)}
            >
              ← Back to Folders
            </button>
            <div className="text-red-500 mt-6">Folder not found.</div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                className="px-3 py-2 bg-gray-400 rounded font-bold"
                onClick={() => setActiveFolderId(null)}
              >
                ← Back to Folders
              </button>
              <span className="font-semibold text-lg text-gray-100">
                📁 {activeFolder.name}
              </span>
            </div>
            <div className="flex gap-4 items-center mb-4">
              <button
                onClick={() => openFileDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
              >
                Upload Files to Folder
              </button>
              <input
                type="file"
                ref={folderFileInputRef}
                hidden
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFolderFilesSelected}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activeFolder.files.length === 0 ? (
                <div className="text-gray-400 col-span-full mx-auto text-lg">
                  No files in this folder.
                </div>
              ) : (
                activeFolder.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 rounded-lg shadow group cursor-pointer p-6 flex flex-col items-center transition hover:shadow-xl hover:bg-white/20 relative"
                    style={{ minHeight: 170 }}
                  >
                    <FileIcon
                      ext={file.name.split(".").pop()?.toLowerCase() || ""}
                    />
                    <span
                      className="font-semibold text-gray-100 text-center mt-2 w-full max-w-full wrap-break-word overflow-hidden"
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        textOverflow: "ellipsis",
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span className="mt-1 text-xs text-gray-300">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                      <button
                        className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs"
                        onClick={() => handleOpenFile(file)}
                      >
                        Open
                      </button>
                      <button
                        className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                        onClick={() => handleDeleteFile(idx)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
