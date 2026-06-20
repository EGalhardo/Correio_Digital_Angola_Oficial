/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AnimatedCounter - Componente de animação numérica OPTIMIZADO
 * Performance máxima com 60fps e baixo consumo de recursos
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';

// ============================================================================
// TIPAGEM
// ============================================================================

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  currency?: 'AOA' | 'USD' | 'EUR' | 'Kz' | string;
  prefix?: string;
  suffix?: string;
  separator?: string;
  decimalSeparator?: string;
  className?: string;
  delay?: number;
  autoStart?: boolean;
  onComplete?: (finalValue: number) => void;
  triggerOnVisible?: boolean;
  rootMargin?: string;
  'data-testid'?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  AOA: 'Kz',
  KZ: 'Kz',
  USD: '$',
  EUR: '€',
};

const DEFAULT_SEPARATOR = '.';
const DEFAULT_DECIMAL_SEPARATOR = ',';

// ============================================================================
// FUNÇÕES DE EASING (inline para melhor performance)
// ============================================================================

const easeInOutQuad = (t: number): number => 
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// ============================================================================
// CACHE DE FORMATAÇÃO (Evita recalcular a cada frame)
// ============================================================================

const formatCache = new Map<string, string>();

function getCachedFormat(value: number, decimals: number, separator: string, decimalSeparator: string): string {
  const key = `${value}-${decimals}-${separator}-${decimalSeparator}`;
  
  if (formatCache.has(key)) {
    return formatCache.get(key)!;
  }
  
  const fixedValue = parseFloat(value.toFixed(decimals));
  const parts = fixedValue.toString().split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const decimalPart = parts[1] || '';
  
  const result = decimals > 0 && decimalPart
    ? `${integerPart}${decimalSeparator}${decimalPart.padEnd(decimals, '0')}`
    : integerPart;
  
  // Limitar cache a 1000 entradas
  if (formatCache.size > 1000) {
    formatCache.clear();
  }
  
  formatCache.set(key, result);
  return result;
}

// ============================================================================
// HOOK: useThrottledValue
// ============================================================================

function useThrottledValue(value: number, fpsLimit: number = 30) {
  const [displayValue, setDisplayValue] = useState(value);
  const lastUpdateRef = useRef(0);
  
  useEffect(() => {
    const now = performance.now();
    const minInterval = 1000 / fpsLimit;
    
    if (now - lastUpdateRef.current >= minInterval) {
      setDisplayValue(value);
      lastUpdateRef.current = now;
    } else {
      // Schedule update for next frame
      const remaining = minInterval - (now - lastUpdateRef.current);
      const timeoutId = setTimeout(() => {
        setDisplayValue(value);
        lastUpdateRef.current = performance.now();
      }, remaining);
      return () => clearTimeout(timeoutId);
    }
  }, [value, fpsLimit]);
  
  return displayValue;
}

// ============================================================================
// HOOK: useSingleIntersectionObserver
// ============================================================================

// Cache de observers para reutilização
const observerCache = new Map<string, { observer: IntersectionObserver; count: number }>();

function useSingleIntersectionObserver(
  triggerOnVisible: boolean,
  rootMargin: string = '0px'
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!triggerOnVisible);
  const observerKey = rootMargin;

  useEffect(() => {
    if (!triggerOnVisible || !ref.current) return;

    // Reutilizar observer existente se disponível
    let observer: IntersectionObserver;
    
    if (observerCache.has(observerKey)) {
      const cached = observerCache.get(observerKey)!;
      observer = cached.observer;
      cached.count++;
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Notificar todas as instâncias
            observerCache.forEach((cached, _key) => {
              cached.observer.disconnect();
            });
            setIsVisible(true);
          }
        },
        { rootMargin }
      );
      observerCache.set(observerKey, { observer, count: 1 });
    }

    observer.observe(ref.current);

    return () => {
      const cached = observerCache.get(observerKey);
      if (cached) {
        cached.count--;
        if (cached.count === 0) {
          observer.disconnect();
          observerCache.delete(observerKey);
        }
      }
    };
  }, [triggerOnVisible, rootMargin, observerKey]);

  return [ref, isVisible];
}

// ============================================================================
// COMPONENTE PRINCIPAL (MEMOIZADO)
// ============================================================================

export const AnimatedCounter: React.FC<AnimatedCounterProps> = memo(({
  from = 0,
  to,
  duration = 1500,
  decimals = 0,
  currency,
  prefix = '',
  suffix = '',
  separator = DEFAULT_SEPARATOR,
  decimalSeparator = DEFAULT_DECIMAL_SEPARATOR,
  className = '',
  delay = 0,
  autoStart = true,
  onComplete,
  triggerOnVisible = false,
  rootMargin = '0px',
  'data-testid': testId,
}) => {
  // Refs (não causam re-render)
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  
  // Estado apenas para valor final (throttled)
  const [displayValue, setDisplayValue] = useState(from);
  
  // Intersection Observer
  const [containerRef, isVisible] = useSingleIntersectionObserver(triggerOnVisible, rootMargin);
  
  // Determinar se deve iniciar
  const shouldStart = useMemo(() => {
    if (!autoStart) return false;
    if (triggerOnVisible) return isVisible;
    return true;
  }, [autoStart, triggerOnVisible, isVisible]);
  
  // Verificar se deve pular animação
  const skipAnimation = useMemo(() => from === to, [from, to]);
  
  // Obter prefixo da moeda
  const currencyPrefix = useMemo(() => {
    if (!currency) return '';
    return CURRENCY_SYMBOLS[currency.toUpperCase()] || '';
  }, [currency]);
  
  // Prefixo completo
  const fullPrefix = useMemo(() => `${prefix}${currencyPrefix}`, [prefix, currencyPrefix]);
  
  // Valor formatado (memozied para evitar recálculos)
  const formattedValue = useMemo(() => {
    return getCachedFormat(displayValue, decimals, separator, decimalSeparator);
  }, [displayValue, decimals, separator, decimalSeparator]);
  
  // Função de animação (useCallback para evitar recriação)
  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutQuad(progress);
    
    const newValue = from + (to - from) * easedProgress;
    setDisplayValue(newValue);
    
    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setDisplayValue(to);
      isAnimatingRef.current = false;
      onComplete?.(to);
    }
  }, [from, to, duration, onComplete]);
  
  // Effect para gerir a animação
  useEffect(() => {
    // Reset
    if (!shouldStart || hasAnimatedRef.current) return;
    
    if (skipAnimation) {
      setDisplayValue(to);
      hasAnimatedRef.current = true;
      onComplete?.(to);
      return;
    }
    
    // Com delay
    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        hasAnimatedRef.current = true;
        isAnimatingRef.current = true;
        startTimeRef.current = null;
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
      
      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
    
    // Sem delay
    hasAnimatedRef.current = true;
    isAnimatingRef.current = true;
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shouldStart, skipAnimation, to, delay, animate]);
  
  // Effect para reset quando 'to' mudar
  useEffect(() => {
    hasAnimatedRef.current = false;
    startTimeRef.current = null;
    isAnimatingRef.current = false;
    if (autoStart) {
      setDisplayValue(from);
    }
  }, [to, from, autoStart]);

  return (
    <span
      ref={containerRef}
      className={`inline-block ${className}`}
      data-testid={testId}
      data-animating={isAnimatingRef.current}
      data-value={to}
    >
      {fullPrefix}
      <span className="tabular-nums">{formattedValue}</span>
      {suffix}
    </span>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// ============================================================================
// COMPONENTE ALTERNATIVO
// ============================================================================

export const CountingAnimation: React.FC<AnimatedCounterProps> = memo((props) => (
  <AnimatedCounter {...props} />
));

CountingAnimation.displayName = 'CountingAnimation';

// ============================================================================
// UTILITÁRIOS
// ============================================================================

export function formatCurrency(
  value: number,
  currency: 'AOA' | 'USD' | 'EUR' = 'AOA',
  showCents: boolean = true
): string {
  const symbols: Record<string, string> = {
    AOA: 'Kz ',
    KZ: 'Kz ',
    USD: '$ ',
    EUR: '€ ',
  };

  return `${symbols[currency] || ''}${getCachedFormat(value, showCents ? 2 : 0, '.', ',')}`;
}

export function formatAngolaNumber(value: number, decimals: number = 2): string {
  return getCachedFormat(value, decimals, '.', ',');
}

// ============================================================================
// HOOK PARA SUPABASE/WEBSOCKET
// ============================================================================

export function useAnimatedValue(
  initialValue: number,
  options?: {
    duration?: number;
    decimals?: number;
    autoStart?: boolean;
  }
) {
  const [targetValue, setTargetValue] = useState(initialValue);
  
  const updateValue = useCallback((newValue: number) => {
    setTargetValue(newValue);
  }, []);
  
  const AnimatedComponent = useCallback(
    (props?: Partial<AnimatedCounterProps>) => (
      <AnimatedCounter
        to={targetValue}
        duration={options?.duration || 1500}
        decimals={options?.decimals || 0}
        autoStart={options?.autoStart !== false}
        {...props}
      />
    ),
    [targetValue, options]
  );
  
  return { targetValue, updateValue, AnimatedComponent };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default AnimatedCounter;