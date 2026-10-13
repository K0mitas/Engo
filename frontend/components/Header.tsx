import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../src/UserContext';
import {
  mockCharacters,
  type Character,
} from '../src/mockCharacters';

type Project = { id: string; title: string; cover: string };
type LibraryItem = { id: string; title: string; url: string };

const mockProjects: Project[] = [
  { id: '1', title: 'История одного человека', cover: 'https://picsum.photos/seed/1/80/60' },
  { id: '2', title: 'Путешествие в Армению',    cover: 'https://picsum.photos/seed/2/80/60' },
  { id: '3', title: 'Мой первый проект',        cover: 'https://picsum.photos/seed/3/80/60' },
];

const mockLibrary: LibraryItem[] = [
  { id: 'l1', title: 'Дом у моря',    url: 'https://picsum.photos/seed/lib1/80/60' },
  { id: 'l2', title: 'Портрет',       url: 'https://picsum.photos/seed/lib2/80/60' },
  { id: 'l3', title: 'Горный пейзаж', url: 'https://picsum.photos/seed/lib3/80/60' },
];

function avatarColor(seed: string): string {
  const colors = [
    '#6c5ce7', '#00b894', '#e17055', '#0984e3',
    '#fdcb6e', '#d63031', '#e84393', '#00cec9',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Header() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { projects: [], characters: [], library: [] };

    return {
      projects: mockProjects.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 4),
      characters: mockCharacters.filter((c: Character) => c.name.toLowerCase().includes(q)).slice(0, 4),
      library: mockLibrary.filter((i) => i.title.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query]);

  const hasResults =
    results.projects.length + results.characters.length + results.library.length > 0;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const close = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="header">
      <div className="header__search-wrapper" ref={wrapperRef}>
        <div className="header__search">
          <span className="header__search-icon">🔍</span>
          <input
            type="text"
            className="header__search-input"
            placeholder="Поиск проектов, персонажей, библиотеки..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
            }}
          />
          {query && (
            <button
              type="button"
              className="header__search-clear"
              onClick={close}
              aria-label="Очистить"
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && query.trim().length >= 2 && (
          <div className="search-dropdown">
            {!hasResults && (
              <div className="search-dropdown__empty">Ничего не найдено</div>
            )}

            {results.projects.length > 0 && (
              <div className="search-dropdown__group">
                <div className="search-dropdown__group-title">🎬 Проекты</div>
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="search-result"
                    onClick={() => {
                      navigate(`/projects/${p.id}`);
                      close();
                    }}
                  >
                    <div className="search-result__thumb">
                      <img src={p.cover} alt={p.title} />
                    </div>
                    <span className="search-result__title">{p.title}</span>
                  </button>
                ))}
              </div>
            )}

            {results.characters.length > 0 && (
              <div className="search-dropdown__group">
                <div className="search-dropdown__group-title">👤 Персонажи</div>
                {results.characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="search-result"
                    onClick={() => {
                      navigate('/characters');
                      close();
                    }}
                  >
                    <div className="search-result__thumb search-result__thumb--round">
                      <img src={c.avatar} alt={c.name} />
                    </div>
                    <div className="search-result__text">
                      <span className="search-result__title">{c.name}</span>
                      <span className="search-result__subtitle">{c.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.library.length > 0 && (
              <div className="search-dropdown__group">
                <div className="search-dropdown__group-title">📚 Библиотека</div>
                {results.library.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className="search-result"
                    onClick={() => {
                      navigate('/library');
                      close();
                    }}
                  >
                    <div className="search-result__thumb">
                      <img src={i.url} alt={i.title} />
                    </div>
                    <span className="search-result__title">{i.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header__actions">
        <button type="button" className="header__icon-btn" aria-label="Уведомления">
          🔔
        </button>

        <Link
          to="/account"
          className="header__avatar"
          aria-label={user ? 'Профиль' : 'Войти'}
          style={
            user
              ? { background: avatarColor(user.email), display: 'grid', placeItems: 'center' }
              : undefined
          }
        >
          {user && (
            <span className="header__avatar-initial">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}