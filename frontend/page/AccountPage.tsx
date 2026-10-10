import { useState } from 'react';

type Mode = 'login' | 'register' | 'profile';

export function AccountPage() {
  const [mode, setMode] = useState<Mode>('login');

  return (
    <main className="account">
      <div className="account__content">

        {mode === 'login' && (
          <form className="account__form" onSubmit={(e) => { e.preventDefault(); setMode('profile'); }}>
            <h2 className="account__title">Вход</h2>

            <div className="account__field">
              <label className="account__label">Email</label>
              <input type="email" className="account__input" placeholder="you@example.com" required />
            </div>

            <div className="account__field">
              <label className="account__label">Пароль</label>
              <input type="password" className="account__input" placeholder="••••••••" required />
            </div>

            <button type="submit" className="account__submit">Войти</button>

            <div className="account__footer">
              Нет аккаунта?{' '}
              <button type="button" className="account__link" onClick={() => setMode('register')}>
                Зарегистрироваться
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form className="account__form" onSubmit={(e) => { e.preventDefault(); setMode('profile'); }}>
            <h2 className="account__title">Регистрация</h2>

            <div className="account__field">
              <label className="account__label">Имя</label>
              <input type="text" className="account__input" placeholder="karen" required />
            </div>

            <div className="account__field">
              <label className="account__label">Email</label>
              <input type="email" className="account__input" placeholder="you@example.com" required />
            </div>

            <div className="account__field">
              <label className="account__label">Пароль</label>
              <input type="password" className="account__input" placeholder="Минимум 6 символов" required />
            </div>

            <button type="submit" className="account__submit">Создать аккаунт</button>

            <div className="account__footer">
              Уже есть аккаунт?{' '}
              <button type="button" className="account__link" onClick={() => setMode('login')}>
                Войти
              </button>
            </div>
          </form>
        )}

        {mode === 'profile' && (
          <Profile onLogout={() => setMode('login')} />
        )}

      </div>
    </main>
  );
}

function Profile({ onLogout }: { onLogout: () => void }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState('karen');
  const [email, setEmail] = useState('karen@example.com');
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);

  const startEdit = () => {
    setDraftName(name);
    setDraftEmail(email);
    setEdit(true);
  };

  const save = () => {
    setName(draftName);
    setEmail(draftEmail);
    setEdit(false);
  };

  return (
    <div className="account__form">
      <div className="account__profile-header">
        <h2 className="account__title">Профиль</h2>
        <button type="button" className="account__btn account__btn--ghost" onClick={onLogout}>
          Выйти
        </button>
      </div>

      <div className="account__avatar-row">
        <div className="account__avatar">
          <img src="https://picsum.photos/seed/karen/200/200" alt="avatar" />
        </div>
      </div>

      {!edit ? (
        <>
          <div className="account__view-row">
            <span className="account__view-label">Имя</span>
            <span className="account__view-value">{name}</span>
          </div>
          <div className="account__view-row">
            <span className="account__view-label">Email</span>
            <span className="account__view-value">{email}</span>
          </div>
          <button type="button" className="account__submit" onClick={startEdit}>
            Редактировать
          </button>
        </>
      ) : (
        <>
          <div className="account__field">
            <label className="account__label">Имя</label>
            <input
              className="account__input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="account__field">
            <label className="account__label">Email</label>
            <input
              className="account__input"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
            />
          </div>
          <div className="account__edit-actions">
            <button type="button" className="account__btn account__btn--ghost" onClick={() => setEdit(false)}>
              Отмена
            </button>
            <button type="button" className="account__btn" onClick={save}>
              Сохранить
            </button>
          </div>
        </>
      )}
    </div>
  );
}