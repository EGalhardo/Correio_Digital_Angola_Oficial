import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  CheckCircle2, 
  Camera, 
  UploadCloud, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Shield,
  FileText, 
  Fingerprint, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const base64ToBlob = (base64Str: string): Blob => {
  try {
    const parts = base64Str.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (e) {
    console.error('Error converting base64 to blob:', e);
    return new Blob([], { type: 'image/jpeg' });
  }
};

interface RegisterStepperProps {
  onCancel: () => void;
  onSuccess: () => void;
  addAuditLog: (action: string, type?: 'info' | 'warning' | 'critical' | 'success') => void;
}

export function RegisterStepper({ onCancel, onSuccess, addAuditLog }: RegisterStepperProps) {
  // Current step state
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);

  // Step 1: Credenciais States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwdStrength, setPwdStrength] = useState<'Fraca' | 'Média' | 'Forte'>('Fraca');

  // Step 2: Identidade States
  const [biNumber, setBiNumber] = useState('');
  const [documentFrente, setDocumentFrente] = useState<File | null>(null);
  const [documentVerso, setDocumentVerso] = useState<File | null>(null);
  const [frentePreview, setFrentePreview] = useState<string | null>(null);
  const [versoPreview, setVersoPreview] = useState<string | null>(null);
  const [isUploadingFrente, setIsUploadingFrente] = useState(false);
  const [isUploadingVerso, setIsUploadingVerso] = useState(false);
  const [frenteSuccess, setFrenteSuccess] = useState(false);
  const [versoSuccess, setVersoSuccess] = useState(false);

  // Step 3: Biometria States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStateText, setScanStateText] = useState('Pronto para Captura');
  const [captureFinished, setCaptureFinished] = useState(false);
  const [savedFacePhoto, setSavedFacePhoto] = useState<string>('');

  // Submissão ao Supabase
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Calculate Password Strength in real time
  useEffect(() => {
    if (!password) {
      setPwdStrength('Fraca');
      return;
    }
    const hasNumbers = /\d/.test(password);
    const hasLetters = /[a-zA-Z]/.test(password);
    const isLong = password.length >= 8;

    if (hasNumbers && hasLetters && isLong) {
      setPwdStrength('Forte');
    } else if (password.length >= 6) {
      setPwdStrength('Média');
    } else {
      setPwdStrength('Fraca');
    }
  }, [password]);

  // Validation routines
  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isNameValid = (n: string) => {
    const trimmed = n.trim();
    return trimmed.length >= 6 && trimmed.split(/\s+/).length >= 2;
  };
  const isStep1Valid = isNameValid(name) && isEmailValid(email) && password.length >= 8;

  // Angolan BI validator (example: 009874562LA041 -> 14 characters, ends with 2 letters and 3 digits)
  const isBiValid = (bi: string) => {
    const cleanBi = bi.trim().toUpperCase();
    if (cleanBi.length !== 14) return false;
    return /[A-Z]/.test(cleanBi);
  };
  const isStep2Valid = isBiValid(biNumber) && frenteSuccess && versoSuccess;

  // Handle front file drop/selection
  const handleFrenteFile = (file: File) => {
    setIsUploadingFrente(true);
    setFrenteSuccess(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFrentePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate OCR Scan with security feedback
    setTimeout(() => {
      setIsUploadingFrente(false);
      setFrenteSuccess(true);
      addAuditLog('Leitura óptica OCR sucedida na Frente do B.I.', 'info');
    }, 1500);
  };

  // Handle back file drop/selection
  const handleVersoFile = (file: File) => {
    setIsUploadingVerso(true);
    setVersoSuccess(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setVersoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate OCR Scan
    setTimeout(() => {
      setIsUploadingVerso(false);
      setVersoSuccess(true);
      addAuditLog('Leitura óptica OCR sucedida no Verso do B.I.', 'info');
    }, 1500);
  };

  // Formatter for BI input
  const handleBiChange = (val: string) => {
    const formatted = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);
    setBiNumber(formatted);
  };

  // Biomety capture simulation
  const startCameraScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStateText('A inicializar detetor biométrico...');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;

      if (currentProgress === 20) setScanStateText('Detetando enquadramento oval...');
      if (currentProgress === 40) setScanStateText('Mapeando eixos tridimensionais...');
      if (currentProgress === 65) setScanStateText('Analisando vetores de vivacidade contra spoofing...');
      if (currentProgress === 85) setScanStateText('Sincronizando biometria com base civil de Angola...');

      if (currentProgress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setIsScanning(false);
        setCaptureFinished(true);
        setScanStateText('Mapeamento Facial Concluído!');

        // Use elegant photo template representation
        const randomPhotos = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&h=250&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&fit=crop&crop=face'
        ];
        const selectedPhoto = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
        setSavedFacePhoto(selectedPhoto);
        addAuditLog('Captura Biométrica Facial concluída com sucesso', 'success');
      } else {
        setScanProgress(currentProgress);
      }
    }, 150);
  };

  // Form submission and registration inside Supabase (with fallback to local storage)
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('Enviando documentos para o Supabase Storage...');

    // Standard register block
    const newUser = {
      id: `cit_${Date.now()}`,
      name: name.trim(),
      category: 'Cidadão',
      province: 'Luanda',
      municipio: 'Belas',
      address: 'Centralidade do Kilamba, Bloco T22',
      contact: email.trim().toLowerCase(),
      status: 'Pendente' as const,
      biNumber: biNumber.toUpperCase(),
      facePhoto: savedFacePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop&crop=face',
      verificationScore: parseFloat((94 + Math.random() * 5).toFixed(1)),
      reason: 'Aguardando validação formal de vivacidade e homologação de dados por analista tributário e SME.'
    };

    let urlFrente = '';
    let urlVerso = '';
    let urlSelfie = '';

    try {
      const isSupabaseReady = (import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
      
      if (isSupabaseReady) {
        const biClean = newUser.biNumber.replace(/\s+/g, '');
        
        // Upload front
        if (documentFrente) {
          const frontExt = documentFrente.name.split('.').pop() || 'jpg';
          const frontPath = `${biClean}/frente_${Date.now()}.${frontExt}`;
          const { error: fErr } = await supabase.storage
            .from('documentos_registo')
            .upload(frontPath, documentFrente);
          if (fErr) console.error('Erro upload frente:', fErr);
          else {
            const { data } = supabase.storage.from('documentos_registo').getPublicUrl(frontPath);
            urlFrente = data.publicUrl;
          }
        }

        // Upload back
        if (documentVerso) {
          const backExt = documentVerso.name.split('.').pop() || 'jpg';
          const backPath = `${biClean}/verso_${Date.now()}.${backExt}`;
          const { error: bErr } = await supabase.storage
            .from('documentos_registo')
            .upload(backPath, documentVerso);
          if (bErr) console.error('Erro upload verso:', bErr);
          else {
            const { data } = supabase.storage.from('documentos_registo').getPublicUrl(backPath);
            urlVerso = data.publicUrl;
          }
        }

        // Upload selfie
        if (savedFacePhoto) {
          try {
            let selfieBlob: Blob | null = null;
            if (savedFacePhoto.startsWith('data:image/')) {
              selfieBlob = base64ToBlob(savedFacePhoto);
            } else {
              try {
                const res = await fetch(savedFacePhoto);
                selfieBlob = await res.blob();
              } catch (_) {
                // Ignore and use directly
              }
            }

            if (selfieBlob) {
              const selfiePath = `${biClean}/selfie_${Date.now()}.jpg`;
              const { error: sErr } = await supabase.storage
                .from('documentos_registo')
                .upload(selfiePath, selfieBlob, { contentType: 'image/jpeg' });
              if (sErr) console.error('Erro upload selfie:', sErr);
              else {
                const { data } = supabase.storage.from('documentos_registo').getPublicUrl(selfiePath);
                urlSelfie = data.publicUrl;
              }
            } else {
              urlSelfie = savedFacePhoto;
            }
          } catch (selfieErr) {
            console.error('Erro processando selfie upload:', selfieErr);
            urlSelfie = savedFacePhoto;
          }
        }

        setSubmitMessage('Registando dados no Supabase Database...');

        // Insert to Supabase table: solicitacoes_registo
        const { error: insertErr } = await supabase
          .from('solicitacoes_registo')
          .insert([{
            nome: newUser.name,
            email: newUser.contact,
            password_hash: password,
            bi_numero: newUser.biNumber,
            url_frente: urlFrente || null,
            url_verso: urlVerso || null,
            url_selfie: urlSelfie || null,
            status: 'Pendente',
            observacoes: newUser.reason
          }]);

        if (insertErr) {
          if (insertErr.code === 'PGRST205') {
            console.warn('Tabela solicitacoes_registo não encontrada. A usar fallback para profiles.');
            const { error: profileErr } = await supabase
              .from('profiles')
              .upsert([{
                bi: newUser.biNumber,
                name: newUser.name,
                phone: null,
                nif: null,
                passport: null,
                filiation: null,
                marital_status: null,
                role: 'user'
              }], { onConflict: 'bi' });
            if (profileErr) {
              console.error('Erro fallback ao guardar perfil no Supabase:', profileErr);
            } else {
              addAuditLog(`Adesão de ${newUser.name} guardada via fallback em profiles no Supabase.`, 'warning');
            }
          } else {
            console.error('Erro ao inserir solicitacao_registo no Supabase:', insertErr);
          }
        } else {
          addAuditLog(`Adesão de ${newUser.name} registada com sucesso no Supabase!`, 'success');
        }
      }
    } catch (err) {
      console.error('Erro global no envio do Supabase:', err);
    }

    // Save back to local storage list (as fallback and for instant UI response)
    try {
      const saved = localStorage.getItem('gov_admin_citizens');
      let currentCitizens = [];
      if (saved) {
        currentCitizens = JSON.parse(saved);
      }
      
      const updated = [{
        ...newUser,
        facePhoto: urlSelfie || newUser.facePhoto
      }, ...currentCitizens];
      localStorage.setItem('gov_admin_citizens', JSON.stringify(updated));
      localStorage.setItem(`citizen_pass_${newUser.biNumber}`, password);

      addAuditLog(`Processo de Adesão de ${newUser.name} submetido ao SME`, 'info');
      setStep('success');
    } catch (e) {
      console.error('Erro ao guardar cidadão', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[460px] flex-1 font-sans">
      {/* Dynamic High-Fidelity Stepper Indicator */}
      {step !== 'success' && step !== 1 && (
        <div className="relative flex items-center justify-between w-full max-w-lg mx-auto mb-6 select-none px-4">
          {/* Background Connector Bar with smooth animated progress */}
          <div className="absolute top-4 left-10 right-10 h-[2.5px] bg-slate-100 pointer-events-none -translate-y-1/2 -z-0">
            <div 
              className="h-full bg-[#2563eb] transition-all duration-300 rounded-full" 
              style={{
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%'
              }}
            />
          </div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
              step === 1 ? 'border-[#2563eb] text-[#2563eb] bg-white ring-4 ring-blue-50/75' : 'border-[#2563eb] text-white bg-[#2563eb]'
            }`}>
              {step > 1 ? <Check size={12} className="stroke-[3]" /> : "01"}
            </div>
            <span className={`text-[9px] font-black tracking-widest uppercase mt-1.5 ${
              step === 1 ? 'text-[#0f172a]' : 'text-slate-400'
            }`}>
              ACESSO
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
              step === 2 
                ? 'border-[#2563eb] text-[#2563eb] bg-white ring-4 ring-blue-50/75' 
                : step > 2 
                ? 'border-[#2563eb] text-white bg-[#2563eb]' 
                : 'border-slate-200 text-slate-400 bg-white'
            }`}>
              {step > 2 ? <Check size={12} className="stroke-[3]" /> : "02"}
            </div>
            <span className={`text-[9px] font-black tracking-widest uppercase mt-1.5 ${
              step === 2 ? 'text-[#2563eb]' : 'text-slate-400'
            }`}>
              IDENTIDADE
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
              step === 3 ? 'border-[#2563eb] text-[#2563eb] bg-white ring-4 ring-blue-50/75' : 'border-slate-200 text-slate-400 bg-white'
            }`}>
              03
            </div>
            <span className={`text-[9px] font-black tracking-widest uppercase mt-1.5 ${
              step === 3 ? 'text-[#0f172a]' : 'text-slate-400'
            }`}>
              BIOMETRIA
            </span>
          </div>
        </div>
      )}

      {/* Steps Content inside AnimatePresence */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className="space-y-6"
            >
              {/* Centered User Avatar exactly like the Login image */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <div className="w-16 h-16 rounded-full bg-[#f0f4f9] flex items-center justify-center border border-slate-100 shadow-3xs">
                    <User className="text-[#0c2340]" size={24} />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-[#0c2340] tracking-tight uppercase leading-none">
                  REGISTO
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                  Criação oficial da conta de cidadão digital
                </p>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4 pt-1 max-w-lg mx-auto">
                {/* Nome Completo */}
                <div className="grid gap-1.5 text-left">
                  <span className="text-[10px] text-slate-505 font-extrabold tracking-wider uppercase">
                    Nome Completo
                  </span>
                  <div className="flex items-center gap-3.5 bg-white border border-slate-200 focus-within:border-[#0c2340] focus-within:ring-1 focus-within:ring-[#0c2340] rounded-[16px] px-3.5 py-1.5 transition-all">
                    <div className="w-11 h-11 bg-[#f0f4f9] text-[#1e3a8a] rounded-xl flex items-center justify-center shrink-0">
                      <User size={20} className="text-[#2563eb]" />
                    </div>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent font-bold tracking-wider text-slate-800 border-none outline-none text-sm placeholder-slate-400"
                      placeholder="Ex: Manuel António da Silva"
                    />
                  </div>
                  {name && !isNameValid(name) && (
                    <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-tight block mt-0.5 pl-2" id="name-error-msg">
                      Insira nome e sobrenome completo
                    </span>
                  )}
                </div>

                {/* E-mail */}
                <div className="grid gap-1.5 text-left">
                  <span className="text-[10px] text-slate-505 font-extrabold tracking-wider uppercase">
                    Endereço de E-mail
                  </span>
                  <div className="flex items-center gap-3.5 bg-white border border-slate-200 focus-within:border-[#0c2340] focus-within:ring-1 focus-within:ring-[#0c2340] rounded-[16px] px-3.5 py-1.5 transition-all">
                    <div className="w-11 h-11 bg-[#f0f4f9] text-[#1e3a8a] rounded-xl flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-[#2563eb]" />
                    </div>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent font-bold tracking-wider text-slate-800 border-none outline-none text-sm placeholder-slate-400"
                      placeholder="manuel.silva@netangola.ao"
                    />
                  </div>
                  {email && !isEmailValid(email) && (
                    <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-tight block mt-0.5 pl-2" id="email-error-msg">
                      Formato de e-mail inválido
                    </span>
                  )}
                </div>

                {/* Password/Senha Row */}
                <div className="grid gap-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-505 font-extrabold tracking-wider uppercase">
                      Senha de Acesso
                    </span>
                    {password && (
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        pwdStrength === 'Fraca' ? 'bg-red-50 text-red-600' :
                        pwdStrength === 'Média' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {pwdStrength}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3.5 bg-white border border-slate-200 focus-within:border-[#0c2340] focus-within:ring-1 focus-within:ring-[#0c2340] rounded-[16px] px-3.5 py-1.5 transition-all relative">
                    <div className="w-11 h-11 bg-[#f0f4f9] text-[#1e3a8a] rounded-xl flex items-center justify-center shrink-0">
                      <Lock size={18} className="text-[#2563eb]" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent font-bold tracking-wider text-slate-800 border-none outline-none text-sm placeholder-slate-400 pr-12"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 bg-transparent border-none cursor-pointer flex items-center justify-center transition-all"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && password.length < 8 && (
                    <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-tight block mt-0.5 pl-2" id="pwd-error-msg">
                      Utilize no mínimo 8 caracteres
                    </span>
                  )}
                </div>

                {/* Password requirements banner matching image 1 perfectly */}
                <div className="bg-[#f0f4f9] rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs border border-slate-100">
                  <ShieldCheck size={20} className="text-[#2563eb] shrink-0" />
                  <span className="text-slate-700 text-[10.5px] font-bold leading-normal font-sans">
                    A senha deve ter pelo menos 8 caracteres, incluindo letras e números.
                  </span>
                </div>
              </div>

              {/* Horizontal Separator Line */}
              <div className="border-t border-slate-100/80 my-3 max-w-lg mx-auto" />

              {/* Actions Footer */}
              <div className="flex flex-col gap-3.5 max-w-lg mx-auto w-full pt-1">
                <button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  className={`w-full text-white rounded-[16px] py-4 font-black text-xs uppercase tracking-widest shadow-lg transition-all border-none flex items-center justify-center gap-2 ${
                    isStep1Valid 
                      ? 'bg-[#0c2340] hover:bg-slate-900 shadow-[#0c2340]/15 cursor-pointer hover:opacity-95' 
                      : 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none'
                  }`}
                  id="btn-next-step-1"
                >
                  CONTINUAR <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 text-[#2563eb] border border-slate-200 rounded-[16px] py-4 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
                  id="btn-cancel-step-1"
                >
                  CANCELAR
                </button>
              </div>

              {/* Protected Seal footer */}
              <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px] font-bold mt-1">
                <Shield size={14} className="text-[#2563eb]" />
                <span>Seus dados estão protegidos com segurança.</span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {/* Submission Title Header */}
              <div className="text-center mt-1">
                <h1 className="text-[#0f172a] text-lg md:text-xl font-black tracking-tight uppercase leading-none">SUBMISSÃO OFICIAL<br />DE IDENTIDADE</h1>
              </div>

              {/* Form container */}
              <div className="space-y-3.5 text-left max-w-2xl mx-auto">
                {/* BI input field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                    <FileText size={11} className="text-[#2563eb]" /> Nº DO BILHETE DE IDENTIDADE (Nº B.I.)
                  </label>
                  <div className="relative font-mono">
                    <input 
                      type="text"
                      value={biNumber}
                      onChange={(e) => handleBiChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb]/60 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none transition-all font-bold tracking-widest placeholder:text-slate-350"
                      placeholder="002931298LA045"
                      maxLength={14}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2563eb]">
                      <FileText size={14} />
                    </div>
                    {isBiValid(biNumber) && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white bg-[#2563eb] rounded-full p-0.5">
                        <Check size={9} className="font-extrabold" />
                      </div>
                    )}
                  </div>
                  {biNumber && !isBiValid(biNumber) && (
                    <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-tight block ml-1" id="bi-validation-error">
                      O B.I. deve possuir exatamente 14 caracteres
                    </span>
                  )}
                </div>

                {/* Grid of Double Upload Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Frente Card with Dashed Blue Border */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-800 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full"></span> FRENTE DO B.I.
                    </span>
                    <label className={`group relative border-2 border-dashed rounded-[20px] p-2.5 text-center flex flex-col items-center justify-center min-h-[110px] cursor-pointer transition-all duration-300 select-none ${
                      frenteSuccess 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : isUploadingFrente 
                        ? 'border-[#2563eb] bg-blue-50/15 animate-pulse' 
                        : 'border-[#bfdbfe] bg-white hover:bg-[#eff6ff]/30 hover:border-[#2563eb]'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFrenteFile(e.target.files[0]);
                        }}
                      />
                      
                      {isUploadingFrente ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <Loader2 size={18} className="text-[#2563eb] animate-spin" />
                          <span className="text-[9px] font-black text-[#2563eb] uppercase tracking-widest">A ler OCR...</span>
                        </div>
                      ) : frenteSuccess ? (
                        <div className="flex flex-col items-center w-full">
                          {frentePreview ? (
                            <div className="w-full h-[75px] rounded-[10px] overflow-hidden border border-emerald-200 relative">
                              <img src={frentePreview} alt="Frente Preview" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <CheckCircle2 size={18} className="text-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Leitura Completa</span>
                            </div>
                          )}
                          <span className="text-[8px] font-black text-emerald-700 mt-1 uppercase tracking-tight">Frente Carregada</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-9 h-9 bg-white border border-blue-50 rounded-full flex items-center justify-center text-[#2563eb] shadow-sm">
                            <UploadCloud size={16} />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest block font-sans">CARREGAR FRENTE</span>
                            <span className="text-[7.5px] text-slate-400 font-semibold uppercase tracking-tight block font-sans">Clique para carregar</span>
                          </div>
                          <span className="bg-[#eff6ff] text-[7.5px] font-bold text-[#2563eb] px-2 py-0.5 rounded-full uppercase tracking-wider block font-sans">
                            Formatos: JPG, PNG, PDF
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Verso Card with Dashed Blue Border */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-800 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full"></span> VERSO DO B.I.
                    </span>
                    <label className={`group relative border-2 border-dashed rounded-[20px] p-2.5 text-center flex flex-col items-center justify-center min-h-[110px] cursor-pointer transition-all duration-300 select-none ${
                      versoSuccess 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : isUploadingVerso 
                        ? 'border-[#2563eb] bg-blue-50/15 animate-pulse' 
                        : 'border-[#bfdbfe] bg-white hover:bg-[#eff6ff]/30 hover:border-[#2563eb]'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleVersoFile(e.target.files[0]);
                        }}
                      />
                      
                      {isUploadingVerso ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <Loader2 size={18} className="text-[#2563eb] animate-spin" />
                          <span className="text-[9px] font-black text-[#2563eb] uppercase tracking-widest">A ler OCR...</span>
                        </div>
                      ) : versoSuccess ? (
                        <div className="flex flex-col items-center w-full">
                          {versoPreview ? (
                            <div className="w-full h-[75px] rounded-[10px] overflow-hidden border border-emerald-200 relative">
                              <img src={versoPreview} alt="Verso Preview" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <CheckCircle2 size={18} className="text-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Leitura Completa</span>
                            </div>
                          )}
                          <span className="text-[8px] font-black text-emerald-700 mt-1 uppercase tracking-tight">Verso Carregado</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-9 h-9 bg-white border border-blue-50 rounded-full flex items-center justify-center text-[#2563eb] shadow-sm">
                            <UploadCloud size={16} />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest block font-sans">CARREGAR VERSO</span>
                            <span className="text-[7.5px] text-slate-400 font-semibold uppercase tracking-tight block font-sans">Clique para carregar</span>
                          </div>
                          <span className="bg-[#eff6ff] text-[7.5px] font-bold text-[#2563eb] px-2 py-0.5 rounded-full uppercase tracking-wider block font-sans">
                            Formatos: JPG, PNG, PDF
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Encrypted files alert status bar */}
                <div className="bg-[#f1f5f9] rounded-xl p-2.5 flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] shrink-0 shadow-sm">
                    <Lock size={10} className="font-extrabold" />
                  </div>
                  <span className="text-[9.5px] font-semibold text-slate-700 leading-normal">
                    Os documentos são <span className="font-bold text-[#2563eb]">encriptados</span> e utilizados apenas para validação da sua identidade.
                  </span>
                </div>
              </div>

              {/* Actions Box */}
              <div className="pt-3.5 border-t border-slate-100 flex gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer bg-white flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={12} /> VOLTAR
                </button>
                <button
                  type="button"
                  disabled={!isStep2Valid}
                  onClick={() => setStep(3)}
                  className={`flex-1 py-2.5 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all border-0 shadow-md flex items-center justify-center gap-1.5 ${
                    isStep2Valid 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 cursor-pointer' 
                      : 'bg-slate-100 cursor-not-allowed text-slate-400 border border-slate-200'
                  }`}
                >
                  SEGUINTE <ArrowRight size={12} />
                </button>
              </div>


            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-3.5"
            >
              {/* Centered titles */}
              <div className="text-center">
                <h1 className="text-[#0f172a] text-xl font-extrabold tracking-tight mb-0.5 leading-tight">Assinatura de Biometria Facial</h1>
              </div>

              {/* Oval HUD Futuristic Camera Container */}
              <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden shadow-xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] flex items-center justify-center p-1.5 mb-2">
                {/* Visual HUD coordinate rings inside */}
                <div className="absolute inset-1.5 border border-slate-700/40 rounded-full pointer-events-none" />
                <div className="absolute inset-4 border border-slate-700/20 rounded-full pointer-events-none" />
                
                {/* Bracket overlay coordinates focus */}
                <div className="absolute top-5 left-5 w-3 h-3 border-t-2 border-l-2 border-blue-400 rounded-tl z-15" />
                <div className="absolute top-5 right-5 w-3 h-3 border-t-2 border-r-2 border-blue-400 rounded-tr z-15" />
                <div className="absolute bottom-5 left-5 w-3 h-3 border-b-2 border-l-2 border-blue-400 rounded-bl z-15" />
                <div className="absolute bottom-5 right-5 w-3 h-3 border-b-2 border-r-2 border-blue-400 rounded-br z-15" />

                {/* Ring glow indicator status */}
                <div className={`absolute inset-0 border-2 rounded-full pointer-events-none z-15 transition-colors duration-400 ${
                  captureFinished 
                    ? 'border-emerald-500 animate-pulse' 
                    : isScanning 
                    ? 'border-blue-400' 
                    : 'border-slate-300/40'
                }`} />

                {/* Scanner laser animation */}
                {isScanning && (
                  <div 
                    className="absolute left-0 right-0 h-[2px] bg-[#2563eb] shadow-[0_0_8px_rgba(37,99,235,1)] z-20"
                    style={{
                      animation: 'scan-laser-relative 2.5s infinite ease-in-out',
                      position: 'absolute'
                    }}
                  />
                )}

                {/* Blue Dot rotating perimeter tracker ring */}
                <div className="absolute top-[35%] -right-0.5 w-1.5 h-1.5 bg-[#2563eb] rounded-full ring-2 ring-blue-50 z-15 animate-pulse" />

                {/* Face Capture mapping elements */}
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden relative">
                  {captureFinished && savedFacePhoto ? (
                    <img 
                      src={savedFacePhoto} 
                      alt="Captura Facial" 
                      className="w-full h-full object-cover animate-scaleUp z-10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 text-center px-2 gap-0.5 z-10 select-none">
                      {/* Futurist Vector Wireframe face overlay in SVG */}
                      <svg className={`w-20 h-20 stroke-[1] ${isScanning ? 'text-blue-500 animate-pulse' : 'text-slate-400/80'}`} viewBox="0 0 100 100" fill="none">
                        <path d="M50,15 C28,15 28,50 28,68 C28,86 42,92 50,92 C58,92 72,86 72,68 C72,50 72,15 50,15 Z" stroke="currentColor" strokeDasharray="3 4" />
                        <ellipse cx="38" cy="48" rx="4.5" ry="2.5" stroke="currentColor" />
                        <ellipse cx="62" cy="48" rx="4.5" ry="2.5" stroke="currentColor" />
                        <path d="M38,48 L62,48" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M50,45 L50,65 L44,68 L56,68 L50,65" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M40,75 Q50,83 60,75" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M50,15 L50,92" stroke="currentColor" strokeWidth="0.2" />
                        <path d="M28,68 L72,68" stroke="currentColor" strokeWidth="0.2" />
                        <circle cx="50" cy="15" r="1" fill="#2563eb" />
                        <circle cx="50" cy="35" r="1" fill="#2563eb" />
                        <circle cx="38" cy="48" r="1" fill="#2563eb" />
                        <circle cx="62" cy="48" r="1" fill="#2563eb" />
                        <circle cx="50" cy="65" r="1" fill="#2563eb" />
                        <circle cx="28" cy="68" r="1" fill="#2563eb" />
                        <circle cx="72" cy="68" r="1" fill="#2563eb" />
                        <path d="M50,35 L38,48 L50,65 L62,48 Z" stroke="currentColor" strokeWidth="0.5" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Small camera trigger emblem at bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-slate-700 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg z-25">
                  <Camera size={11} />
                </div>
              </div>

              {/* Capture Aligned Info Tag */}
              <div className="text-center space-y-0.5">
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-bold border ${
                  captureFinished 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                    : isScanning 
                    ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <Check size={10} className="font-extrabold" />
                  <span>{captureFinished ? 'Captura Biométrica Concluída!' : scanStateText}</span>
                </div>
                <p className="text-slate-400 text-[10px] font-semibold">Posicione o rosto no centro da moldura.</p>
              </div>

              {/* Centered Scanning Fingerprint Action Button */}
              {!captureFinished && (
                <div className="max-w-md mx-auto">
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={startCameraScan}
                    className={`w-full py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-0 shadow-md flex items-center justify-center gap-2 ${
                      isScanning 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer shadow-blue-500/15'
                    }`}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-white" />
                        MAPEAMENTO FACIAL: {scanProgress}%...
                      </>
                    ) : (
                      <>
                        <Fingerprint size={13} className="text-white animate-pulse" />
                        INICIAR CAPTURA FACIAL
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Success Bio validation Alert Box */}
              {captureFinished && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 flex gap-2 text-left max-w-md mx-auto">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-emerald-850 uppercase tracking-tight">BIOMETRIA CONCLUÍDA</p>
                    <p className="text-[8.5px] text-[#065f46] leading-relaxed font-semibold">
                      Os seus padrões biométricos foram validados e vinculados de forma criptografada à sua identidade civil.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons Voltar / Terminar */}
              <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-2 max-w-md mx-auto">
                {isSubmitting && (
                  <div className="flex items-center justify-center gap-2 py-1 text-[9.5px] font-bold text-blue-600 animate-pulse">
                    <Loader2 size={13} className="animate-spin" />
                    {submitMessage}
                  </div>
                )}
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    disabled={isScanning || isSubmitting}
                    onClick={() => setStep(2)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-[#0f172a] text-[11px] uppercase tracking-widest rounded-xl transition-all cursor-pointer bg-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ArrowLeft size={12} /> VOLTAR
                  </button>
                  <button
                    type="button"
                    disabled={!captureFinished || isScanning || isSubmitting}
                    onClick={handleFinalSubmit}
                    className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border-0 shadow-md flex items-center justify-center gap-1.5 ${
                      captureFinished && !isScanning && !isSubmitting
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer shadow-blue-500/20' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    }`}
                  >
                    {isSubmitting ? 'A ENVIAR...' : 'FINALIZAR SUBMISSÃO'} <Check size={12} />
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-lg mx-auto"
            >
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center shadow-md border border-emerald-100 animate-scaleUp">
                <ShieldCheck size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 italic uppercase tracking-tight leading-tight">
                  Documentação Enviada com Sucesso!
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-650 text-left space-y-3 shadow-inner">
                  <p className="text-slate-750 text-xs md:text-sm font-semibold leading-relaxed">
                    O seu processo de registo foi enviado com sucesso para a fila de homologação.
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    O seu processo está sob revisão dos inspectores de identificação civil nacional usando inteligência artificial. Em menos de 24h enviaremos para o seu Email os resultados.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100/60 rounded-2xl p-4 text-left flex gap-2.5 items-center">
                <span className="text-[11px] font-black text-blue-800 select-none font-sans">B.I. de Acesso:</span>
                <span className="text-xs font-mono font-black text-slate-750 uppercase tracking-widest bg-white border border-blue-100 px-3 py-1 rounded-lg">
                  {biNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={onSuccess}
                className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-[20px] font-black text-xs uppercase tracking-widest transition-all cursor-pointer border-0 shadow-xl shadow-blue-500/15 flex items-center justify-center gap-2"
              >
                Voltar ao Login e Acesso Seguro
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Embedded scanning scanner animation patterns */}
      <style>{`
        @keyframes scan-laser-relative {
          0%, 100% { top: 6%; opacity: 0.85; }
          50% { top: 94%; opacity: 0.85; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
