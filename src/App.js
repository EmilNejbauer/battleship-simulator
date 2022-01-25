import "./App.css";
import Game from "./components/game/game.component";

function App() {
  return (
    <div className="App">
      <Game boardSize = {100} autoPlayInterval = {500}  />
    </div>
  );
}

export default App;
