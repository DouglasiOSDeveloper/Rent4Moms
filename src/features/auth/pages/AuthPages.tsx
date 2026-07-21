import React, { useState } from "react";
import { AlertCircle, CheckCircle, Eye, FileText, Lock, Mail, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router";
import type { NavigateToPage } from "../../../app/navigation";
import { MaskedInput } from "../../../components/forms/MaskedInput";
import { Btn, Input } from "../../../components/prototype/PrototypeUI";
import type { RegistrationInput } from "../../../domain/auth/types";
import { maskCpf, maskPhone } from "../../../lib/masks";
import {
  startOrderClaim,
  verifyOrderClaim,
  type OrderClaimCompleteResponse,
  type OrderClaimStartResponse,
} from "../../../services/auth/orderClaimApi";

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle size={16} className="mt-0.5 shrink-0" />{message}</div>;
}

export function LoginPage({ navigate, onLogin }: {
  navigate: NavigateToPage;
  onLogin: (identifier: string, password: string) => Promise<void>;
}) {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("pedido")?.trim() ?? "";
  const [identifier, setIdentifier] = useState(searchParams.get("usuario")?.trim() ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!identifier.trim() || password.length < 8) {
      setError("Informe seu e-mail ou CPF e uma senha válida.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onLogin(identifier, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold">R4</span></div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Bem-vinda de volta</h1>
          <p className="text-muted-foreground mt-1">Entre na sua conta para acompanhar seus orçamentos</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8">
          {orderCode && (
            <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-foreground"><FileText size={16} className="text-primary" />Acompanhar {orderCode}</div>
              <p className="mt-1 text-muted-foreground">Ao entrar com uma conta que tenha o mesmo CPF, a solicitação será vinculada com segurança.</p>
            </div>
          )}
          <ErrorBanner message={error} />
          <div className="flex flex-col gap-4 mb-6">
            <Input label="E-mail ou CPF" placeholder="seu@email.com ou 000.000.000-00" value={identifier} onChange={setIdentifier} autoComplete="username" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="login-password">Senha <span className="text-primary">*</span></label>
              <div className="relative">
                <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} placeholder="••••••••" autoComplete="current-password" className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <Eye size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>
          </div>

          <Btn variant="primary" fullWidth onClick={() => void submit()} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Btn>
          <button onClick={() => navigate("forgot-password")} className="w-full text-center text-sm text-primary hover:underline mt-4">Esqueci minha senha</button>
          <div className="my-6 flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">ou</span><div className="flex-1 h-px bg-border" /></div>
          <p className="text-center text-sm text-muted-foreground">Ainda não tem conta? <button onClick={() => navigate("signup", orderCode ? { pedido: orderCode } : undefined)} className="text-primary font-medium hover:underline">Criar conta</button></p>
        </div>
      </div>
    </div>
  );
}

function OrderClaimSignupFlow({ orderCode, navigate, onClaimComplete }: {
  orderCode: string;
  navigate: NavigateToPage;
  onClaimComplete: (claimToken: string, password: string) => Promise<OrderClaimCompleteResponse>;
}) {
  const [quoteCode, setQuoteCode] = useState(orderCode);
  const [cpf, setCpf] = useState("");
  const [challenge, setChallenge] = useState<OrderClaimStartResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [claimToken, setClaimToken] = useState("");
  const [profile, setProfile] = useState<{ name: string; email: string; cpf: string; phone: string | null } | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [existingAccount, setExistingAccount] = useState<{ loginIdentifier: string; linkedQuoteCount: number } | null>(null);
  const [step, setStep] = useState<"identify" | "verify" | "password" | "existing">("identify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestCode = async () => {
    if (!quoteCode.trim() || cpf.replace(/\D/g, "").length !== 11) {
      setError("Informe o código da solicitação e o CPF usado no pedido.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await startOrderClaim(quoteCode.trim(), cpf);
      setChallenge(result);
      setVerificationCode("");
      setStep("verify");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível enviar o código de confirmação.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!challenge || verificationCode.replace(/\D/g, "").length !== 6) {
      setError("Informe o código de seis dígitos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await verifyOrderClaim(challenge.claimId, verificationCode);
      if ("claimToken" in result) {
        setClaimToken(result.claimToken);
        setProfile(result.profile);
        setStep("password");
      } else {
        setExistingAccount({ loginIdentifier: result.loginIdentifier, linkedQuoteCount: result.linkedQuoteCount });
        setStep("existing");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível confirmar o código.");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (password.length < 8 || password !== passwordConfirmation || !accepted) {
      setError("Defina uma senha de pelo menos oito caracteres, confirme-a e aceite os termos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await onClaimComplete(claimToken, password);
      if ("loginIdentifier" in result) {
        setExistingAccount({ loginIdentifier: result.loginIdentifier, linkedQuoteCount: result.linkedQuoteCount });
        setStep("existing");
      } else {
        navigate("account-quotes");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "existing" && existingAccount) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <CheckCircle size={42} className="mx-auto mb-4 text-emerald-600" />
        <h2 className="text-xl font-semibold text-foreground">Solicitação vinculada</h2>
        <p className="mt-2 text-sm text-muted-foreground">Já existe uma conta para este CPF. {existingAccount.linkedQuoteCount} solicitação(ões) foram vinculadas após a confirmação.</p>
        <Btn variant="primary" fullWidth onClick={() => navigate("login", { pedido: quoteCode, usuario: existingAccount.loginIdentifier })} className="mt-6">Entrar na conta</Btn>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-8">
      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2 font-medium text-foreground"><ShieldCheck size={17} className="text-primary" />Vincular solicitação à sua conta</div>
        <p className="mt-1 text-sm text-muted-foreground">Para proteger seus dados, confirmaremos a posse do e-mail informado no pedido antes de criar a conta.</p>
      </div>
      <ErrorBanner message={error} />

      {step === "identify" && (
        <div className="space-y-4">
          <Input label="Código da solicitação" value={quoteCode} onChange={(value) => setQuoteCode(value.toUpperCase())} placeholder="ORC-2026-XXXXXXXX" required />
          <MaskedInput label="CPF usado no pedido" value={cpf} onChange={setCpf} mask={maskCpf} placeholder="000.000.000-00" inputMode="numeric" required />
          <Btn variant="primary" fullWidth onClick={() => void requestCode()} disabled={loading}>{loading ? "Enviando..." : "Enviar código de confirmação"}</Btn>
          <button type="button" onClick={() => navigate("login", { pedido: quoteCode })} className="w-full text-center text-sm text-primary hover:underline">Já tenho conta</button>
        </div>
      )}

      {step === "verify" && challenge && (
        <div className="space-y-4">
          <div className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
            Enviamos um código para <strong className="text-foreground">{challenge.destinationMasked}</strong>. Ele expira às {new Date(challenge.expiresAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.
          </div>
          {challenge.developmentCode && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Ambiente de desenvolvimento: use o código <strong className="tracking-widest">{challenge.developmentCode}</strong>.
            </div>
          )}
          <Input label="Código de confirmação" value={verificationCode} onChange={(value) => setVerificationCode(value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" inputMode="numeric" maxLength={6} autoComplete="one-time-code" required />
          <Btn variant="primary" fullWidth onClick={() => void verifyCode()} disabled={loading}>{loading ? "Confirmando..." : "Confirmar código"}</Btn>
          <button type="button" onClick={() => { setStep("identify"); setChallenge(null); setError(""); }} className="w-full text-center text-sm text-primary hover:underline">Solicitar outro código</button>
        </div>
      )}

      {step === "password" && profile && (
        <div className="space-y-4">
          <div className="rounded-xl bg-secondary px-4 py-4">
            <p className="text-sm font-medium text-foreground">Dados recuperados do pedido</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Nome</dt><dd className="text-foreground">{profile.name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">E-mail</dt><dd className="text-foreground">{profile.email}</dd></div>
              <div><dt className="text-xs text-muted-foreground">CPF</dt><dd className="text-foreground">{maskCpf(profile.cpf)}</dd></div>
              {profile.phone && <div><dt className="text-xs text-muted-foreground">Telefone</dt><dd className="text-foreground">{maskPhone(profile.phone)}</dd></div>}
            </dl>
          </div>
          <Input label="Crie sua senha" type="password" value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" autoComplete="new-password" required />
          <Input label="Confirme a senha" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} placeholder="Repita a senha" autoComplete="new-password" required />
          <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-primary" /><span className="text-sm text-muted-foreground">Li e aceito a Política de privacidade e os Termos de uso</span></label>
          <Btn variant="primary" fullWidth onClick={() => void createAccount()} disabled={loading}>{loading ? "Criando conta..." : "Criar conta e acompanhar pedido"}</Btn>
        </div>
      )}
    </div>
  );
}

export function SignupPage({ navigate, onRegister, onClaimComplete }: {
  navigate: NavigateToPage;
  onRegister: (input: RegistrationInput) => Promise<void>;
  onClaimComplete: (claimToken: string, password: string) => Promise<OrderClaimCompleteResponse>;
}) {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("pedido")?.trim() ?? "";
  const [form, setForm] = useState<RegistrationInput>({ name: "", email: "", cpf: "", phone: "", password: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (orderCode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail size={22} className="text-primary" /></div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Crie sua conta pelo pedido</h1>
            <p className="text-muted-foreground mt-1">Recupere os dados já informados e defina apenas a senha</p>
          </div>
          <OrderClaimSignupFlow orderCode={orderCode} navigate={navigate} onClaimComplete={onClaimComplete} />
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.cpf.replace(/\D/g, "").length !== 11 || form.phone.replace(/\D/g, "").length < 10 || form.password.length < 8 || !accepted) {
      setError("Preencha todos os campos obrigatórios e aceite os termos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onRegister(form);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Criar sua conta</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus orçamentos e locações com facilidade</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-8">
          <ErrorBanner message={error} />
          <div className="flex flex-col gap-4 mb-6">
            <Input label="Nome completo" placeholder="Seu nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} autoComplete="name" required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={(value) => setForm({ ...form, email: value })} autoComplete="email" required />
            <MaskedInput label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(value) => setForm({ ...form, cpf: value })} mask={maskCpf} inputMode="numeric" autoComplete="off" required />
            <MaskedInput label="Telefone / WhatsApp" placeholder="(11) 00000-0000" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} mask={maskPhone} inputMode="tel" autoComplete="tel" required />
            <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(value) => setForm({ ...form, password: value })} autoComplete="new-password" required />
            <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-primary" /><span className="text-sm text-muted-foreground">Li e aceito a Política de privacidade e os Termos de uso</span></label>
          </div>
          <Btn variant="primary" fullWidth onClick={() => void submit()} disabled={loading}>{loading ? "Criando conta..." : "Criar conta"}</Btn>
          <p className="text-center text-sm text-muted-foreground mt-4">Já tem conta? <button onClick={() => navigate("login")} className="text-primary font-medium hover:underline">Entrar</button></p>
        </div>
      </div>
    </div>
  );
}
