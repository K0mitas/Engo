import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
type ProjectStatus = 'active' | 'completed' | 'archive';

type Project = {
  id: string;
  title: string;
  cover: string;
  duration: string;
  scenes: number;
  updatedAt: string;
  status: ProjectStatus;
};

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Бэн ебёт шлюху',
    cover: 'https://picsum.photos/seed/1/400/240',
    duration: '2 мин 45 сек',
    scenes: 12,
    updatedAt: '16.08.2025',
    status: 'active',
  },
  {
    id: '2',
    title: 'Путешествие в Армению',
    cover: 'https://picsum.photos/seed/2/400/240',
    duration: '1 мин 32 сек',
    scenes: 8,
    updatedAt: '12.08.2025',
    status: 'active',
  },
  {
    id: '3',
    title: 'Мой первый проект',
    cover: 'https://picsum.photos/seed/3/400/240',
    duration: '1 мин 10 сек',
    scenes: 5,
    updatedAt: '10.08.2025',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Воспоминания',
    cover: 'https://picsum.photos/seed/4/400/240',
    duration: '3 мин 20 сек',
    scenes: 14,
    updatedAt: '08.08.2025',
    status: 'active',
  },
  {
    id: '5',
    title: 'Природа и жизнь',
    cover: 'https://picsum.photos/seed/5/400/240',
    duration: '2 мин 12 сек',
    scenes: 9,
    updatedAt: '05.08.2025',
    status: 'completed',
  },
  {
    id: '6',
    title: 'Новый мир',
    cover: 'https://picsum.photos/seed/6/400/240',
    duration: '1 мин 45 сек',
    scenes: 7,
    updatedAt: '02.08.2025',
    status: 'archive',
  },
];

const tabs: { id: ProjectStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Завершенные' },
  { id: 'archive', label: 'Архив' },
];

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<ProjectStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (activeTab === 'all') return mockProjects;
    return mockProjects.filter((p) => p.status === activeTab);
  }, [activeTab]);

  return (
    <main className="projects">
      <header className="projects__header">
        <div>
          <h1 className="projects__title">Мои проекты</h1>
          <p className="projects__subtitle">
            Управляйте своими проектами и создавайте новые видео с помощью AI
          </p>
        </div>
        <NavLink to="/projects/new">
        <button type="button" className="projects__new-btn">
          + Новый проект
        </button>
        </NavLink>
      </header>

      <div className="projects__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`projects__tab ${activeTab === tab.id ? 'projects__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="projects__grid">
        {filtered.map((project) => (
          <NavLink to="/projects/update">
            <article key={project.id} className="project-card">
              <div className="project-card__cover">
                <img src={project.cover} alt={project.title} />
                <button type="button" className="project-card__menu" aria-label="Меню">
                  ⋮
                </button>
              </div>
              <div className="project-card__body">
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__meta">
                  {project.scenes} сцен · {project.duration}
                </p>
                <p className="project-card__date">
                  Последнее изменение: {project.updatedAt}
                </p>
              </div>
            </article>
          </NavLink>
        ))}
      </section>
    </main>
  );
}