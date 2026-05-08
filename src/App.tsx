import { BrowserRouter, Route, Routes } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from "@/pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
