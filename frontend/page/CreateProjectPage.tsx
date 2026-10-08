import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mockCharacters,
  mockFolders,
  type Character,
  type Folder,
} from '../src/mockCharacters';

type StyleId = 'cinematic' | 'realistic' | 'anime' | 'cartoon';
type AssetKind = 'image' | 'video' | 'mix';

const styles: { id: StyleId; label: string; preview: string }[] = [
  { id: 'cinematic', label: 'Кинематографический', preview: 'https://picsum.photos/seed/cinema/300/200' },
  { id: 'realistic', label: 'Реалистичный', preview: 'https://picsum.photos/seed/real/300/200' },
  { id: 'anime', label: 'Аниме', preview: 'https://picsum.photos/seed/anime/300/200' },
  { id: 'cartoon', label: 'Мультяшный', preview: 'https://picsum.photos/seed/cartoon/300/200' },
];

const sceneCountOptions = [50, 100, 150, 200];
const durationOptions = [3, 5, 8];

const assetKindOptions: { id: AssetKind; label: string; hint: string }[] = [
  { id: 'image', label: '🖼 Только картинки', hint: 'Дёшево и быстро' },
  { id: 'mix',   label: '🎬 Микс',             hint: 'Картинки + видео для ключевых сцен' },
  { id: 'video', label: '🎥 Только видео',     hint: 'Долго и дорого' },
];

type Group = {
  id: string;
  name: string;
  characters: Character[];
};

export function CreateProjectPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StyleId>('cinematic');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [sceneCount, setSceneCount] = useState(100);
  const [sceneDuration, setSceneDuration] = useState(5);
  const [assetKind, setAssetKind] = useState<AssetKind>('image');

  const selectedCharacters = useMemo(
    () => mockCharacters.filter((c) => selectedCharacterIds.includes(c.id)),
    [selectedCharacterIds]
  );

  const groups: Group[] = useMemo(() => {
    const usedIds = new Set<string>();
    const result: Group[] = [];

    mockFolders.forEach((folder: Folder) => {
      const inFolder = folder.characterIds
        .map((id) => mockCharacters.find((c) => c.id === id))
        .filter((c): c is Character => Boolean(c))
        .filter((c) => {
          if (usedIds.has(c.id)) return false;
          usedIds.add(c.id);
          return true;
        });

      if (inFolder.length > 0) {
        result.push({ id: folder.id, name: folder.name, characters: inFolder });
      }
    });

    const orphans = mockCharacters.filter((c) => !usedIds.has(c.id));
    if (orphans.length > 0) {
      result.push({ id: 'none', name: 'Без папки', characters: orphans });
    }

    return result;
  }, []);

  const toggleCharacter = (id: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeCharacter = (id: string) => {
    setSelectedCharacterIds((prev) => prev.filter((x) => x !== id));
  };

  const handleCreate = () => {
    const payload = {
      title: title.trim(),
      prompt: prompt.trim(),
      style: selectedStyle,
      characterIds: selectedCharacterIds,
      sceneCount,
      sceneDuration,
      assetKind,
    };

    // TODO: отправка на бэк → получение projectId
    // пока — сохраняем payload в sessionStorage, чтобы EditorPage мог его прочитать
    sessionStorage.setItem('newProject', JSON.stringify(payload));

    navigate('/projects/1');
  };

  const canSubmit = title.trim().length > 0 && prompt.trim().length > 0;

  return (
    <main className="create-project">
      <button
        type="button"
        className="create-project__back"
        onClick={() => navigate(-1)}
      >
        ← Назад
      </button>

      <h1 className="create-project__title">Создание нового проекта</h1>
      <p className="create-project__subtitle">
        Опишите идею — AI разобьёт её на сцены и сгенерирует визуальный контент.
      </p>

      {/* ---------- Название ---------- */}
      <div className="create-project__field">
        <label className="create-project__label">Название проекта</label>
        <input
          type="text"
          className="create-project__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="История одного человека"
          maxLength={100}
        />
        <span className="create-project__counter">{title.length}/100</span>
      </div>

      {/* ---------- Промпт ---------- */}
      <div className="create-project__field">
        <label className="create-project__label">
          Промпт — опишите, что должно быть в видео
        </label>
        <textarea
          className="create-project__textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="История о человеке, который ищет свой путь в жизни. Драма, вдохновение, красивые кадры природы и города. Финал — рассвет и надежда."
          maxLength={1000}
        />
        <span className="create-project__counter">{prompt.length}/1000</span>
      </div>

      {/* ---------- Стиль ---------- */}
      <div className="create-project__field">
        <label className="create-project__label">Стиль</label>
        <div className="create-project__styles">
          {styles.map((style) => (
            <button
              key={style.id}
              type="button"
              className={`style-card ${selectedStyle === style.id ? 'style-card--active' : ''}`}
              onClick={() => setSelectedStyle(style.id)}
            >
              <div className="style-card__preview">
                <img src={style.preview} alt={style.label} />
              </div>
              <span className="style-card__label">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Персонажи ---------- */}
      <div className="create-project__field">
        <div className="create-project__label-row">
          <label className="create-project__label">
            Персонажи (необязательно)
          </label>
          <span className="create-project__selected-count">
            Выбрано: {selectedCharacterIds.length}
          </span>
        </div>

        {selectedCharacters.length === 0 ? (
          <button
            type="button"
            className="characters-cta"
            onClick={() => setIsPickerOpen(true)}
          >
            <span className="characters-cta__icon">👥</span>
            <span className="characters-cta__label">Выбрать персонажей</span>
          </button>
        ) : (
          <div className="selected-characters">
            {selectedCharacters.map((character) => (
              <div key={character.id} className="selected-character">
                <div className="selected-character__avatar">
                  <img src={character.avatar} alt={character.name} />
                </div>
                <div className="selected-character__info">
                  <span className="selected-character__name">
                    {character.name}
                  </span>
                  <span className="selected-character__role">
                    {character.role}
                  </span>
                </div>
                <button
                  type="button"
                  className="selected-character__remove"
                  onClick={() => removeCharacter(character.id)}
                  aria-label={`Убрать ${character.name}`}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className="selected-character selected-character--add"
              onClick={() => setIsPickerOpen(true)}
            >
              <span className="selected-character__add-icon">+</span>
              <span className="selected-character__add-label">Добавить</span>
            </button>
          </div>
        )}
      </div>

      {/* ---------- Параметры генерации ---------- */}
      <div className="create-project__field">
        <label className="create-project__label">Сколько сцен</label>
        <div className="chip-row">
          {sceneCountOptions.map((count) => (
            <button
              key={count}
              type="button"
              className={`chip ${sceneCount === count ? 'chip--active' : ''}`}
              onClick={() => setSceneCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="create-project__field">
        <label className="create-project__label">
          Длительность одной сцены
        </label>
        <div className="chip-row">
          {durationOptions.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip ${sceneDuration === d ? 'chip--active' : ''}`}
              onClick={() => setSceneDuration(d)}
            >
              {d} сек
            </button>
          ))}
        </div>
      </div>

      <div className="create-project__field">
        <label className="create-project__label">Что генерировать</label>
        <div className="asset-kind-row">
          {assetKindOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`asset-kind ${assetKind === opt.id ? 'asset-kind--active' : ''}`}
              onClick={() => setAssetKind(opt.id)}
            >
              <span className="asset-kind__label">{opt.label}</span>
              <span className="asset-kind__hint">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Сводка ---------- */}
      <div className="create-project__summary">
        <div className="summary-row">
          <span>Сцен</span>
          <strong>{sceneCount}</strong>
        </div>
        <div className="summary-row">
          <span>Длительность</span>
          <strong>~{Math.round((sceneCount * sceneDuration) / 60)} мин</strong>
        </div>
        <div className="summary-row">
          <span>Тип контента</span>
          <strong>{assetKindOptions.find((o) => o.id === assetKind)?.label}</strong>
        </div>
      </div>

      {/* ---------- Footer ---------- */}
      <div className="create-project__footer">
        <button
          type="button"
          className="create-project__submit"
          onClick={handleCreate}
          disabled={!canSubmit}
        >
          Создать и сгенерировать →
        </button>
      </div>

      {/* ---------- Модалка выбора персонажей ---------- */}
      {isPickerOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="modal modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal__title">Выбор персонажей</h2>

            {groups.length === 0 ? (
              <div className="modal__empty">
                У вас пока нет персонажей.
                <button
                  type="button"
                  className="modal__btn"
                  onClick={() => navigate('/characters')}
                >
                  + Создать первого персонажа
                </button>
              </div>
            ) : (
              <div className="character-picker">
                {groups.map((group) => (
                  <div key={group.id} className="character-group">
                    <div className="character-group__title">
                      {group.id === 'none' ? '👤' : '📁'} {group.name}
                      <span className="character-group__count">
                        {group.characters.length}
                      </span>
                    </div>

                    <div className="character-picker__grid">
                      {group.characters.map((character) => {
                        const isSelected = selectedCharacterIds.includes(character.id);
                        return (
                          <button
                            key={character.id}
                            type="button"
                            className={`character-pick ${isSelected ? 'character-pick--selected' : ''}`}
                            onClick={() => toggleCharacter(character.id)}
                          >
                            <div className="character-pick__avatar">
                              <img src={character.avatar} alt={character.name} />
                              {isSelected && (
                                <span className="character-pick__check">✓</span>
                              )}
                            </div>
                            <div className="character-pick__info">
                              <span className="character-pick__name">
                                {character.name}
                              </span>
                              <span className="character-pick__role">
                                {character.role}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal__actions">
              <button
                type="button"
                className="modal__btn"
                onClick={() => setIsPickerOpen(false)}
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}