import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="App min-h-screen bg-background text-foreground">
        <Dashboard api={API} />
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;

export { API };