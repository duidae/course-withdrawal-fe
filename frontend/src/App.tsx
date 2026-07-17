import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./cool-ui/components/error-boundary/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<h1>Course-Withdrawal</h1>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
