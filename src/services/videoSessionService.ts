import { supabase } from '../lib/supabaseClient';
import { hasValidSupabaseKeys } from './supabaseService';
import { VideoSession, VideoSessionParticipant, VideoSessionEvent } from '../types';

// Pre-seeded Mock Video Sessions for a pristine showcase experience
const INITIAL_MOCK_SESSIONS: VideoSession[] = [
  {
    id: 'vs-1',
    roomName: 'cda-video-agt-nif-40502',
    subject: 'Esclarecimento de Dúvidas sobre NIF Suspenso',
    associatedProtocol: 'CDA-2026-61849',
    associatedMessageId: 1,
    status: 'disponivel',
    hostBi: 'INST-AGT-0220',
    hostName: 'Dr. Valeriano Mendes (AGT)',
    guestBi: '005204192LA048', // Edlasio's BI
    guestName: 'Edlasio Galhardo',
    scheduledFor: 'Hoje às 14:30',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'vs-2',
    roomName: 'cda-video-sme-bi-20512',
    subject: 'Validação Presencial por Vídeo de Passaporte Especial',
    associatedProtocol: 'CDA-2026-92850',
    associatedMessageId: 2,
    status: 'concluida',
    hostBi: 'INST-SME-0034',
    hostName: 'Superintendente Carla Neto (SME)',
    guestBi: '005204192LA048',
    guestName: 'Edlasio Galhardo',
    scheduledFor: 'Ontem às 10:00',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    closedAt: new Date(Date.now() - 86400000 + 1800000).toISOString(),
  },
  {
    id: 'vs-3',
    roomName: 'cda-video-mre-atend-883',
    subject: 'Agendamento Prévio de Consulta de Atendimento consular',
    associatedProtocol: 'CDA-2026-10294',
    status: 'agendada',
    hostBi: 'INST-MINREX-04',
    hostName: 'Geraldo Lemos (Apoio Consular)',
    guestBi: '005204192LA048',
    guestName: 'Edlasio Galhardo',
    scheduledFor: 'Amanhã às 09:15',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_MOCK_EVENTS: VideoSessionEvent[] = [
  {
    id: 'vse-1',
    sessionId: 'vs-2',
    eventType: 'criada',
    bi: 'INST-SME-0034',
    userName: 'Superintendente Carla Neto (SME)',
    description: 'Sessão de videoatendimento agendada e estruturada no barramento oficial.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'vse-2',
    sessionId: 'vs-2',
    eventType: 'entrada',
    bi: 'INST-SME-0034',
    userName: 'Superintendente Carla Neto (SME)',
    description: 'O representante da instituição iniciou a conferência e aguarda o cidadão.',
    timestamp: new Date(Date.now() - 86400000 + 105000).toISOString(),
  },
  {
    id: 'vse-3',
    sessionId: 'vs-2',
    eventType: 'entrada',
    bi: '005204192LA048',
    userName: 'Edlasio Galhardo',
    description: 'O cidadão estabeleceu ligação segura e entrou na sala Jitsi.',
    timestamp: new Date(Date.now() - 86400000 + 180000).toISOString(),
  },
  {
    id: 'vse-4',
    sessionId: 'vs-2',
    eventType: 'encerrada',
    bi: 'INST-SME-0034',
    userName: 'Superintendente Carla Neto (SME)',
    description: 'A sessão de vídeo foi concluída e documentada com sucesso.',
    timestamp: new Date(Date.now() - 86400000 + 1800000).toISOString(),
  }
];

// Helper to load/save offline local state
const getLocalSessions = (): VideoSession[] => {
  const data = localStorage.getItem('cda_video_sessions');
  if (data) {
    try { return JSON.parse(data); } catch (e) { /* ignore */ }
  }
  localStorage.setItem('cda_video_sessions', JSON.stringify(INITIAL_MOCK_SESSIONS));
  return INITIAL_MOCK_SESSIONS;
};

const saveLocalSessions = (sessions: VideoSession[]) => {
  localStorage.setItem('cda_video_sessions', JSON.stringify(sessions));
};

const getLocalEvents = (): VideoSessionEvent[] => {
  const data = localStorage.getItem('cda_video_session_events');
  if (data) {
    try { return JSON.parse(data); } catch (e) { /* ignore */ }
  }
  localStorage.setItem('cda_video_session_events', JSON.stringify(INITIAL_MOCK_EVENTS));
  return INITIAL_MOCK_EVENTS;
};

const saveLocalEvents = (events: VideoSessionEvent[]) => {
  localStorage.setItem('cda_video_session_events', JSON.stringify(events));
};

export const VideoSessionService = {
  /**
   * Lists all video sessions
   */
  async listSessions(): Promise<VideoSession[]> {
    const local = getLocalSessions();
    if (!hasValidSupabaseKeys()) {
      return local;
    }
    try {
      const { data, error } = await supabase
        .from('video_sessions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data && data.length > 0) {
        // Map postgres snake_case to typescript camelCase
        const mapped: VideoSession[] = data.map((d: any) => ({
          id: d.id,
          roomName: d.room_name || d.roomName,
          subject: d.subject,
          associatedProtocol: d.associated_protocol || d.associatedProtocol,
          associatedMessageId: d.associated_message_id || d.associatedMessageId,
          status: d.status,
          hostBi: d.host_bi || d.hostBi,
          hostName: d.host_name || d.hostName,
          guestBi: d.guest_bi || d.guestBi,
          guestName: d.guest_name || d.guestName,
          scheduledFor: d.scheduled_for || d.scheduledFor,
          createdAt: d.created_at || d.createdAt,
          closedAt: d.closed_at || d.closedAt,
        }));
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase key error or query failed, serving fallback:', e);
    }
    return local;
  },

  /**
   * Retrieves a single video session
   */
  async getSession(id: string): Promise<VideoSession | null> {
    const local = getLocalSessions();
    const foundLocal = local.find(s => s.id === id) || null;
    if (!hasValidSupabaseKeys()) {
      return foundLocal;
    }
    try {
      const { data, error } = await supabase
        .from('video_sessions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          roomName: data.room_name || data.roomName,
          subject: data.subject,
          associatedProtocol: data.associated_protocol || data.associatedProtocol,
          associatedMessageId: data.associated_message_id || data.associatedMessageId,
          status: data.status,
          hostBi: data.host_bi || data.hostBi,
          hostName: data.host_name || data.hostName,
          guestBi: data.guest_bi || data.guestBi,
          guestName: data.guest_name || data.guestName,
          scheduledFor: data.scheduled_for || data.scheduledFor,
          createdAt: data.created_at || data.createdAt,
          closedAt: data.closed_at || data.closedAt,
        };
      }
    } catch (e) {
      console.warn('Supabase key error or query failed, serving fallback:', e);
    }
    return foundLocal;
  },

  /**
   * Creates a new video session
   */
  async createSession(session: Omit<VideoSession, 'id' | 'createdAt'>): Promise<VideoSession> {
    const id = 'vs-' + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();
    const newSession: VideoSession = {
      ...session,
      id,
      createdAt,
    };

    // Update local storage first
    const local = getLocalSessions();
    local.unshift(newSession);
    saveLocalSessions(local);

    // Sync to Supabase in background or try
    if (hasValidSupabaseKeys()) {
      try {
        await supabase.from('video_sessions').insert([{
          id,
          room_name: session.roomName,
          subject: session.subject,
          associated_protocol: session.associatedProtocol || null,
          associated_message_id: session.associatedMessageId || null,
          status: session.status,
          host_bi: session.hostBi,
          host_name: session.hostName,
          guest_bi: session.guestBi,
          guest_name: session.guestName,
          scheduled_for: session.scheduledFor,
          created_at: createdAt,
        }]);
      } catch (err) {
        console.warn('Error saving session to Supabase, fallback to client state:', err);
      }
    }

    // Add initialization event as standard
    await this.addSessionEvent(
      id, 
      'criada', 
      session.hostBi, 
      session.hostName, 
      `Sessão criada e agendada: "${session.subject}" com ${session.guestName}.`
    );

    return newSession;
  },

  /**
   * Updates the status of a video session
   */
  async updateSessionStatus(id: string, status: VideoSession['status']): Promise<VideoSession | null> {
    const local = getLocalSessions();
    const index = local.findIndex(s => s.id === id);
    if (index === -1) return null;

    const closedAt = (status === 'concluida' || status === 'cancelada') ? new Date().toISOString() : undefined;
    const updated = {
      ...local[index],
      status,
      closedAt,
    };
    local[index] = updated;
    saveLocalSessions(local);

    if (hasValidSupabaseKeys()) {
      try {
        await supabase
          .from('video_sessions')
          .update({ 
            status,
            closed_at: closedAt || null
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase Status Update failed:', err);
      }
    }

    // Add corresponding event
    const eventType = status === 'em_curso' ? 'iniciada' : status === 'concluida' ? 'encerrada' : status === 'cancelada' ? 'cancelada' : 'agendada';
    await this.addSessionEvent(
      id,
      eventType,
      updated.hostBi,
      updated.hostName,
      `Estado da sessão atualizado para "${status}".`
    );

    return updated;
  },

  /**
   * Adds an audit event to a specific session
   */
  async addSessionEvent(
    sessionId: string,
    eventType: VideoSessionEvent['eventType'],
    bi: string,
    userName: string,
    description: string
  ): Promise<VideoSessionEvent> {
    const id = 'vse-' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    const newEvent: VideoSessionEvent = {
      id,
      sessionId,
      eventType,
      bi,
      userName,
      description,
      timestamp,
    };

    const localEvents = getLocalEvents();
    localEvents.push(newEvent);
    saveLocalEvents(localEvents);

    if (hasValidSupabaseKeys()) {
      try {
        await supabase.from('video_session_events').insert([{
          id,
          session_id: sessionId,
          event_type: eventType,
          bi,
          user_name: userName,
          description,
          timestamp,
        }]);
      } catch (err) {
        console.warn('Supabase Session Event logging failed:', err);
      }
    }

    return newEvent;
  },

  /**
   * Retrieves events for a specific session
   */
  async getSessionEvents(sessionId: string): Promise<VideoSessionEvent[]> {
    const localEvents = getLocalEvents().filter(e => e.sessionId === sessionId);
    if (!hasValidSupabaseKeys()) {
      return localEvents;
    }
    try {
      const { data, error } = await supabase
        .from('video_session_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          sessionId: d.session_id || d.sessionId,
          eventType: d.event_type || d.eventType,
          bi: d.bi,
          userName: d.user_name || d.userName,
          description: d.description,
          timestamp: d.timestamp,
        }));
      }
    } catch (e) {
      console.warn('Supabase event query failed, serving fallback:', e);
    }
    return localEvents;
  }
};
