import "./App.css";
import { AllRoutes } from "./routes/AllRoutes";
import { Footer, Header } from "./components";

function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0f0f23] text-gray-100 selection:bg-cinema-500 selection:text-white">
      <Header />
      <main className="flex-grow pt-16">
        <AllRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
