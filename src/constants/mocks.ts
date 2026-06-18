/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  SessionUser, 
  ActiveProfile, 
  AppMode, 
  Institution, 
  InstitutionCategory, 
  InstitutionStatus,
  Message, 
  Document, 
  Contact, 
  Slide, 
  AppNotification,
  UserRequest,
  DocRequest,
  Correspondence,
  DigitalProtocol
} from '../types';

// ==========================================
// 1. SESSION DOMAIN
// ==========================================
export const MOCK_SESSION_USER: SessionUser = {
  id: "USR-009874562-EDL",
  name: "Edlasio Galhardo",
  firstName: "Edlasio",
  lastName: "Galhardo",
  bi: "009874562LA041",
  nif: "5401329188",
  passport: "AO-P129384",
  phone: "+244 923 000 111",
  email: "edlasio.galhardo@gmail.com",
  birthDate: "12/03/1995",
  filiation: "António Galhardo & Maria Conceição",
  maritalStatus: "Solteiro",
  avatarUrl: "https://i.postimg.cc/sxWsYGX2/Foto-Edlasio.png", // Consistent premium photo
  verificationLevel: "Totalmente Verificado",
  confidenceScore: 98,
  lastAccess: "Hoje às 18:45"
};

export const MOCK_SESSION_PROFILES: Record<AppMode, ActiveProfile> = {
  user: {
    mode: "user",
    role: "Cidadão Autenticado",
    permissions: ["read_documents", "request_documents", "receive_correspondence", "manage_contacts"],
  },
  institution: {
    mode: "institution",
    role: "Gestor de Contas Digital",
    institutionName: "Administração Geral Tributária (AGT)",
    departmentName: "Direcção de Atendimento e Fiscalização Digital",
    permissions: ["read_institution_data", "issue_correspondence", "validate_documents", "manage_operations"],
  },
  admin: {
    mode: "admin",
    role: "Administrador de Sistemas Geral",
    institutionName: "Direcção de Tecnologia e Segurança Digital do Estado",
    departmentName: "Gabinete de Operações de Segurança (SOC)",
    permissions: ["all_access", "audit_logs", "system_controls", "emergency_trigger", "admin_workers"],
  }
};

// ==========================================
// 2. INSTITUTIONS DOMAIN
// ==========================================
export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: "inst-agt",
    name: "AGT",
    fullName: "Administração Geral Tributária",
    category: InstitutionCategory.FINANCAS,
    province: "Luanda",
    municipio: "Ingombota",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 342400,
    totalAgents: 45,
    lastActivity: "Há 1 min",
    responseRate: "97.5%",
    registrationDate: "10/01/2025",
    aiUsageRate: "94%",
    performanceScore: "98.5%",
    contactEmail: "geral@agt.gov.ao",
    contactPhone: "+244 923 111 222",
    responsibleName: "Dr. Francisco Manuel",
    responsibleRole: "Presidente do Conselho de Administração",
    instCode: "AGT-001",
    typeInst: "Administração Geral",
    cidade: "Luanda (Capital)",
    comuna: "Maculusso"
  },
  {
    id: "inst-sme",
    name: "SME",
    fullName: "Serviço de Migração e Estrangeiros",
    category: InstitutionCategory.SEGURANCA,
    province: "Luanda",
    municipio: "Maianga",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 198250,
    totalAgents: 32,
    lastActivity: "Há 4 mins",
    responseRate: "94.2%",
    registrationDate: "15/02/2025",
    aiUsageRate: "88%",
    performanceScore: "95.0%",
    contactEmail: "geral@sme.gov.ao",
    contactPhone: "+244 923 000 000",
    responsibleName: "Dr. António Fernando",
    responsibleRole: "Director Geral",
    instCode: "SME-001",
    typeInst: "Serviço Público Regular",
    cidade: "Luanda (Capital)",
    comuna: "Maianga Sede"
  },
  {
    id: "inst-ende",
    name: "ENDE",
    fullName: "Empresa Nacional de Distribuição de Electricidade",
    category: InstitutionCategory.INFRAESTRUTURA,
    province: "Benguela",
    municipio: "Lobito",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 92100,
    totalAgents: 18,
    lastActivity: "Há 18 mins",
    responseRate: "89.0%",
    registrationDate: "01/03/2025",
    aiUsageRate: "76%",
    performanceScore: "88.5%",
    contactEmail: "suporte@ende.ao",
    contactPhone: "+244 912 345 678",
    responsibleName: "Dr. Manuel Rebelo",
    responsibleRole: "Administrador Executivo",
    instCode: "ENDE-002",
    typeInst: "Empresa Pública",
    cidade: "Lobito",
    comuna: "Lobito Sede"
  },
  {
    id: "inst-epal",
    name: "EPAL",
    fullName: "Empresa Pública de Águas de Luanda",
    category: InstitutionCategory.INFRAESTRUTURA,
    province: "Luanda",
    municipio: "Viana",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 84300,
    totalAgents: 12,
    lastActivity: "Há 22 mins",
    responseRate: "91.8%",
    registrationDate: "12/03/2025",
    aiUsageRate: "82%",
    performanceScore: "91.0%",
    contactEmail: "geral@epal.gov.ao",
    contactPhone: "+244 924 999 888",
    responsibleName: "Engª. Maria da Luz",
    responsibleRole: "Directora de Operações",
    instCode: "EPAL-001",
    typeInst: "Empresa Pública",
    cidade: "Viana",
    comuna: "Viana Sede"
  },
  {
    id: "inst-minjus",
    name: "MINJUS",
    fullName: "Ministério da Justiça e dos Direitos Humanos",
    category: InstitutionCategory.JUSTICA,
    province: "Huíla",
    municipio: "Lubango",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 184200,
    totalAgents: 28,
    lastActivity: "Há 8 mins",
    responseRate: "98.2%",
    registrationDate: "20/01/2025",
    aiUsageRate: "91%",
    performanceScore: "97.8%",
    contactEmail: "contacto@minjusdh.gov.ao",
    contactPhone: "+244 921 555 333",
    responsibleName: "Dr. Alberto António",
    responsibleRole: "Delegado Provincial",
    instCode: "MINJUS-005",
    typeInst: "Ministério",
    cidade: "Lubango (Capital)",
    comuna: "Lubango Sede"
  },
  {
    id: "inst-minsa",
    name: "MINSA",
    fullName: "Ministério da Saúde",
    category: InstitutionCategory.SAUDE,
    province: "Huambo",
    municipio: "Huambo",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 112400,
    totalAgents: 22,
    lastActivity: "Há 25 mins",
    responseRate: "92.5%",
    registrationDate: "05/04/2025",
    aiUsageRate: "84%",
    performanceScore: "92.1%",
    contactEmail: "provincial@minsa.gov.ao",
    contactPhone: "+244 922 888 777",
    responsibleName: "Dra. Isabel Cândida",
    responsibleRole: "Directora Clínica",
    instCode: "MINSA-002",
    typeInst: "Ministério",
    cidade: "Huambo (Capital)",
    comuna: "Huambo Sede"
  },
  {
    id: "inst-pna",
    name: "PNA",
    fullName: "Polícia Nacional de Angola",
    category: InstitutionCategory.SEGURANCA,
    province: "Cabinda",
    municipio: "Cabinda",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 76500,
    totalAgents: 15,
    lastActivity: "Há 2 dias",
    responseRate: "85.4%",
    registrationDate: "18/02/2025",
    aiUsageRate: "65%",
    performanceScore: "84.0%",
    contactEmail: "cabinda@pna.gov.ao",
    contactPhone: "+244 923 444 555",
    responsibleName: "Subcomissário João Bento",
    responsibleRole: "Comandante Provincial",
    instCode: "PNA-010",
    typeInst: "Força de Segurança",
    cidade: "Cabinda (Capital)",
    comuna: "Cabinda Sede"
  },
  {
    id: "inst-inss",
    name: "INSS",
    fullName: "Instituto Nacional de Segurança Social",
    category: InstitutionCategory.SERVICOS,
    province: "Luanda",
    municipio: "Cazenga",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 154200,
    totalAgents: 24,
    lastActivity: "Há 3 horas",
    responseRate: "93.0%",
    registrationDate: "12/03/2024",
    aiUsageRate: "79%",
    performanceScore: "94.2%",
    contactEmail: "suporte@inss.gov.ao",
    contactPhone: "+244 932 777 666",
    responsibleName: "Dra. Paula de Carvalho",
    responsibleRole: "Directora de Prestações",
    instCode: "INSS-001",
    typeInst: "Instituto Público",
    cidade: "Luanda (Capital)",
    comuna: "Cazenga Sede"
  },
  {
    id: "inst-cne",
    name: "CNE",
    fullName: "Comissão Nacional Eleitoral",
    category: InstitutionCategory.SERVICOS,
    province: "Luanda",
    municipio: "Ingombota",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 45000,
    totalAgents: 10,
    lastActivity: "Há 1 semana",
    responseRate: "90.0%",
    registrationDate: "22/07/2024",
    aiUsageRate: "45%",
    performanceScore: "89.5%",
    contactEmail: "apoio@cne.ao",
    contactPhone: "+244 925 111 222",
    responsibleName: "Dr. Manuel da Silva",
    responsibleRole: "Delegado Nacional",
    instCode: "CNE-001",
    typeInst: "Órgão Independente",
    cidade: "Luanda (Capital)",
    comuna: "Ingombota Sede"
  },
  {
    id: "inst-registocivil",
    name: "Registo Civil",
    fullName: "Conservatória do Registo Civil de Belas",
    category: InstitutionCategory.JUSTICA,
    province: "Luanda",
    municipio: "Belas",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 167800,
    totalAgents: 30,
    lastActivity: "Há 12 mins",
    responseRate: "96.4%",
    registrationDate: "14/01/2024",
    aiUsageRate: "89%",
    performanceScore: "95.5%",
    contactEmail: "registo.civil.belas@minjus.gov.ao",
    contactPhone: "+244 933 444 333",
    responsibleName: "Dra. Maria Fernanda",
    responsibleRole: "Conservadora Geral",
    instCode: "RC-002",
    typeInst: "Conservatória",
    cidade: "Luanda",
    comuna: "Talatona"
  },
  {
    id: "inst-notariado",
    name: "Notariado",
    fullName: "Repartição de Notariado de Luanda",
    category: InstitutionCategory.JUSTICA,
    province: "Luanda",
    municipio: "Maianga",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 89000,
    totalAgents: 14,
    lastActivity: "Há 45 mins",
    responseRate: "92.0%",
    registrationDate: "20/02/2024",
    aiUsageRate: "70%",
    performanceScore: "91.2%",
    contactEmail: "notariado.maianga@minjus.gov.ao",
    contactPhone: "+244 927 000 888",
    responsibleName: "Dr. Carlos de Matos",
    responsibleRole: "Notário Público do Estado",
    instCode: "NOT-001",
    typeInst: "Notariado",
    cidade: "Luanda",
    comuna: "Maianga Central"
  },
  {
    id: "inst-tribunalcomarca",
    name: "Tribunal de Comarca",
    fullName: "Tribunal de Comarca de Luanda",
    category: InstitutionCategory.JUSTICA,
    province: "Luanda",
    municipio: "Talatona",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 184500,
    totalAgents: 40,
    lastActivity: "Há 15 mins",
    responseRate: "95.1%",
    registrationDate: "05/01/2024",
    aiUsageRate: "85%",
    performanceScore: "96.0%",
    contactEmail: "comarca.luanda@tribunais.gov.ao",
    contactPhone: "+244 929 111 999",
    responsibleName: "Dr. Adalberto Costa",
    responsibleRole: "Juiz Presidente de Comarca",
    instCode: "TRIB-CO-001",
    typeInst: "Tribunal de Justiça",
    cidade: "Luanda (Capital)",
    comuna: "Talatona Sede"
  },
  {
    id: "inst-universidadepub",
    name: "Universidade Pública",
    fullName: "Universidade Agostinho Neto (UAN)",
    category: InstitutionCategory.EDUCACAO,
    province: "Luanda",
    municipio: "Belas",
    status: InstitutionStatus.ATIVA,
    totalCorrespondence: 120500,
    totalAgents: 65,
    lastActivity: "Há 2 horas",
    responseRate: "87.8%",
    registrationDate: "10/05/2024",
    aiUsageRate: "62%",
    performanceScore: "89.0%",
    contactEmail: "reitoria@uan.ao",
    contactPhone: "+244 931 222 333",
    responsibleName: "Dr. João Sebastião",
    responsibleRole: "Reitor Académico",
    instCode: "UAN-001",
    typeInst: "Instituição de Ensino Superior",
    cidade: "Luanda (Capital)",
    comuna: "Campus Universitário"
  }
];

// ==========================================
// 3. USERS DOMAIN (Registered accounts)
// ==========================================
export interface MockUserEntity {
  id: string;
  name: string;
  email: string;
  bi: string;
  nif: string;
  role: 'citizen' | 'worker' | 'admin';
  avatarUrl: string;
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  lastLogin: string;
}

export const MOCK_USERS: MockUserEntity[] = [
  {
    id: "USR-009874562-EDL",
    name: "Edlasio Galhardo",
    email: "edlasio.galhardo@gmail.com",
    bi: "009874562LA041",
    nif: "5401329188",
    role: "citizen",
    avatarUrl: "https://i.postimg.cc/sxWsYGX2/Foto-Edlasio.png",
    status: "Ativo",
    lastLogin: "Hoje às 18:45"
  },
  {
    id: "usr-maria",
    name: "Maria Antónia",
    email: "maria.antonia@gmail.com",
    bi: "008812342LA011",
    nif: "5412889311",
    role: "citizen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    status: "Ativo",
    lastLogin: "Ontem às 10:20"
  },
  {
    id: "usr-jose",
    name: "José Kalunga",
    email: "jose.kalunga@gmail.com",
    bi: "007712342LA021",
    nif: "5412889422",
    role: "citizen",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    status: "Ativo",
    lastLogin: "Hoje às 11:15"
  },
  {
    id: "usr-ana",
    name: "Ana Baptista",
    email: "ana.baptista@gmail.com",
    bi: "009991332LA018",
    nif: "5412889533",
    role: "citizen",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    status: "Pendente",
    lastLogin: "Há 3 dias"
  },
  {
    id: "usr-carlos",
    name: "Carlos Manuel",
    email: "carlos.manuel@outlook.com",
    bi: "001122334LA055",
    nif: "5412889644",
    role: "citizen",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
    status: "Ativo",
    lastLogin: "Ontem às 15:30"
  },
  {
    id: "usr-beatriz",
    name: "Beatriz Costa",
    email: "beatriz.costa@hotmail.com",
    bi: "002233445LA066",
    nif: "5412889755",
    role: "citizen",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    status: "Ativo",
    lastLogin: "Ontem às 17:10"
  },
  {
    id: "usr-antonio",
    name: "António Lopes",
    email: "antonio.lopes@gmail.com",
    bi: "003344556LA077",
    nif: "5412889866",
    role: "citizen",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150",
    status: "Ativo",
    lastLogin: "Há 4 dias"
  }
];

// ==========================================
// 4. CITIZENS DOMAIN (Civil Identities)
// ==========================================
export interface MockCitizenEntity {
  bi: string;
  nif: string;
  passport: string;
  fullName: string;
  birthDate: string;
  filiation: string;
  maritalStatus: string;
  phone: string;
  email: string;
  municipio: string;
  province: string;
  verificationLevel: string;
  confidenceScore: number;
}

export const MOCK_CITIZENS: MockCitizenEntity[] = [
  {
    bi: "009874562LA041",
    nif: "5401329188",
    passport: "AO-P129384",
    fullName: "Edlasio Galhardo",
    birthDate: "12/03/1995",
    filiation: "António Galhardo & Maria Conceição",
    maritalStatus: "Solteiro",
    phone: "+244 923 000 111",
    email: "edlasio.galhardo@gmail.com",
    municipio: "Maianga",
    province: "Luanda",
    verificationLevel: "Totalmente Verificado",
    confidenceScore: 98
  },
  {
    bi: "008812342LA011",
    nif: "5412889311",
    passport: "AO-P238491",
    fullName: "Maria Antónia",
    birthDate: "24/09/1988",
    filiation: "Manuel Francisco & Ana Antónia",
    maritalStatus: "Casada",
    phone: "+244 924 111 222",
    email: "maria.antonia@gmail.com",
    municipio: "Ingombota",
    province: "Luanda",
    verificationLevel: "Totalmente Verificado",
    confidenceScore: 95
  },
  {
    bi: "007712342LA021",
    nif: "5412889422",
    passport: "AO-P349502",
    fullName: "José Kalunga",
    birthDate: "05/11/1982",
    filiation: "Pedro Kalunga & Filomena Kalunga",
    maritalStatus: "Casado",
    phone: "+244 912 333 444",
    email: "jose.kalunga@gmail.com",
    municipio: "Cazenga",
    province: "Luanda",
    verificationLevel: "Totalmente Verificado",
    confidenceScore: 92
  },
  {
    bi: "009991332LA018",
    nif: "5412889533",
    passport: "AO-P459613",
    fullName: "Ana Baptista",
    birthDate: "15/07/1993",
    filiation: "Mateus Baptista & Sara Baptista",
    maritalStatus: "Solteira",
    phone: "+244 933 555 666",
    email: "ana.baptista@gmail.com",
    municipio: "Viana",
    province: "Luanda",
    verificationLevel: "Pendente",
    confidenceScore: 78
  },
  {
    bi: "001122334LA055",
    nif: "5412889644",
    passport: "AO-P569724",
    fullName: "Carlos Manuel",
    birthDate: "02/02/1990",
    filiation: "João Manuel & Marta Manuel",
    maritalStatus: "Divorciado",
    phone: "+244 921 777 888",
    email: "carlos.manuel@outlook.com",
    municipio: "Maianga",
    province: "Luanda",
    verificationLevel: "Totalmente Verificado",
    confidenceScore: 96
  }
];

// ==========================================
// 5. WORKERS DOMAIN (Administrative Officers)
// ==========================================
export interface MockWorkerEntity {
  id: string;
  name: string;
  email: string;
  institutionId: string; // Relational link to institution
  role: string;
  avatarUrl: string;
  lastActive: string;
}

export const MOCK_WORKERS: MockWorkerEntity[] = [
  {
    id: "WRK-AGT-01",
    name: "Dr. Francisco Manuel",
    email: "francisco.manuel@agt.gov.ao",
    institutionId: "inst-agt",
    role: "Presidente do Conselho",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
    lastActive: "Há 1 min"
  },
  {
    id: "WRK-SME-01",
    name: "Dr. António Fernando",
    email: "antonio.fernando@sme.gov.ao",
    institutionId: "inst-sme",
    role: "Director Geral",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    lastActive: "Há 4 mins"
  },
  {
    id: "WRK-ENDE-01",
    name: "Dr. Manuel Rebelo",
    email: "manuel.rebelo@ende.ao",
    institutionId: "inst-ende",
    role: "Adm. Executivo",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    lastActive: "Há 18 mins"
  },
  {
    id: "WRK-EPAL-01",
    name: "Engª. Maria da Luz",
    email: "maria.luz@epal.gov.ao",
    institutionId: "inst-epal",
    role: "Directora de Operações",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    lastActive: "Há 22 mins"
  }
];

// ==========================================
// 6. CORRESPONDENCES DOMAIN (Unified Emails/Mails)
// ==========================================
export const MOCK_CORRESPONDENCES: Message[] = [
  {
    id: 1,
    org: "AGT",
    preview: "Imposto pendente no valor de 18.500 Kz com prazo definido.",
    date: "09:10",
    unread: 1,
    status: "Urgente",
    details: {
      subject: "Pagamento Pendente IPU",
      body: "Foi identificado um imposto pendente no seu registro fiscal referente ao exercício anterior no valor de 18.500 Kz.\nEste valor inclui taxas de serviço governamentais e eventuais multas aplicadas pelo atraso na regularização voluntária.\nPedimos que efetue o pagamento o mais breve possível para evitar a aplicação de juros de mora adicionais sobre o montante.\nO pagamento pode ser realizado através de qualquer canal bancário utilizando a referência que será gerada no sistema.\nApós a liquidação, o seu certificado de conformidade fiscal será atualizado de forma automática no portal oficial.",
      deadline: "25 de Maio de 2026",
      state: "Pagamento pendente",
      actions: ["Ver detalhes", "Gerar referencia", "Efetuar pagamento"],
    },
    sensitivity: "Sensível",
    priorityScale: "Urgente",
    deadlineHoursRemaining: 48
  },
  {
    id: 2,
    org: "SME",
    preview: "Seu Bilhete de Identidade está pronto para levantamento presencial.",
    date: "Ontem",
    unread: 2,
    status: "Urgente",
    details: {
      subject: "Levantamento de BI",
      body: "O seu novo Bilhete de Identidade foi emitido com sucesso e já se encontra pronto para o levantamento presencial.\nO documento poderá ser recolhido no posto de atendimento onde efectuou o pedido original durante o horário de expediente.\nÉ obrigatório apresentar o talão de requerimento original e, se possível, o documento de identificação anterior para triagem.\nO nosso serviço de atendimento ao público funciona ininterruptamente das 08h00 às 15h00 nos dias úteis da semana.\nRecomendamos o agendamento prévio através deste portal para evitar tempos de espera prolongados nas filas de atendimento.",
      deadline: "30 de Maio de 2026",
      state: "Aguardando levantamento",
      actions: ["Ver local", "Agendar horario", "Baixar comprovativo"],
    },
    sensitivity: "Privado",
    priorityScale: "Urgente",
    deadlineHoursRemaining: 36
  },
  {
    id: 3,
    org: "ENDE",
    preview: "Nova factura de energia emitida com desconto por pagamento antecipado.",
    date: "Ontem",
    status: "Informativo",
    details: {
      subject: "Factura de Energia #ENDE-2026-9921",
      body: "A sua fatura de energia referente ao consumo do mês passado já foi emitida e está disponível para liquidação.\nO valor apurado de 11.200 Kz contempla o seu consumo real medido, acrescido das taxas de iluminação pública.\nInformamos que ao efetuar o pagamento até 5 dias antes do prazo, poderá beneficiar de um desconto de pontualidade.\nEvite cortes no fornecimento regularizando a sua situação financeira através dos canais de pagamento habilitados.\nPoderá também aderir ao débito direto para maior comodidade e garantia de que as suas faturas estarão sempre em dia.",
      deadline: "10 de Junho de 2026",
      state: "Em aberto",
      actions: ["Ver consumo", "Gerar referencia", "Pagar agora"],
    },
    sensitivity: "Público",
    priorityScale: "Normal"
  },
  {
    id: 4,
    org: "EPAL",
    preview: "Conta de água com ajuste de leitura automática confirmado.",
    date: "Seg",
    status: "Informativo",
    details: {
      subject: "Factura e Ajuste de Consumo",
      body: "Informamos que foi efectuado um ajuste na sua leitura de consumo de água após a verificação técnica do contador.\nO valor final da sua conta foi retificado para 6.430 Kz, corrigindo as estimativas baseadas em consumos anteriores.\nEste ajuste garante que pagará apenas pelo volume de água efetivamente utilizado na sua residência ou empresa.\nCaso note alguma discrepância persistente na sua faturação, poderá solicitar uma nova vistoria técnica ao domicílio.\nEstamos a modernizar os nossos sistemas de leitura para reduzir estas ocorrências e aumentar a precisão da cobrança.",
      deadline: "12 de Junho de 2026",
      state: "Pronto para pagamento",
      actions: ["Consultar historico", "Solicitar revisao", "Efetuar pagamento"],
    },
    sensitivity: "Público",
    priorityScale: "Normal"
  },
  {
    id: 5,
    org: "Tribunal",
    preview: "Notificação judicial digital para confirmação de comparecimento.",
    date: "Dom",
    status: "Urgente",
    details: {
      subject: "Notificação Judicial",
      body: "Fica V. Exa. notificado para comparecer na audiência de conciliação agendada para o Tribunal Provincial de Luanda.\nA sua presença é fundamental para o esclarecimento célere dos pontos em discórdia no processo em curso número 2026/A12.\nPoderá fazer-se acompan por um representative legal ou advogado devidamente credenciado junto da Ordem dos Advogados.\nO não comparecimento sem justificação plausível poderá resultar na aplicação de sanções previstas no código de processo civil.\nQualquer pedido de adiamento deverá ser submetido digitalmente através deste portal com 48 horas de antecedência.",
      deadline: "02 de Junho de 2026",
      state: "Resposta obrigatoria",
      actions: ["Ler notificacao", "Confirmar presenca", "Solicitar adiamento"],
    },
    sensitivity: "Restrito",
    priorityScale: "Crítico",
    deadlineHoursRemaining: 12
  },
  {
    id: 6,
    org: "Hospital",
    preview: "Resultado de exame pronto e disponível para consulta protegida.",
    date: "Sab",
    status: "Informativo",
    details: {
      subject: "Resultado Clínico",
      body: "O relatório detalhado dos seus exames laboratoriais realizados recentemente já foi processado pelo laboratório central.\nOs resultados estão agora disponíveis para consulta na sua área de paciente, protegida por criptografia de ponta a ponta.\nRelembramos que a interpretação destes dados deve ser feita obrigatoriamente por um profissional de saúde qualificado.\nAgende uma consulta de retorno para discutir estes resultados e definir os próximos passos do seu plano de saúde.\nO documento digital tem validade legal e pode ser partilhado diretamente com o seu médico assistente via e-mail.",
      deadline: "Sem prazo",
      state: "Disponivel para leitura",
      actions: ["Abrir resultado", "Partilhar com medico", "Marcar consulta"],
    },
    sensitivity: "Sensível",
    priorityScale: "Normal"
  },
  {
    id: 7,
    org: "AGT",
    preview: "Notificação de auditoria fiscal para o próximo trimestre.",
    date: "10:30",
    unread: 1,
    status: "Informativo",
    details: {
      subject: "Auditoria Fiscal Geral",
      body: "Informamos que foi programada uma auditoria fiscal de rotina às suas contas referente ao último ciclo trimestral.\nEste procedimento faz parte do plano anual de conformidade tributária para garantir a integridade dos dados declarados.\nSolicitamos que tenha disponível toda a documentação de suporte a receitas e despesas para consulta durante a inspeção.\nA nossa equipa técnica entrará em contacto via telefone para confirmar a modalidade da auditoria (presencial ou digital).\nCaso tenha alguma dúvida sobre os procedimentos, poderá consultar o manual de boas práticas fiscais disponível em anexo.",
      deadline: "15 de Agosto de 2026",
      state: "Agendado",
      actions: ["Ver documentos", "Falar com suporte", "Confirmar"],
    },
    sensitivity: "Sensível",
    priorityScale: "Importante"
  }
];

export const MOCK_INSTITUTIONAL_INBOX: Message[] = [
  {
    id: 1001,
    org: "Cidadão: Edlasio Galhardo",
    preview: "Pedido de esclarecimento sobre submissão de NIF.",
    date: "08:45",
    unread: 1,
    status: "Urgente",
    details: {
      subject: "Esclarecimento de Pendência NIF",
      body: "Exmos. Senhores da AGT,\n\nGostaria de solicitar um esclarecimento sobre o estado da minha submissão de NIF realizada há duas semanas. Ainda não recebi a confirmação oficial no meu portal.\n\nPoderiam verificar se existe alguma pendência nos meus dados?\n\nAtentamente,\nEdlasio Galhardo\nBI: 009874562LA041",
      actions: ["Responder", "Ver Cadastro", "Encaminhar"],
    },
    priorityScale: "Importante"
  },
  {
    id: 1002,
    org: "Cidadão: Maria Antónia",
    preview: "Envio de comprovativo de pagamento de taxa industrial.",
    date: "09:30",
    unread: 1,
    status: "Informativo",
    details: {
      subject: "Taxa Industrial do 1º Trimestre",
      body: "Bom dia,\n\nAnexo envio o comprovativo de pagamento da taxa industrial do primeiro trimestre de 2026. Peço que procedam à baixa da nota de liquidação no sistema correspondente.\n\nMelhores cumprimentos,\nMaria Antónia\nBI: 008812342LA011",
      actions: ["Validar Recibo", "Arquivar", "Responder"],
    },
    priorityScale: "Normal"
  },
  {
    id: 1004,
    org: "Cidadão: José Kalunga",
    preview: "Dedução fiscal não aplicada em fatura de saúde.",
    date: "11:00",
    unread: 1,
    status: "Informativo",
    details: {
      subject: "Solicitação de Dedução Fiscal de Saúde",
      body: "Caros colegas,\n\nNotei que uma fatura de despesas médicas não foi considerada para dedução automática no meu IRT fiscal regular. Gostaria de saber como proceder para a devida correção manual no sistema.\n\nObrigado.\n\nAtentamente,\nJosé Kalunga",
      actions: ["Analisar Fatura", "Corrigir Saldo", "Responder"],
    },
    priorityScale: "Normal"
  }
];

export const MOCK_SENT_MESSAGES: Message[] = [
  { id: 101, org: "SME", preview: "Resposta enviada: Solicito reagendamento para sexta-feira.", date: "Hoje", status: "Informativo" },
  { id: 102, org: "AGT", preview: "Comprovativo fiscal enviado em anexo para validação.", date: "Ontem", status: "Informativo" },
  { id: 103, org: "Hospital", preview: "Pedido de segunda via de relatório clínico submetido.", date: "Seg", status: "Informativo" },
  { id: 104, org: "ENDE", preview: "Reclamação de cobrança indevida registada sob protocolo #9901.", date: "Ter", status: "Informativo" }
];

export const MOCK_GOV_CORRESPONDENCES: Correspondence[] = [
  {
    id: "CDA-90118",
    sender: "Ministério das Finanças (MINFIN)",
    recipient: "Manuel de Vasconcelos",
    subject: "Notificação Geral de Isenção Fiscal Sócio-Profissional",
    originProvince: "Luanda",
    destinationProvince: "Benguela",
    institution: "AGT",
    status: "Não Lida",
    date: "02/06/2026",
    body: "Prezado Cidadão, sob a égide da resolução fiscal n. 450 do Ministério das Finanças, confirmamos que a isenção tributária temporária sobre os rendimentos laborais está validada eletronicamente no sistema integrado."
  },
  {
    id: "CDA-88123",
    sender: "SME - Posto Aduaneiro",
    recipient: "Edlasio Galhardo",
    subject: "Homologação de Emissão de Passaporte de Serviço",
    originProvince: "Cabinda",
    destinationProvince: "Luanda",
    institution: "SME",
    status: "Lida",
    date: "01/06/2026",
    body: "Exmo Senhor, informamos que o pedido de emissão de passaporte de categoria de serviço foi deferido pela Direção Geral do Serviço de Migração e Estrangeiros."
  },
  {
    id: "CDA-77123",
    sender: "Tribunal de Comarca de Viana",
    recipient: "Ana Maria dos Santos",
    subject: "Intimação Administrativa Eletrónica Unificada",
    originProvince: "Luanda",
    destinationProvince: "Luanda",
    institution: "Tribunal Supremo",
    status: "Enviada",
    date: "28/05/2026",
    body: "Notificamos o destinatário sobre o parecer homologado de audiência arbitral no âmbito dos registros prediais integrados de Viana."
  }
];

// ==========================================
// 7. DOCUMENTS DOMAIN (Digital Wallet/Folder)
// ==========================================
export const MOCK_DOCUMENTS: Document[] = [
  {
    name: "BI Digital",
    validity: "Válido até 2032",
    code: "AO-BI-9281",
    holder: "Edlasio Galhardo",
    number: "009874562LA041", // Matches CANONICAL_USER
    issuer: "SME",
    issuedAt: "10 de Abril de 2022",
  },
  {
    name: "Passaporte",
    validity: "Válido até 2030",
    code: "AO-PP-7712",
    holder: "Edlasio Galhardo",
    number: "AO-P129384", // Matches CANONICAL_USER
    issuer: "SME",
    issuedAt: "18 de Junho de 2020",
  },
  {
    name: "Carta de condução",
    validity: "Renovação em 2028",
    code: "AO-CD-5534",
    holder: "Edlasio Galhardo",
    number: "CD-244-99310",
    issuer: "Ministério dos Transportes",
    issuedAt: "03 de Novembro de 2023",
  },
  {
    name: "NIF (Número de Identificação Fiscal)",
    validity: "Vitalício",
    code: "AO-NIF-4412",
    holder: "Edlasio Galhardo",
    number: "5401329188", // Matches CANONICAL_USER
    issuer: "AGT",
    issuedAt: "15 de Maio de 2018",
  },
  {
    name: "Certificado de residência",
    validity: "Atualizado",
    code: "AO-CR-9022",
    holder: "Edlasio Galhardo",
    number: "RES-2026-1102",
    issuer: "Administracao Municipal",
    issuedAt: "22 de Janeiro de 2026",
  },
  {
    name: "Certidão de Conformidade Fiscal",
    validity: "Válido por 90 dias",
    code: "AO-CCF-8812",
    holder: "Edlasio Galhardo",
    number: "AGT-2026-CCF-001",
    issuer: "AGT",
    issuedAt: "02 de Maio de 2026",
  }
];

// ==========================================
// 8. PROCESSES DOMAIN (User Requests/Doc Requests)
// ==========================================
export const MOCK_USER_REQUESTS: UserRequest[] = [
  { id: 1, user: 'Edlasio Galhardo', type: 'IPU', priority: 'Média', time: '12m atrás', status: 'pendente', bi: '009874562LA041' },
  { id: 2, user: 'Maria Antónia', type: 'NIF', priority: 'Alta', time: '5m atrás', status: 'urgente', bi: '008812342LA011' },
  { id: 3, user: 'José Kalunga', type: 'Certidão', priority: 'Baixa', time: '1h atrás', status: 'processando', bi: '007712342LA021' }
];

export const MOCK_DOC_REQUESTS: DocRequest[] = [
  { id: 1, userName: 'Edlasio Galhardo', userBi: '009874562LA041', docType: 'BI Digital', institution: 'SME', date: '20/05/2026', status: 'Pendente', aiStatus: 'pre-approved' },
  { id: 2, userName: 'Maria Antónia', userBi: '008812342LA011', docType: 'Certidão de Nascimento', institution: 'Registo Civil', date: '19/05/2026', status: 'Aprovado' },
  { id: 3, userName: 'José Kalunga', userBi: '007712342LA021', docType: 'NIF Progressivo', institution: 'AGT', date: '18/05/2026', status: 'Pendente', aiStatus: 'manual-review' },
  { id: 4, userName: 'Ana Baptista', userBi: '009991332LA018', docType: 'Certificado de Residência', institution: 'MINJUS', date: '17/05/2026', status: 'Pendente', aiStatus: 'pre-approved' }
];

// ==========================================
// 9. NOTIFICATIONS DOMAIN (System Alerts)
// ==========================================
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 1, title: 'BI Renovado', message: 'O seu Bilhete de Identidade foi renovado com sucesso.', time: '2h atrás', type: 'success', targetTab: 'correspondencias' },
  { id: 2, title: 'Alerta de Segurança', message: 'Novo acesso detectado a partir de um dispositivo Chrome em Luanda.', time: '5h atrás', type: 'warning', targetTab: 'perfil' },
  { id: 3, title: 'Documento Recebido', message: 'O SME enviou um novo documento para a sua correspondência eletrónica.', time: 'Ontem', type: 'info', targetTab: 'correspondencias' }
];

// ==========================================
// 10. CONTACTS DOMAIN (Emergency circle)
// ==========================================
export const MOCK_CONTACTS: Contact[] = [
  { id: 1, name: "Maria Domingos", bi: "008744221LA011", relation: "Mãe", status: "Confirmado", type: "Emergência", phone: "+244 923 888 111" },
  { id: 2, name: "João Manuel", bi: "007112009LA031", relation: "Irmão", status: "Confirmado", type: "Emergência", phone: "+244 923 888 222" },
  { id: 3, name: "Ana Baptista", bi: "009991332LA018", relation: "Vizinha", status: "Pendente", type: "Normal", phone: "+244 933 555 666" }
];

// ==========================================
// 11. INVOICES DOMAIN (Utility service bills)
// ==========================================
export interface MockInvoice {
  id: string;
  institution: string;
  contractNumber: string;
  reference: string;
  amount: string;
  amountKz: number;
  period: string;
  dueDate: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
}

export const MOCK_INVOICES: MockInvoice[] = [
  {
    id: "FAT-ENDE-2026-991",
    institution: "ENDE",
    contractNumber: "9910245021",
    reference: "110 245 021",
    amount: "11.200 Kz",
    amountKz: 11200,
    period: "Maio/2026",
    dueDate: "10 de Junho de 2026",
    status: "Pendente"
  },
  {
    id: "FAT-EPAL-2026-382",
    institution: "EPAL",
    contractNumber: "0018442001",
    reference: "001 844 200",
    amount: "6.430 Kz",
    amountKz: 6430,
    period: "Abril/2026",
    dueDate: "12 de Junho de 2026",
    status: "Pendente"
  },
  {
    id: "FAT-AGT-IPU-2026",
    institution: "AGT",
    contractNumber: "NIF-5401329188",
    reference: "889 012 344",
    amount: "18.500 Kz",
    amountKz: 18500,
    period: "Ano Fiscal 2025",
    dueDate: "25 de Maio de 2026",
    status: "Pendente"
  }
];

// ==========================================
// 12. PAYMENTS DOMAIN (Historical Receipts)
// ==========================================
export interface MockPaymentRecord {
  id: string;
  reference: string;
  amount: string;
  institutionName: string;
  paymentMethod: string;
  dateTime: string;
  receiptNumber: string;
  status: string;
}

export const MOCK_PAYMENTS: MockPaymentRecord[] = [
  {
    id: "PAY-00129",
    reference: "878 901 230",
    amount: "45.000 Kz",
    institutionName: "AGT - Imposto Predial",
    paymentMethod: "Multicaixa Express",
    dateTime: "10 de Abril de 2026 14:15",
    receiptNumber: "REC-IPU-9921",
    status: "Liquidado"
  },
  {
    id: "PAY-00124",
    reference: "110 244 955",
    amount: "10.500 Kz",
    institutionName: "SME - Emissão de Passaporte",
    paymentMethod: "Atm / Referência",
    dateTime: "18 de Junho de 2025 09:30",
    receiptNumber: "REC-SME-0021-PP",
    status: "Liquidado"
  }
];

// ==========================================
// 13. CERTIFICATES DOMAIN (Crypto identities)
// ==========================================
export interface MockCertificateEntity {
  id: string;
  holder: string;
  institution: string;
  serialNumber: string;
  notBefore: string;
  notAfter: string;
  sha256Fingerprint: string;
  isActive: boolean;
  sealType: string;
}

export const MOCK_CERTIFICATES: MockCertificateEntity[] = [
  {
    id: "CERT-AGT-01",
    holder: "AGT Administrador",
    institution: "Administração Geral Tributária",
    serialNumber: "SN-99881122AA-AGT",
    notBefore: "01/01/2025",
    notAfter: "01/01/2028",
    sha256Fingerprint: "A9:D2:C3:FF:88:B4:77:E5:66:D1:44:00:22:11:AA:BB:CC:DD:EE:00:23:45:67:89:AB:CD:EF:01:23:45:67",
    isActive: true,
    sealType: "Selo Eletrónico Avançado do Estado"
  },
  {
    id: "CERT-EDL-01",
    holder: "Edlasio Galhardo",
    institution: "CDA - Assinatura Qualificada",
    serialNumber: "SN-009874562-EDL-MINT",
    notBefore: "10/04/2025",
    notAfter: "10/04/2030",
    sha256Fingerprint: "B3:E1:C4:EE:77:A3:66:D4:55:C0:33:11:BB:AA:99:FF:CC:DD:AA:11:22:33:44:55:66:77:88:99:AA:00:11",
    isActive: true,
    sealType: "Assinatura Digital Qualificada de Cidadão"
  }
];

// ==========================================
// 14. AI ASSISTANTS DOMAIN (Chat/Voice Settings)
// ==========================================
export interface MockAIAssistantConfig {
  id: string;
  name: string;
  avatarUrl: string;
  promptTheme: string;
  greetingMessage: string;
  voicePitch: number;
  voiceSpeed: number;
}

export const MOCK_AI_ASSISTANTS: MockAIAssistantConfig[] = [
  {
    id: "ai-gove-voice",
    name: "Guia de Voz Angola Digital",
    avatarUrl: "https://i.postimg.cc/sxWsYGX2/Foto-Edlasio.png",
    promptTheme: "Guia falado inclusivo e acessível",
    greetingMessage: "Olá Edlasio! Sou o seu Guia de Voz Oficial do Correio Digital de Angola. Em que posso auxiliá-lo hoje?",
    voicePitch: 1.0,
    voiceSpeed: 0.95
  },
  {
    id: "ai-agt-chat",
    name: "Assistente Fiscal Integrado AGT",
    avatarUrl: "https://i.postimg.cc/sxWsYGX2/Foto-Edlasio.png",
    promptTheme: "Consultor Técnico de Impostos do Estado",
    greetingMessage: "Olá! Sou o Assistente Integrado de Inteligência Tributária da AGT. Posso ajudar com levantamento de NIF, cálculo de IPU ou regularização fiscal voluntária.",
    voicePitch: 1.05,
    voiceSpeed: 1.0
  }
];

// ==========================================
// 15. AUDIT LOGS DOMAIN (Activity logging Trail)
// ==========================================
export interface MockAuditLogEntity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'danger' | string;
}

export const MOCK_AUDIT_LOGS: MockAuditLogEntity[] = [
  { id: '1', action: 'Sistema de Correio Digital Inicializado', user: 'SYSTEM', timestamp: '14/06/2026 08:00', type: 'info' },
  { id: '2', action: 'Login do Administrador SME Autorizado', user: 'Admin SME', timestamp: '14/06/2026 08:30', type: 'success' },
  { id: '3', action: 'Auditoria de Assinaturas Digitais do Cidadão Completa', user: 'Edlasio Galhardo', timestamp: '14/06/2026 09:15', type: 'info' },
  { id: '4', action: 'Selo Eletrónico da AGT Validado para Notificação', user: 'AGT-SOC', timestamp: '14/06/2026 10:10', type: 'success' }
];

// Helper to secure protocol seals on demand (representing official Angolan Gov stamps)
export function generateMockProtocol(id: string | number, type: string, inst: string): DigitalProtocol {
  return {
    internalId: `CDA-PRT-${id}`,
    protocolNumber: `CDA-2026-PT-${Math.floor(100000 + Math.random() * 900000)}`,
    issuerInstitution: inst,
    officialIssueDate: "14/06/2026",
    officialTime: "08:30:15",
    issuerResponsible: inst === 'AGT' ? 'Dr. Francisco Manuel' : 'Dr. António Fernando',
    category: "Notificação Geral e Expediente",
    documentType: type,
    currentState: "Autenticado no Barramento do Estado",
    priority: "Alta",
    deadlineDate: "15 de Agosto de 2026",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CorreioDigitalAngola-ProtocoloAuth-14-06-2026",
    digitalSignature: "MIIEuwYJKoZIhvcNAQcCoIIErDCCBKgCAQExDzANBglghkgBZQMEAgEFADCBvAYJKoZIhvcNAQcBoIG8BIG5",
    digitalSeal: "HSM-SEAL-CDA-AO-2026",
    documentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    institutionalCertificate: "SN-99881122AA-AGT",
    signatureDate: "14/06/2026 08:30:15",
    legalValidity: "Lei Geral das Tecnologias de Informação de Angola (Nº 2/14)"
  };
}
