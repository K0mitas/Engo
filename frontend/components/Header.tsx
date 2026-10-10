import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  mockCharacters,
} from '../src/mockCharacters';

// ---------- мок проектов (потом заменишь на API) ----------
type Project = {
  id: string;
  title: string;
  cover: string;
};

const mockProjects: Project[] = [
  { id: '1', title: 'История одного человека', cover: 'https://picsum.photos/seed/1/80/60' },
  { id: '2', title: 'Путешествие в Армению',    cover: 'https://picsum.photos/seed/2/80/60' },
  { id: '3', title: 'Мой первый проект',        cover: 'https://picsum.photos/seed/3/80/60' },
  { id: '4', title: 'Воспоминания',             cover: 'https://picsum.photos/seed/4/80/60' },
  { id: '5', title: 'Природа и жизнь',          cover: 'https://picsum.photos/seed/5/80/60' },
  { id: '6', title: 'Новый мир',                cover: 'https://picsum.photos/seed/6/80/60' },
];

// ---------- мок библиотеки ----------
type LibraryItem = {
  id: string;
  title: string;
  url: string;
};

const mockLibrary: LibraryItem[] = [
  { id: 'l1', title: 'Дом у моря',       url: 'https://picsum.photos/seed/lib1/80/60' },
  { id: 'l2', title: 'Портрет',          url: 'https://picsum.photos/seed/lib2/80/60' },
  { id: 'l3', title: 'Горный пейзаж',    url: 'https://picsum.photos/seed/lib3/80/60' },
  { id: 'l4', title: 'Ночной город',     url: 'https://picsum.photos/seed/lib4/80/60' },
  { id: 'l5', title: 'Лес',              url: 'https://picsum.photos/seed/lib5/80/60' },
];

export function Header() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ---------- результаты ----------
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      return { projects: [], characters: [], library: [] };
    }

    return {
      projects: mockProjects
        .filter((p) => p.title.toLowerCase().includes(q))
        .slice(0, 4),
      characters: mockCharacters
        .filter((c) => c.name.toLowerCase().includes(q))
        .slice(0, 4),
      library: mockLibrary
        .filter((i) => i.title.toLowerCase().includes(q))
        .slice(0, 4),
    };
  }, [query]);

  const hasResults =
    results.projects.length + results.characters.length + results.library.length > 0;

  // ---------- закрытие при клике вне ----------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- выбор результата ----------
  const goToProject = (id: string) => {
    navigate(`/projects/${id}`);
    closeAndClear();
  };

  const goToCharacter = (_id: string) => {
    navigate('/characters');
    closeAndClear();
  };

  const goToLibraryItem = (_id: string) => {
    navigate('/library');
    closeAndClear();
  };

  const closeAndClear = () => {
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
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeAndClear();
            }}
          />
          {query && (
            <button
              type="button"
              className="header__search-clear"
              onClick={closeAndClear}
              aria-label="Очистить"
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && query.trim().length >= 2 && (
          <div className="search-dropdown">
            {!hasResults && (
              <div className="search-dropdown__empty">
                Ничего не найдено
              </div>
            )}

            {results.projects.length > 0 && (
              <div className="search-dropdown__group">
                <div className="search-dropdown__group-title">
                  🎬 Проекты
                </div>
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="search-result"
                    onClick={() => goToProject(p.id)}
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
                <div className="search-dropdown__group-title">
                  👤 Персонажи
                </div>
                {results.characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="search-result"
                    onClick={() => goToCharacter(c.id)}
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
                <div className="search-dropdown__group-title">
                  📚 Библиотека
                </div>
                {results.library.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className="search-result"
                    onClick={() => goToLibraryItem(i.id)}
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
        <button type="button" className="header__icon-btn" aria-label="Уведомления"></button>
        <NavLink to="/account">
        <button type="button" className="header__avatar" aria-label="Профиль" />
        </NavLink>
      </div>
    </header>
  );
}