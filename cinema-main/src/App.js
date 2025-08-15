import "./App.css";
import { AllRoutes } from "./routes/AllRoutes";
import { Footer, Header } from "./components";

function App() {
  return (
    <div>
      <Header />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;
