import React, { useEffect, useState } from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  reset,
  startDownloadWithoutWorker,
  startDownloadWithWorker,
} from './actions';

const URL = `${window.location.protocol}//${window.location.host}/empty.zip`;
const deadline = 'December, 31, 2022';

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet />
      <pre>
        <b>
          Note: On this example download with worker isn't working through
          seperate file because of the limited setup. But it will work if the
          worker code being placed in worker file.
        </b>
      </pre>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
      <Timer />
      <DownloadComponent />
    </div>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

function Timer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const getTime = (_deadline) => {
    const time = Date.parse(_deadline) - Date.now();
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24) + 1);
    setMinutes(Math.floor((time / 1000 / 60) % 60) + 1);
    setSeconds(Math.floor((time / 1000) % 60) + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(deadline), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="timer">
      <pre>
        {hours < 10 ? '0' + hours : hours} |{' '}
        {minutes < 10 ? '0' + minutes : minutes} |{' '}
        {seconds < 10 ? '0' + seconds : seconds}
      </pre>
    </div>
  );
}

function DownloadComponent() {
  const dispatch = useDispatch();
  const downloadProgress = useSelector((state) => state.downloadProgress);
  const downloadStatus = useSelector((state) => state.downloadStatus);
  const downloadError = useSelector((state) => state.downloadError);

  const startDownloadHandlerWithWorker = () => {
    dispatch(reset());
    dispatch(startDownloadWithWorker(URL));
  };

  const startDownloadHandlerWithoutWorker = () => {
    dispatch(reset());
    dispatch(startDownloadWithoutWorker(URL));
  };

  const resetHandler = () => {
    dispatch(reset());
  };

  return (
    <div>
      <button onClick={startDownloadHandlerWithoutWorker}>
        Start Download (without worker)
      </button>
      {''}
      <button onClick={resetHandler}>RESET</button>
      {''}
      <button onClick={startDownloadHandlerWithWorker}>
        Start Download (with worker)
      </button>
      <pre>
        {downloadStatus === 'inProgress' && (
          <div>Download Progress: {downloadProgress}%</div>
        )}
        {downloadStatus === 'completed' && <div>Download completed!</div>}
        {downloadStatus === 'error' && <div>Error: {downloadError}</div>}
      </pre>
    </div>
  );
}
export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}
