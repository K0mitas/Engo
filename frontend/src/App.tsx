import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ProjectsPage } from '../page/ProjectsPage';
import { CreateProjectPage } from '../page/CreateProjectPage';
import { EditorPage } from '../page/EditorPage';
import { CharactersPage } from '../page/CharactersPage';
import { SettingsPage } from '../page/SettingsPage';
import { AccountPage } from '../page/AccountPage';

function Root() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="app-loader">
        <div className="app-loader__spinner" />
      </div>
    );
  }

  // Не залогинен — только форма
  if (!user) {
    return (
      <Routes>
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/account" replace />} />
      </Routes>
    );
  }

  // Залогинен — полное приложение
  return (
    <div className="app">
      <Sidebar />
      <div className="app__main">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<EditorPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Root />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;