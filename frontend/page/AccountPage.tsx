import { useState } from 'react';
import { api, authStorage, type User } from '../src/api';
import { useUser } from '../src/UserContext';
import React from 'react';

type Mode = 'login' | 'register';

export function AccountPage() {
  const { user, setUser, logout } = useUser();
  const [mode, setMode] = useState<Mode>('login');

  if (user) {
    return (
      <main className="account">
        <div className="account__content">
          <ProfileView user={user} onLogout={logout} />
        </div>
      </main>
    );
  }

  return (
    <main className="account">
      <div className="account__content">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={setUser}
            onSwitch={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={setUser}
            onSwitch={() => setMode('login')}
          />
        )}
      </div>
    </main>
  );
}

/* ==================== Вход ==================== */

function LoginForm({
  onSuccess,
  onSwitch,
}: {
  onSuccess: (user: User) => void;
  onSwitch: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken, user } = await api.login({ email, password });
      authStorage.setToken(accessToken);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="account__form" onSubmit={handleSubmit}>
      <h2 className="account__title">Вход</h2>
      <p className="account__subtitle">
        Войдите, чтобы управлять проектами и подпиской
      </p>

      <Field label="Email">
        <input
          type="email"
          className="account__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
        />
      </Field>

      <Field label="Пароль">
        <input
          type="password"
          className="account__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </Field>

      {error && <div className="account__error">{error}</div>}

      <button
        type="submit"
        className="account__submit"
        disabled={loading || !email || !password}
      >
        {loading ? 'Входим…' : 'Войти'}
      </button>

      <div className="account__footer">
        Нет аккаунта?{' '}
        <button type="button" className="account__link" onClick={onSwitch}>
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
}

/* ==================== Регистрация ==================== */

function RegisterForm({
  onSuccess,
  onSwitch,
}: {
  onSuccess: (user: User) => void;
  onSwitch: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken, user } = await api.register({ name, email, password });
      authStorage.setToken(accessToken);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="account__form" onSubmit={handleSubmit}>
      <h2 className="account__title">Регистрация</h2>
      <p className="account__subtitle">
        Создайте аккаунт, чтобы начать генерировать видео
      </p>

      <Field label="Имя">
        <input
          type="text"
          className="account__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name"
          required
          autoFocus
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          className="account__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field label="Пароль">
        <input
          type="password"
          className="account__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 6 символов"
          required
        />
      </Field>

      {error && <div className="account__error">{error}</div>}

      <button
        type="submit"
        className="account__submit"
        disabled={loading || !name || !email || !password}
      >
        {loading ? 'Создаём…' : 'Создать аккаунт'}
      </button>

      <div className="account__footer">
        Уже есть аккаунт?{' '}
        <button type="button" className="account__link" onClick={onSwitch}>
          Войти
        </button>
      </div>
    </form>
  );
}

/* ==================== Профиль ==================== */

function ProfileView({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div className="account__form">
      <div className="account__profile-header">
        <h2 className="account__title">Профиль</h2>
        <button
          type="button"
          className="account__btn account__btn--ghost"
          onClick={onLogout}
        >
          Выйти
        </button>
      </div>

      <div className="account__avatar-row">
        <div
          className="account__avatar account__avatar--initial"
          style={{ background: avatarColor(user.email) }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="account__view-row">
        <span className="account__view-label">Имя</span>
        <span className="account__view-value">{user.name}</span>
      </div>

      <div className="account__view-row">
        <span className="account__view-label">Email</span>
        <span className="account__view-value">{user.email}</span>
      </div>

      <div className="account__view-row">
        <span className="account__view-label">Тариф</span>
        <span className="account__view-value">{user.plan}</span>
      </div>
    </div>
  );
}

/* ==================== Общие мелкие компоненты ==================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="account__field">
      <label className="account__label">{label}</label>
      {children}
    </div>
  );
}

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