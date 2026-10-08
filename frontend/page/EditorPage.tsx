import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type SceneStatus = 'empty' | 'pending' | 'generating' | 'done' | 'failed';
type AssetKind = 'image' | 'video' | null;
type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '4:3';

type Scene = {
  id: string;
  index: number;
  title: string;
  script: string;
  visualPrompt: string;
  duration: number;
  status: SceneStatus;
  assetKind: AssetKind;
  assetUrl: string | null;
  progress: number;
};

type NewProjectPayload = {
  title: string;
  prompt: string;
  style: string;
  characterIds: string[];
  sceneCount: number;
  sceneDuration: number;
  assetKind: 'image' | 'video' | 'mix';
};

const FALLBACK_PROJECT: NewProjectPayload = {
  title: 'Новый проект',
  prompt: 'Не указан',
  style: 'cinematic',
  characterIds: [],
  sceneCount: 30,
  sceneDuration: 5,
  assetKind: 'image',
};

const SCENE_TITLES = [
  'Пролог', 'Пробуждение', 'Утро', 'Дорога', 'Встреча', 'Разговор',
  'Воспоминание', 'Город', 'Одиночество', 'Решение', 'Путь', 'Рассвет',
  'Финал', 'Эпилог', 'Тишина', 'Дождь', 'Окно', 'Тени', 'Свет',
];

const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:5', '4:3'];

const RATIO_HINTS: Record<AspectRatio, string> = {
  '16:9': 'YouTube, десктоп',
  '9:16': 'TikTok, Reels, Shorts',
  '1:1': 'Instagram пост',
  '4:5': 'Instagram лента',
  '4:3': 'Классический ТВ',
};

function buildMockScenes(payload: NewProjectPayload): Scene[] {
  const count = payload.sceneCount;
  const scenes: Scene[] = [];

  for (let i = 0; i < count; i++) {
    scenes.push({
      id: `s${i + 1}`,
      index: i + 1,
      title: `${SCENE_TITLES[i % SCENE_TITLES.length]} ${i + 1}`,
      script: `Сцена ${i + 1}. ${payload.prompt.slice(0, 80)}...`,
      visualPrompt: `${payload.style}, scene ${i + 1}, cinematic lighting`,
      duration: payload.sceneDuration,
      status: 'empty',
      assetKind: null,
      assetUrl: null,
      progress: 0,
    });
  }

  return scenes;
}

type Filter = 'all' | 'empty' | 'done' | 'failed';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const payload: NewProjectPayload = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('newProject');
      if (!raw) return FALLBACK_PROJECT;
      return { ...FALLBACK_PROJECT, ...JSON.parse(raw) };
    } catch {
      return FALLBACK_PROJECT;
    }
  }, []);

  const [scenes, setScenes] = useState<Scene[]>(() => buildMockScenes(payload));
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0]?.id ?? '');
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  const runningRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];

  const counts = useMemo(() => {
    return {
      total: scenes.length,
      done: scenes.filter((s) => s.status === 'done').length,
      generating: scenes.filter((s) => s.status === 'generating').length,
      failed: scenes.filter((s) => s.status === 'failed').length,
      empty: scenes.filter((s) => s.status === 'empty' || s.status === 'pending').length,
    };
  }, [scenes]);

  const progressPercent =
    counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);

  const visibleScenes = useMemo(() => {
    if (filter === 'all') return scenes;
    if (filter === 'empty') return scenes.filter((s) => s.status === 'empty' || s.status === 'pending');
    if (filter === 'done') return scenes.filter((s) => s.status === 'done');
    if (filter === 'failed') return scenes.filter((s) => s.status === 'failed');
    return scenes;
  }, [scenes, filter]);

  const generateScene = (sceneId: string, kind: 'image' | 'video') => {
    setScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId ? { ...s, status: 'generating', progress: 0, assetKind: kind } : s
      )
    );

    const durationMs = kind === 'image' ? 1500 + Math.random() * 1500 : 3000 + Math.random() * 3000;
    const steps = 10;
    const stepMs = durationMs / steps;

    for (let i = 1; i <= steps; i++) {
      const t = window.setTimeout(() => {
        setScenes((prev) =>
          prev.map((s) =>
            s.id === sceneId ? { ...s, progress: Math.min(100, i * (100 / steps)) } : s
          )
        );
      }, stepMs * i);
      timersRef.current.push(t);
    }

    const finish = window.setTimeout(() => {
      const willFail = Math.random() < 0.05;
      const seed = `${sceneId}-${Date.now()}`;

      setScenes((prev) =>
        prev.map((s) => {
          if (s.id !== sceneId) return s;
          if (willFail) return { ...s, status: 'failed', progress: 0 };
          if (kind === 'image') {
            return {
              ...s,
              status: 'done',
              progress: 100,
              assetKind: 'image',
              assetUrl: `https://picsum.photos/seed/${seed}/640/360`,
            };
          }
          return {
            ...s,
            status: 'done',
            progress: 100,
            assetKind: 'video',
            assetUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          };
        })
      );
    }, durationMs + 100);

    timersRef.current.push(finish);
  };

  const runQueue = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);

    const queue = scenes.filter((s) => s.status === 'empty' || s.status === 'pending');

    const runNext = (i: number) => {
      if (!runningRef.current || i >= queue.length) {
        runningRef.current = false;
        setIsRunning(false);
        return;
      }

      const scene = queue[i];
      const isVideo =
        payload.assetKind === 'video' ||
        (payload.assetKind === 'mix' && i % 3 === 0);

      generateScene(scene.id, isVideo ? 'video' : 'image');

      const delay = isVideo ? 4500 : 2500;
      const t = window.setTimeout(() => runNext(i + 1), delay);
      timersRef.current.push(t);
    };

    runNext(0);
  };

  const stopQueue = () => {
    runningRef.current = false;
    setIsRunning(false);
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const regenerateScene = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const kind = scene.assetKind === 'video' ? 'video' : 'image';
    generateScene(sceneId, kind);
  };

  const makeVideo = (sceneId: string) => {
    generateScene(sceneId, 'video');
  };

  const removeScene = (sceneId: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== sceneId));
    if (activeSceneId === sceneId) {
      const rest = scenes.filter((s) => s.id !== sceneId);
      setActiveSceneId(rest[0]?.id ?? '');
    }
  };

  const videoClass = `editor__video editor__video--${aspectRatio.replace(':', '-')}`;

  return (
    <main className="editor">
      {/* ===== Левая колонка — сцены ===== */}
      <aside className="editor__scenes">
        <div className="editor__scenes-header">
          <span className="editor__scenes-title">Сцены</span>
          <span className="editor__scenes-count">{counts.total}</span>
        </div>

        <div className="editor__scenes-filters">
          {(['all', 'empty', 'done', 'failed'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`editor__filter ${filter === f ? 'editor__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' && `Все ${counts.total}`}
              {f === 'empty' && `Пустые ${counts.empty}`}
              {f === 'done' && `Готовые ${counts.done}`}
              {f === 'failed' && `Ошибки ${counts.failed}`}
            </button>
          ))}
        </div>

        <div className="editor__scenes-list">
          {visibleScenes.map((scene) => (
            <button
              key={scene.id}
              type="button"
              className={`scene-item ${activeSceneId === scene.id ? 'scene-item--active' : ''}`}
              onClick={() => setActiveSceneId(scene.id)}
            >
              <span className="scene-item__index">
                {String(scene.index).padStart(3, '0')}
              </span>

              <div className="scene-item__preview">
                {scene.status === 'done' && scene.assetKind === 'image' && scene.assetUrl && (
                  <img src={scene.assetUrl} alt={scene.title} />
                )}
                {scene.status === 'done' && scene.assetKind === 'video' && (
                  <div className="scene-item__video-badge">🎬</div>
                )}
                {scene.status === 'generating' && <div className="scene-item__spinner" />}
                {scene.status === 'failed' && <div className="scene-item__failed">✕</div>}
                {scene.status === 'empty' && <div className="scene-item__empty">—</div>}
              </div>

              <div className="scene-item__info">
                <span className="scene-item__title">{scene.title}</span>
                <span className="scene-item__time">{scene.duration} сек</span>
              </div>
            </button>
          ))}

          {visibleScenes.length === 0 && (
            <div className="editor__scenes-empty">Здесь пусто</div>
          )}
        </div>
      </aside>

      {/* ===== Центр ===== */}
      <section className="editor__center">
        <div className="editor__player-topbar">
          <button
            type="button"
            className="editor__back"
            onClick={() => navigate('/projects')}
          >
            ← Назад
          </button>

          <span className="editor__player-title">{payload.title}</span>

          <div className="editor__progress">
            <div className="editor__progress-bar">
              <div
                className="editor__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="editor__progress-label">
              {counts.done} / {counts.total} · {progressPercent}%
            </span>
          </div>

          <div className="editor__ratios">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r}
                type="button"
                className={`editor__ratio ${aspectRatio === r ? 'editor__ratio--active' : ''}`}
                onClick={() => setAspectRatio(r)}
                title={RATIO_HINTS[r]}
              >
                {r}
              </button>
            ))}
          </div>

          {!isRunning ? (
            <button
              type="button"
              className="editor__run-btn"
              onClick={runQueue}
              disabled={counts.empty === 0}
            >
              ▶ Сгенерировать всё
            </button>
          ) : (
            <button
              type="button"
              className="editor__run-btn editor__run-btn--stop"
              onClick={stopQueue}
            >
              ⏸ Остановить
            </button>
          )}
        </div>

        <div className={videoClass}>
          <div className="editor__video-inner">
            {activeScene?.status === 'done' && activeScene.assetKind === 'image' && activeScene.assetUrl && (
              <img src={activeScene.assetUrl} alt={activeScene.title} />
            )}

            {activeScene?.status === 'done' && activeScene.assetKind === 'video' && activeScene.assetUrl && (
              <video
                src={activeScene.assetUrl}
                controls
                loop
                muted
                autoPlay
              />
            )}

            {activeScene?.status === 'generating' && (
              <div className="editor__generating">
                <div className="editor__spinner" />
                <span>Генерация… {Math.round(activeScene.progress)}%</span>
              </div>
            )}

            {activeScene?.status === 'failed' && (
              <div className="editor__generating">
                <span>Ошибка генерации</span>
                <button
                  type="button"
                  className="editor__run-btn"
                  onClick={() => regenerateScene(activeScene.id)}
                >
                  Повторить
                </button>
              </div>
            )}

            {activeScene?.status === 'empty' && (
              <div className="editor__generating">
                <span>Сцена пустая</span>
              </div>
            )}
          </div>

          {activeScene?.status === 'done' && (
            <span className="editor__video-ratio">
              {activeScene.assetKind === 'video' ? '🎬 видео' : '🖼 картинка'}
            </span>
          )}
        </div>

        <div className="editor__controls">
          <button type="button" className="editor__ctrl">⏮</button>
          <button type="button" className="editor__ctrl editor__ctrl--play">▶</button>
          <button type="button" className="editor__ctrl">⏭</button>
          <span className="editor__time">— / —</span>
          <div className="editor__controls-right">
            <button type="button" className="editor__ctrl">🔊</button>
            <button type="button" className="editor__ctrl">⛶</button>
          </div>
        </div>

        <div className="editor__timeline">
          <div className="editor__timeline-tabs">
            <button type="button" className="editor__timeline-tab editor__timeline-tab--active">
              Таймлайн
            </button>
            <button type="button" className="editor__timeline-tab">Субтитры</button>
            <button type="button" className="editor__timeline-tab">Аудио</button>
          </div>

          <div className="editor__track editor__track--video">
            <span className="editor__track-label">🎬 Сцены</span>
            <div className="editor__track-clips">
              {scenes.slice(0, 80).map((scene) => (
                <div
                  key={scene.id}
                  className={`editor__clip ${activeSceneId === scene.id ? 'editor__clip--active' : ''} ${scene.status === 'generating' ? 'editor__clip--generating' : ''}`}
                  style={
                    scene.status === 'done' && scene.assetKind === 'image' && scene.assetUrl
                      ? { backgroundImage: `url(${scene.assetUrl})` }
                      : undefined
                  }
                  onClick={() => setActiveSceneId(scene.id)}
                  title={scene.title}
                />
              ))}
              {scenes.length > 80 && (
                <div className="editor__clip editor__clip--more">+{scenes.length - 80}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Правая панель ===== */}
      <aside className="editor__panel">
        <div className="editor__panel-header">
          <span className="editor__panel-title">Редактирование сцены</span>
        </div>

        {activeScene && (
          <>
            <div className="editor__panel-scene">
              <div className="editor__panel-scene-preview">
                {activeScene.status === 'done' && activeScene.assetKind === 'image' && activeScene.assetUrl && (
                  <img src={activeScene.assetUrl} alt={activeScene.title} />
                )}
                {activeScene.status === 'done' && activeScene.assetKind === 'video' && (
                  <div className="scene-item__video-badge">🎬</div>
                )}
                {activeScene.status === 'generating' && <div className="scene-item__spinner" />}
              </div>
              <div className="editor__panel-scene-info">
                <span className="editor__panel-scene-title">
                  Сцена {activeScene.index} — {activeScene.title}
                </span>
                <span className="editor__panel-scene-time">
                  {activeScene.duration} сек
                </span>
              </div>
            </div>

            <div className="editor__panel-field">
              <label className="editor__panel-label">Текст сцены</label>
              <textarea
                className="editor__panel-textarea"
                value={activeScene.script}
                onChange={(e) =>
                  setScenes((prev) =>
                    prev.map((s) =>
                      s.id === activeScene.id ? { ...s, script: e.target.value } : s
                    )
                  )
                }
              />
            </div>

            <div className="editor__panel-field">
              <label className="editor__panel-label">Visual Prompt</label>
              <textarea
                className="editor__panel-textarea"
                value={activeScene.visualPrompt}
                onChange={(e) =>
                  setScenes((prev) =>
                    prev.map((s) =>
                      s.id === activeScene.id ? { ...s, visualPrompt: e.target.value } : s
                    )
                  )
                }
              />
            </div>

            <div className="editor__panel-actions">
              <button
                type="button"
                className="editor__panel-btn editor__panel-btn--ghost"
                onClick={() => regenerateScene(activeScene.id)}
                disabled={activeScene.status === 'generating'}
              >
                🔄 Перегенерировать
              </button>

              <button
                type="button"
                className="editor__panel-btn editor__panel-btn--ghost"
                onClick={() => makeVideo(activeScene.id)}
                disabled={
                  activeScene.status === 'generating' ||
                  activeScene.assetKind === 'video'
                }
              >
                🎬 Оживить в видео
              </button>

              <button
                type="button"
                className="editor__panel-btn editor__panel-btn--ghost editor__panel-btn--danger"
                onClick={() => removeScene(activeScene.id)}
              >
                🗑 Удалить сцену
              </button>
            </div>
          </>
        )}
      </aside>
    </main>
  );
}