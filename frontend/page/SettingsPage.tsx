import { useState } from 'react';
import React from "react"

type SettingsTab = 'providers' | 'video' | 'storage' | 'general';

type Provider = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'providers', label: 'AI-провайдеры' },
  { id: 'video', label: 'Видео' },
  { id: 'storage', label: 'Хранилище' },
  { id: 'general', label: 'Общие' },
];

const initialProviders: Provider[] = [
  { id: 'openai', name: 'OpenAI (Text / Изображения)', description: 'GPT-4, DALL·E', enabled: true },
  { id: 'midjourney', name: 'Midjourney (Изображения)', description: 'Генерация изображений', enabled: true },
  { id: 'runway', name: 'Runway (Видео)', description: 'Генерация видео из текста', enabled: true },
  { id: 'elevenlabs', name: 'ElevenLabs (Аудио)', description: 'Синтез речи', enabled: true },
  { id: 'stability', name: 'Stability AI (Изображения)', description: 'Stable Diffusion', enabled: false },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('providers');
  const [providers, setProviders] = useState<Provider[]>(initialProviders);

  const toggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <main className="settings">
      <header className="settings__header">
        <h1 className="settings__title">Настройки</h1>
        <p className="settings__subtitle">
          Управляйте подключениями AI-сервисов и параметрами приложения
        </p>
      </header>

      <div className="settings__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`settings__tab ${activeTab === tab.id ? 'settings__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'providers' && (
        <section className="settings__section">
          <h2 className="settings__section-title">AI-провайдеры</h2>

          <div className="settings__providers">
            {providers.map((provider) => (
              <div key={provider.id} className="provider-row">
                <div className="provider-row__info">
                  <span className="provider-row__name">{provider.name}</span>
                  <span className="provider-row__desc">{provider.description}</span>
                </div>

                <button
                  type="button"
                  className={`toggle ${provider.enabled ? 'toggle--on' : ''}`}
                  onClick={() => toggleProvider(provider.id)}
                  aria-pressed={provider.enabled}
                  aria-label={`Переключить ${provider.name}`}
                >
                  <span className="toggle__thumb" />
                </button>
              </div>
            ))}
          </div>

          <div className="settings__footer">
            <button type="button" className="settings__btn">
              Управление API-ключами
            </button>
          </div>
        </section>
      )}

      {activeTab === 'video' && (
        <section className="settings__section">
          <h2 className="settings__section-title">Параметры видео</h2>
          <p className="settings__placeholder">Раздел в разработке</p>
        </section>
      )}

      {activeTab === 'storage' && (
        <section className="settings__section">
          <h2 className="settings__section-title">Хранилище</h2>
          <p className="settings__placeholder">Раздел в разработке</p>
        </section>
      )}

      {activeTab === 'general' && (
        <section className="settings__section">
          <h2 className="settings__section-title">Общие</h2>
          <p className="settings__placeholder">Раздел в разработке</p>
        </section>
      )}
    </main>
  );
}