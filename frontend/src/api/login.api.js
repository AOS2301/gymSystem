const BASE_URL = "http://localhost:3000"; // backend

export async function login(email, senha) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erro ao fazer login");
  }

  return response.json();
}
