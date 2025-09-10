import './styles.css';
import AlertsList from './components/AlertsList';
import SimulatePanel from './components/SimulatePanel';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <strong>OT Security Dashboard (Thermal Power Demo)</strong>
      </header>
      <main className="content">
        <AlertsList />
        <SimulatePanel />
      </main>
    </div>
  );
}

