"use client";

import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, AuthResponse } from "../lib/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password, role: "OWNER" };
      const auth = await apiRequest<AuthResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("sscc_token", auth.accessToken);
      localStorage.setItem("sscc_user", JSON.stringify(auth.user));
      router.push("/");
    } catch {
      setError("No se pudo iniciar sesion. Revisa los datos o que el backend este activo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="authBrand">
          <div className="brandMark">SS</div>
          <div>
            <strong>Security Solutions Control Center</strong>
            <span>Acceso operativo al CRM</span>
          </div>
        </div>

        <div className="authIntro">
          <ShieldCheck size={34} />
          <h1>{mode === "login" ? "Ingresar al centro de control" : "Crear usuario inicial"}</h1>
        </div>

        <div className="segmented" role="tablist" aria-label="Modo de acceso">
          <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>
            Registro
          </button>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label>
              Nombre
              <span>
                <User size={18} />
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </span>
            </label>
          ) : null}

          <label>
            Email
            <span>
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label>
            Password
            <span>
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className="iconButton"
                title={showPassword ? "Ocultar password" : "Mostrar password"}
                aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error ? <p className="formError">{error}</p> : null}

          <button className="primaryButton" type="submit" disabled={loading}>
            {loading ? "Conectando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
      </section>
    </main>
  );
}
