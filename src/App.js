import React from 'react';
import logo from './logo.svg';
import './App.css';
import Pong from './components/pong/pong.component';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <Pong />
    </div>
  );
}

export default App;
