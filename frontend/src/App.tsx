import { type FC, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIntl } from "react-intl";

export const App: FC = () => {
  const { formatMessage: f } = useIntl();
  const appName = f({ id: "app.name" });

  useEffect(() => {
    document.title = appName;
  }, [appName]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Course-Withdrawal</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
