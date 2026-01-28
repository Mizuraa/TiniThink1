import React, { useRef, useState } from "react";

function FileIcon({ ext }: { ext: string }) {
  if (ext === "pdf") return <span className="text-3xl sm:text-4xl">📄</span>;
  if (ext === "doc" || ext === "docx")
    return <span className="text-3xl sm:text-4xl">📝</span>;
  return <span className="text-3xl sm:text-4xl">📃</span>;
}

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
          : folder,
      ),
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
          : folder,
      ),
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pixel-font { font-family: 'Press Start 2P', cursive; }
        .pixel-box { border-radius: 0; }
        .pixel-shadow { box-shadow: 4px 4px 0 rgba(139, 92, 246, 0.4), 6px 6px 0 rgba(88, 28, 135, 0.2); }
        input::placeholder { font-family: 'Press Start 2P', cursive; font-size: 0.5rem; }
        @media (min-width: 640px) { input::placeholder { font-size: 0.6rem; } }
      `}</style>

      <div className="w-full max-w-4xl xl:max-w-5xl">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl pixel-font text-purple-300">
            FOLDERS
          </h2>
        </div>

        {/* Add Folder Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="NEW FOLDER NAME"
            className="flex-1 px-3 py-2 pixel-box bg-purple-950/50 border-2 sm:border-4 border-purple-500 text-white pixel-font text-[10px] sm:text-sm focus:outline-none"
          />
          <button
            onClick={handleAddFolder}
            className="px-3 sm:px-4 py-2 bg-green-600 active:bg-green-500 text-white border-2 sm:border-4 border-green-400 pixel-box pixel-font text-[10px] sm:text-xs whitespace-nowrap"
          >
            ► CREATE
          </button>
          <button
            onClick={() => openFileDialog(false)}
            className="px-3 sm:px-4 py-2 bg-cyan-600 active:bg-cyan-500 text-white border-2 sm:border-4 border-cyan-400 pixel-box pixel-font text-[10px] sm:text-xs whitespace-nowrap"
          >
            ► UPLOAD
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

        {/* Root Files (Unsorted) */}
        {activeFolderId == null && rootFiles.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="pixel-font text-sm sm:text-base text-purple-300 mb-3 sm:mb-4">
              UNSORTED FILES
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {rootFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 p-3 sm:p-4 flex flex-col items-center pixel-shadow group relative cursor-pointer"
                  style={{ minHeight: 150 }}
                >
                  <FileIcon
                    ext={file.name.split(".").pop()?.toLowerCase() || ""}
                  />
                  <span
                    className="pixel-font text-purple-200 text-center mt-2 text-[8px] sm:text-[10px] break-words w-full"
                    title={file.name}
                  >
                    {file.name.length > 20
                      ? file.name.substring(0, 17) + "..."
                      : file.name}
                  </span>
                  <span className="mt-1 text-[8px] sm:text-[9px] pixel-font text-purple-400">
                    {(file.size / 1024).toFixed(1)}KB
                  </span>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 sm:opacity-100 flex flex-col gap-1">
                    <button
                      className="px-2 py-1 bg-cyan-600 border-2 border-cyan-400 text-white pixel-box pixel-font text-[8px]"
                      onClick={() => handleOpenFile(file)}
                    >
                      OPEN
                    </button>
                    <button
                      className="px-2 py-1 bg-red-600 border-2 border-red-400 text-white pixel-box pixel-font text-[8px]"
                      onClick={() => handleDeleteRootFile(idx)}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Folder Grid */}
        {activeFolderId == null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {folders.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12">
                <div className="pixel-font text-purple-400 text-xs sm:text-sm">
                  NO FOLDERS YET
                </div>
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 p-4 sm:p-6 flex flex-col items-center pixel-shadow relative cursor-pointer group"
                  style={{ minHeight: 120 }}
                  onClick={() => openFolder(folder.id)}
                >
                  <span className="text-4xl sm:text-5xl mb-2">📁</span>
                  <span className="pixel-font text-purple-200 text-center text-[9px] sm:text-[10px] break-words w-full">
                    {folder.name}
                  </span>
                  <span className="mt-1 text-[8px] sm:text-[9px] pixel-font text-purple-400">
                    {folder.files.length} FILE{folder.files.length !== 1 && "S"}
                  </span>
                  <button
                    className="absolute top-1 right-1 px-2 py-1 bg-red-600 border-2 border-red-400 text-white pixel-box pixel-font text-[8px] opacity-0 group-hover:opacity-100 sm:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                  >
                    DEL
                  </button>
                </div>
              ))
            )}
          </div>
        ) : !activeFolder ? (
          <div>
            <button
              className="px-3 py-2 bg-purple-700 border-2 border-purple-500 pixel-box pixel-font text-[10px] sm:text-xs text-purple-200"
              onClick={() => setActiveFolderId(null)}
            >
              ← BACK
            </button>
            <div className="text-red-400 mt-6 pixel-font text-xs sm:text-sm">
              FOLDER NOT FOUND
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <button
                className="px-3 py-2 bg-purple-700 active:bg-purple-600 border-2 sm:border-4 border-purple-500 pixel-box pixel-font text-[10px] sm:text-xs text-purple-200"
                onClick={() => setActiveFolderId(null)}
              >
                ← BACK
              </button>
              <span className="pixel-font text-sm sm:text-base text-purple-300">
                📁 {activeFolder.name}
              </span>
            </div>
            <div className="flex gap-3 items-center mb-4">
              <button
                onClick={() => openFileDialog(true)}
                className="px-3 sm:px-4 py-2 bg-cyan-600 active:bg-cyan-500 text-white border-2 sm:border-4 border-cyan-400 pixel-box pixel-font text-[10px] sm:text-xs"
              >
                ► UPLOAD FILES
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {activeFolder.files.length === 0 ? (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <div className="pixel-font text-purple-400 text-xs sm:text-sm">
                    NO FILES IN FOLDER
                  </div>
                </div>
              ) : (
                activeFolder.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-purple-950/80 pixel-box border-2 sm:border-4 border-purple-500 p-3 sm:p-4 flex flex-col items-center pixel-shadow group relative"
                    style={{ minHeight: 150 }}
                  >
                    <FileIcon
                      ext={file.name.split(".").pop()?.toLowerCase() || ""}
                    />
                    <span
                      className="pixel-font text-purple-200 text-center mt-2 text-[8px] sm:text-[10px] break-words w-full"
                      title={file.name}
                    >
                      {file.name.length > 20
                        ? file.name.substring(0, 17) + "..."
                        : file.name}
                    </span>
                    <span className="mt-1 text-[8px] sm:text-[9px] pixel-font text-purple-400">
                      {(file.size / 1024).toFixed(1)}KB
                    </span>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 sm:opacity-100 flex flex-col gap-1">
                      <button
                        className="px-2 py-1 bg-cyan-600 border-2 border-cyan-400 text-white pixel-box pixel-font text-[8px]"
                        onClick={() => handleOpenFile(file)}
                      >
                        OPEN
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 border-2 border-red-400 text-white pixel-box pixel-font text-[8px]"
                        onClick={() => handleDeleteFile(idx)}
                      >
                        DEL
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
