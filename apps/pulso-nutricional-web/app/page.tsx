import { PatientsView } from "./patients-view";

export default function Page() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Pulso Nutricional</h1>
        <p style={{ margin: "0.25rem 0 0", color: "#555" }}>Panel profesional</p>
      </header>

      <div
        role="note"
        style={{
          background: "#fff7e6",
          border: "1px solid #ffd591",
          borderRadius: 8,
          padding: "0.75rem 1rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
        }}
      >
        ⚠️ <strong>Datos ficticios de demostración — MC-3.</strong> Ningún dato de
        esta pantalla es real. Sin base de datos, sin conexión a la API.
      </div>

      <PatientsView />
    </main>
  );
}
