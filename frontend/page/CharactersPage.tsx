import { useMemo, useState } from 'react';
import {
  mockCharacters,
  mockFolders,
  type Character,
  type Folder,
} from '../src/mockCharacters';

type Modal =
  | { kind: 'none' }
  | { kind: 'createFolder' }
  | { kind: 'createCharacter' }
  | { kind: 'addToFolders'; characterId: string }
  | { kind: 'renameCharacter'; characterId: string }
  | { kind: 'renameFolder'; folderId: string };

export function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>(mockCharacters);
  const [folders, setFolders] = useState<Folder[]>(mockFolders);

  const [activeFolderId, setActiveFolderId] = useState<string | 'all' | 'none'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>({ kind: 'none' });

  // -------- фильтрация --------
  const visibleCharacters = useMemo(() => {
    if (activeFolderId === 'all') return characters;

    if (activeFolderId === 'none') {
      const inAnyFolder = new Set(folders.flatMap((f) => f.characterIds));
      return characters.filter((c) => !inAnyFolder.has(c.id));
    }

    const folder = folders.find((f) => f.id === activeFolderId);
    if (!folder) return characters;
    return characters.filter((c) => folder.characterIds.includes(c.id));
  }, [activeFolderId, folders, characters]);

  const counts = {
    all: characters.length,
    none: characters.filter(
      (c) => !folders.some((f) => f.characterIds.includes(c.id))
    ).length,
  };

  // -------- папки --------
  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name,
      characterIds: [],
    };
    setFolders((prev) => [...prev, newFolder]);
    setModal({ kind: 'none' });
  };

  const handleRenameFolder = (folderId: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name } : f))
    );
    setModal({ kind: 'none' });
  };

  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (activeFolderId === id) setActiveFolderId('all');
  };

  // -------- персонажи --------
  const handleCreateCharacter = (data: {
    name: string;
    role: string;
    age: string;
  }) => {
    const newCharacter: Character = {
      id: `c${Date.now()}`,
      name: data.name,
      role: data.role,
      age: data.age,
      avatar: `https://picsum.photos/seed/${encodeURIComponent(data.name)}/300/300`,
    };
    setCharacters((prev) => [...prev, newCharacter]);
    setModal({ kind: 'none' });
  };

  const handleRenameCharacter = (characterId: string, name: string) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === characterId ? { ...c, name } : c))
    );
    setModal({ kind: 'none' });
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    setFolders((prev) =>
      prev.map((f) => ({
        ...f,
        characterIds: f.characterIds.filter((cid) => cid !== id),
      }))
    );
    setOpenMenuId(null);
  };

  // -------- в папки --------
  const toggleCharacterInFolder = (characterId: string, folderId: string) => {
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id !== folderId) return f;
        const has = f.characterIds.includes(characterId);
        return {
          ...f,
          characterIds: has
            ? f.characterIds.filter((id) => id !== characterId)
            : [...f.characterIds, characterId],
        };
      })
    );
  };

  // -------- рендер --------
  return (
    <main className="characters" onClick={() => setOpenMenuId(null)}>
      <header className="characters__header">
        <div>
          <h1 className="characters__title">Персонажи</h1>
          <p className="characters__subtitle">
            Библиотека персонажей. Объединяйте их в папки по проектам и историям.
          </p>
        </div>
        <div className="characters__header-actions">
          <button
            type="button"
            className="characters__folder-btn"
            onClick={() => setModal({ kind: 'createFolder' })}
          >
            + Папка
          </button>
          <button
            type="button"
            className="characters__add-btn"
            onClick={() => setModal({ kind: 'createCharacter' })}
          >
            + Персонаж
          </button>
        </div>
      </header>

      {/* -------- Папки -------- */}
      <section className="characters__folders">
        <div className="characters__folders-title">Папки</div>
        <div className="characters__folders-list">
          <button
            type="button"
            className={`folder-tab ${activeFolderId === 'all' ? 'folder-tab--active' : ''}`}
            onClick={() => setActiveFolderId('all')}
          >
            Все <span className="folder-tab__count">{counts.all}</span>
          </button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`folder-tab ${activeFolderId === folder.id ? 'folder-tab--active' : ''}`}
            >
              <button
                type="button"
                className="folder-tab__label"
                onClick={() => setActiveFolderId(folder.id)}
              >
                📁 {folder.name}
                <span className="folder-tab__count">{folder.characterIds.length}</span>
              </button>
              <button
                type="button"
                className="folder-tab__delete"
                onClick={() => handleDeleteFolder(folder.id)}
                aria-label={`Удалить папку ${folder.name}`}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className={`folder-tab ${activeFolderId === 'none' ? 'folder-tab--active' : ''}`}
            onClick={() => setActiveFolderId('none')}
          >
            Без папки <span className="folder-tab__count">{counts.none}</span>
          </button>
        </div>
      </section>

      {/* -------- Персонажи -------- */}
      <section className="characters__grid">
        {visibleCharacters.length === 0 ? (
          <div className="characters__empty">В этой папке пока нет персонажей</div>
        ) : (
          visibleCharacters.map((character) => (
            <article
              key={character.id}
              className="character-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="character-card__avatar">
                <img src={character.avatar} alt={character.name} />
              </div>
              <div className="character-card__info">
                <h3 className="character-card__name">{character.name}</h3>
                <p className="character-card__role">{character.role}</p>
                <p className="character-card__age">{character.age}</p>
              </div>

              {/* меню-триггер */}
              <button
                type="button"
                className="character-card__menu"
                aria-label="Меню"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId((prev) =>
                    prev === character.id ? null : character.id
                  );
                }}
              >
                ⋮
              </button>

              {/* выпадашка */}
              {openMenuId === character.id && (
                <div
                  className="character-card__dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="character-card__dropdown-item"
                    onClick={() =>
                      setModal({ kind: 'addToFolders', characterId: character.id })
                    }
                  >
                    📁 Добавить в папки
                  </button>
                  <button
                    type="button"
                    className="character-card__dropdown-item"
                    onClick={() =>
                      setModal({ kind: 'renameCharacter', characterId: character.id })
                    }
                  >
                    ✏ Переименовать
                  </button>
                  <button
                    type="button"
                    className="character-card__dropdown-item character-card__dropdown-item--danger"
                    onClick={() => handleDeleteCharacter(character.id)}
                  >
                    🗑 Удалить
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {/* ==================== Модалки ==================== */}

      {modal.kind === 'createFolder' && (
        <InputModal
          title="Новая папка"
          placeholder="Название папки"
          onClose={() => setModal({ kind: 'none' })}
          onSubmit={handleCreateFolder}
        />
      )}

      {modal.kind === 'createCharacter' && (
        <CharacterModal
          title="Новый персонаж"
          initial={{ name: '', role: '', age: '' }}
          submitLabel="Создать"
          onClose={() => setModal({ kind: 'none' })}
          onSubmit={handleCreateCharacter}
        />
      )}

      {modal.kind === 'renameCharacter' && (
        <InputModal
          title="Переименовать персонажа"
          placeholder="Новое имя"
          initialValue={
            characters.find((c) => c.id === modal.characterId)?.name ?? ''
          }
          onClose={() => setModal({ kind: 'none' })}
          onSubmit={(name) => handleRenameCharacter(modal.characterId, name)}
        />
      )}

      {modal.kind === 'addToFolders' && (
        <FolderPickerModal
          folders={folders}
          characterId={modal.characterId}
          onToggle={toggleCharacterInFolder}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
    </main>
  );
}

/* ==================== Вспомогательные модалки ==================== */

type InputModalProps = {
  title: string;
  placeholder: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

function InputModal({
  title,
  placeholder,
  initialValue = '',
  onClose,
  onSubmit,
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{title}</h2>
        <input
          type="text"
          className="modal__input"
          placeholder={placeholder}
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onClose();
          }}
        />
        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className="modal__btn"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

type CharacterModalProps = {
  title: string;
  initial: { name: string; role: string; age: string };
  submitLabel: string;
  onClose: () => void;
  onSubmit: (data: { name: string; role: string; age: string }) => void;
};

function CharacterModal({
  title,
  initial,
  submitLabel,
  onClose,
  onSubmit,
}: CharacterModalProps) {
  const [name, setName] = useState(initial.name);
  const [role, setRole] = useState(initial.role);
  const [age, setAge] = useState(initial.age);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), role: role.trim(), age: age.trim() });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{title}</h2>

        <input
          type="text"
          className="modal__input"
          placeholder="Имя"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="modal__input"
          placeholder="Роль (например, Главный герой)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <input
          type="text"
          className="modal__input"
          placeholder="Возраст (например, 28 лет)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onClose();
          }}
        />

        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className="modal__btn"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type FolderPickerModalProps = {
  folders: Folder[];
  characterId: string;
  onToggle: (characterId: string, folderId: string) => void;
  onClose: () => void;
};

function FolderPickerModal({
  folders,
  characterId,
  onToggle,
  onClose,
}: FolderPickerModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Добавить в папки</h2>

        {folders.length === 0 ? (
          <p className="modal__empty">У вас пока нет папок</p>
        ) : (
          <div className="folder-picker">
            {folders.map((folder) => {
              const checked = folder.characterIds.includes(characterId);
              return (
                <label key={folder.id} className="folder-picker__item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(characterId, folder.id)}
                  />
                  <span className="folder-picker__name">📁 {folder.name}</span>
                </label>
              );
            })}
          </div>
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn"
            onClick={onClose}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}