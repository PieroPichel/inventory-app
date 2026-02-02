import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import InventoryTable from "./components/InventoryTable.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TopBar from "./components/TopBar.jsx";

export default function App() {
  const [selectedHouse, setSelectedHouse] = useState(null);

  // This ref allows TopBar to trigger export inside InventoryTable
  const exportRef = useRef(null);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <TopBar
                onHouseChange={setSelectedHouse}
                onExport={() => {
                  if (exportRef.current) {
                    exportRef.current();
                  }
                }}
              />

              <InventoryTable
                selectedHouse={selectedHouse}
                onExportRequest={exportRef}
              />
            </>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
