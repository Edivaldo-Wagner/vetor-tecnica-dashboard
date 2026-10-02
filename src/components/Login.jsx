import React, { useState, useContext } from 'react';
import { AuthContext } from '../authContext/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // Alterna entre Login e Cadastro
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      await loginUser(username, password);
    } else {
      // ✅ Captura qualquer erro retornado pelo Serializer do Django
      if (typeof data === 'object' && data !== null) {
        const errorMessages = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
          .join(' | ');
        setError(errorMessages || 'Erro ao criar conta');
      } else {
        setError('Erro ao criar conta');
      }
    }
  } catch (err) {
    setError('Erro de conexão com o servidor');
  }
} else {
      // Lógica de LOGIN
      const result = await loginUser(username, password);
      if (!result.success) {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-4">
      <div className="bg-[#151c24] border border-slate-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-lg">
            VT
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">VetorTécnica</h1>
            <p className="text-xs text-slate-400">
              {isRegister ? 'Crie a sua conta de acesso' : 'Entre com a sua conta'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Usuário
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1e2732] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Campo extra de Email visível apenas no Cadastro */}
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e2732] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Palavra-passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e2732] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition"
          >
            {loading
              ? 'A processar...'
              : isRegister
              ? 'Criar Conta'
              : 'Entrar no Painel'}
          </button>
        </form>

        {/* Botão de alternância */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isRegister ? (
            <p>
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className="text-amber-500 font-semibold hover:underline ml-1"
              >
                Fazer Login
              </button>
            </p>
          ) : (
            <p>
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className="text-amber-500 font-semibold hover:underline ml-1"
              >
                Cadastrar-se
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}