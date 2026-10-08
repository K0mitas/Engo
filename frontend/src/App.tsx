import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectsPage } from '../page/ProjectsPage';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CreateProjectPage } from '../page/CreateProjectPage';
import { EditorPage } from '../page/EditorPage';
import { CharactersPage } from '../page/CharactersPage';
import { SettingsPage } from '../page/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="app__main">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/update" element={<EditorPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;