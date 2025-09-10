// Configuración de localización por defecto (se puede personalizar)
export interface LocaleConfig {
  timezone: string;
  locale: string;
  weekStartsOn?: 0 | 1; // 0 = domingo, 1 = lunes
}

// Detectar configuración del usuario automáticamente
export function detectUserLocale(): LocaleConfig {
  // Detectar zona horaria del navegador
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Detectar idioma/locale del navegador
  const locale = navigator?.language || 'en-US';
  
  // Detectar si la semana empieza en domingo o lunes según la región
  const weekStartsOn = getWeekStartForLocale(locale);
  
  return {
    timezone,
    locale,
    weekStartsOn
  };
}

// Determinar el inicio de semana según el locale
function getWeekStartForLocale(locale: string): 0 | 1 {
  // Países que empiezan la semana en domingo
  const sundayFirstCountries = ['US', 'CA', 'MX', 'JP', 'KR', 'IL', 'SA'];
  const country = locale.split('-')[1];
  return sundayFirstCountries.includes(country) ? 0 : 1;
}

// Configuración global (se puede sobrescribir)
let globalLocaleConfig: LocaleConfig = detectUserLocale();

// Función para personalizar la configuración global
export function setGlobalLocaleConfig(config: Partial<LocaleConfig>): void {
  globalLocaleConfig = { ...globalLocaleConfig, ...config };
}

// Obtener la configuración actual
export function getGlobalLocaleConfig(): LocaleConfig {
  return globalLocaleConfig;
}

// Compatibilidad con Argentina (mantener constantes para código existente)
export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
export const ARGENTINA_LOCALE = 'es-AR';

// Clase para manejar fechas con localización configurable
export class LocalizedDate {
  private date: Date;
  private config: LocaleConfig;

  constructor(date?: Date | string | number, config?: LocaleConfig) {
    this.config = config || getGlobalLocaleConfig();
    
    if (typeof date === 'string') {
      // Si es string, asumir formato YYYY-MM-DD y crear en zona horaria local
      this.date = new Date(date + 'T00:00:00');
    } else if (typeof date === 'number') {
      this.date = new Date(date);
    } else if (date instanceof Date) {
      this.date = new Date(date);
    } else {
      // Fecha actual en zona horaria del usuario
      this.date = new Date();
    }
  }

  // Obtener fecha actual con configuración del usuario
  static now(config?: LocaleConfig): LocalizedDate {
    return new LocalizedDate(undefined, config);
  }

  // Parsear fecha desde string YYYY-MM-DD
  static fromISO(dateStr: string, config?: LocaleConfig): LocalizedDate {
    return new LocalizedDate(dateStr, config);
  }

  // Parsear fecha desde DD/MM/YYYY u otros formatos según el locale
  static fromShort(dateStr: string, config?: LocaleConfig): LocalizedDate {
    const localeConfig = config || getGlobalLocaleConfig();
    
    // Detectar formato según el locale
    if (localeConfig.locale.startsWith('en-US')) {
      // Formato MM/DD/YYYY para EE.UU.
      const [month, day, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return new LocalizedDate(date, config);
    } else {
      // Formato DD/MM/YYYY para el resto del mundo
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return new LocalizedDate(date, config);
    }
  }

  // Obtener año
  get year(): number {
    return this.date.getFullYear();
  }

  // Obtener mes (1-12)
  get month(): number {
    return this.date.getMonth() + 1;
  }

  // Obtener día del mes
  get day(): number {
    return this.date.getDate();
  }

  // Obtener día de la semana (respetando configuración de inicio de semana)
  get dayOfWeek(): number {
    const day = this.date.getDay();
    if (this.config.weekStartsOn === 1) {
      // Lunes = 1, Domingo = 7
      return day === 0 ? 7 : day;
    }
    // Domingo = 0, Sábado = 6
    return day;
  }

  // Obtener días en el mes actual
  get daysInMonth(): number {
    return new Date(this.year, this.month, 0).getDate();
  }

  // Formatear para display según el locale del usuario
  formatForDisplay(): string {
    return this.date.toLocaleDateString(this.config.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.config.timezone,
    });
  }

  // Formatear fecha corta según el locale del usuario
  formatShort(): string {
    return this.date.toLocaleDateString(this.config.locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: this.config.timezone,
    });
  }

  // Formatear fecha ISO (YYYY-MM-DD)
  formatISO(): string {
    const year = this.year.toString().padStart(4, '0');
    const month = this.month.toString().padStart(2, '0');
    const day = this.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Obtener nombre del día de la semana según el locale
  getDayName(): string {
    return this.date.toLocaleDateString(this.config.locale, {
      weekday: 'long',
      timeZone: this.config.timezone,
    });
  }

  // Obtener nombre del mes según el locale
  getMonthName(): string {
    return this.date.toLocaleDateString(this.config.locale, {
      month: 'long',
      timeZone: this.config.timezone,
    });
  }

  // Añadir días
  addDays(days: number): LocalizedDate {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() + days);
    return new LocalizedDate(newDate, this.config);
  }

  // Restar días
  subtractDays(days: number): LocalizedDate {
    return this.addDays(-days);
  }

  // Comparar con otra fecha
  compare(other: LocalizedDate): number {
    return this.date.getTime() - other.date.getTime();
  }

  // Verificar si es igual a otra fecha
  equals(other: LocalizedDate): boolean {
    return this.compare(other) === 0;
  }

  // Verificar si es anterior a otra fecha
  isBefore(other: LocalizedDate): boolean {
    return this.compare(other) < 0;
  }

  // Verificar si es posterior a otra fecha
  isAfter(other: LocalizedDate): boolean {
    return this.compare(other) > 0;
  }

  // Clonar la fecha
  clone(): LocalizedDate {
    return new LocalizedDate(new Date(this.date), this.config);
  }

  // Cambiar propiedades de la fecha
  with(changes: { year?: number; month?: number; day?: number }): LocalizedDate {
    const newDate = new Date(this.date);
    if (changes.year !== undefined) newDate.setFullYear(changes.year);
    if (changes.month !== undefined) newDate.setMonth(changes.month - 1);
    if (changes.day !== undefined) newDate.setDate(changes.day);
    return new LocalizedDate(newDate, this.config);
  }

  // Obtener timestamp
  getTime(): number {
    return this.date.getTime();
  }

  // Obtener configuración de locale
  getLocaleConfig(): LocaleConfig {
    return this.config;
  }
}



// Funciones de utilidad

// Obtener fecha actual con configuración del usuario
export function getLocalizedDate(config?: LocaleConfig): LocalizedDate {
  return LocalizedDate.now(config);
}

// Obtener fecha actual con configuración de Argentina (compatibilidad)
export function getArgentinaDate(): LocalizedDate {
  return new LocalizedDate(undefined, {
    timezone: ARGENTINA_TIMEZONE,
    locale: ARGENTINA_LOCALE,
    weekStartsOn: 1
  });
}

// Parsear fecha desde string con configuración del usuario
export function parseDate(dateStr: string, config?: LocaleConfig): LocalizedDate {
  return LocalizedDate.fromISO(dateStr, config);
}

// Formatear fecha para display con configuración dinámica
export function formatDateForDisplay(date: Date | LocalizedDate, config?: LocaleConfig): string {
  if (date instanceof LocalizedDate) {
    return date.formatForDisplay();
  }
  
  const localeConfig = config || getGlobalLocaleConfig();
  return date.toLocaleDateString(localeConfig.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: localeConfig.timezone,
  });
}

// Formatear fecha corta con configuración dinámica
export function formatDateShort(date: Date | LocalizedDate, config?: LocaleConfig): string {
  if (date instanceof LocalizedDate) {
    return date.formatShort();
  }
  
  const localeConfig = config || getGlobalLocaleConfig();
  return date.toLocaleDateString(localeConfig.locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: localeConfig.timezone,
  });
}

// Formatear fecha ISO (siempre igual, independiente del locale)
export function formatDateISO(date: Date | LocalizedDate): string {
  if (date instanceof LocalizedDate) {
    return date.formatISO();
  }
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Obtener inicio de la semana según configuración del usuario
export function getWeekStart(date: LocalizedDate): LocalizedDate {
  const config = date.getLocaleConfig();
  const dayOfWeek = date.dayOfWeek;
  
  let daysToSubtract: number;
  if (config.weekStartsOn === 0) {
    // Semana empieza en domingo
    daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  } else {
    // Semana empieza en lunes
    daysToSubtract = dayOfWeek === 1 ? 0 : (dayOfWeek === 7 ? 6 : dayOfWeek - 1);
  }


  
  return date.subtractDays(daysToSubtract);
}

// Obtener fin de la semana según configuración del usuario
export function getWeekEnd(date: LocalizedDate): LocalizedDate {
  const config = date.getLocaleConfig();
  const dayOfWeek = date.dayOfWeek;
  
  let daysToAdd: number;
  if (config.weekStartsOn === 0) {
    // Semana termina en sábado
    daysToAdd = dayOfWeek === 6 ? 0 : (6 - dayOfWeek);
  } else {
    // Semana termina en domingo
    daysToAdd = dayOfWeek === 7 ? 0 : (7 - dayOfWeek);
  }
  
  return date.addDays(daysToAdd);
}

// Obtener todas las fechas de una semana con configuración dinámica
export function getWeekDates(date: Date | LocalizedDate, config?: LocaleConfig): LocalizedDate[] {
  let localizedDate: LocalizedDate;
  
  if (date instanceof LocalizedDate) {
    localizedDate = date;
  } else {
    localizedDate = new LocalizedDate(date, config);
  }
  
  const weekStart = getWeekStart(localizedDate);
  const dates: LocalizedDate[] = [];

  for (let i = 0; i < 7; i++) {
    dates.push(weekStart.addDays(i));
  }

  return dates;
}

// Obtener inicio del mes
export function getMonthStart(date: LocalizedDate): LocalizedDate {
  return date.with({ day: 1 });
}

// Obtener fin del mes
export function getMonthEnd(date: LocalizedDate): LocalizedDate {
  return date.with({ day: date.daysInMonth });
}

// Obtener todas las fechas visibles en el calendario del mes con configuración dinámica
export function getCalendarDates(date: Date | LocalizedDate, config?: LocaleConfig): {
  dates: LocalizedDate[];
  monthStart: LocalizedDate;
  monthEnd: LocalizedDate;
} {
  let localizedDate: LocalizedDate;
  
  if (date instanceof LocalizedDate) {
    localizedDate = date;
  } else {
    localizedDate = new LocalizedDate(date, config);
  }
  
  const monthStart = getMonthStart(localizedDate);
  const monthEnd = getMonthEnd(localizedDate);

  // Obtener el primer día de la cuadrícula (puede ser del mes anterior)
  const gridStart = getWeekStart(monthStart);

  // Obtener el último día de la cuadrícula (puede ser del mes siguiente)
  const gridEnd = getWeekEnd(monthEnd);

  const dates: LocalizedDate[] = [];
  let current = gridStart.clone();

  while (current.isBefore(gridEnd) || current.equals(gridEnd)) {
    dates.push(current.clone());
    current = current.addDays(1);
  }

  return { dates, monthStart, monthEnd };
}

// Verificar si una fecha está en el mes actual
export function isInCurrentMonth(date: LocalizedDate, month: LocalizedDate): boolean {
  return date.year === month.year && date.month === month.month;
}

// Normalizar fechas de diferentes formatos a ISO con configuración dinámica
export function normalizeDateInput(input: string, config?: LocaleConfig): string {
  // Si ya está en formato YYYY-MM-DD, devolver como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  // Detectar formato según configuración
  const localeConfig = config || getGlobalLocaleConfig();
  
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
    const date = LocalizedDate.fromShort(input, config);
    return date.formatISO();
  }

  throw new Error(`Formato de fecha no válido: ${input}. Use YYYY-MM-DD o el formato apropiado para su región`);
}

// Validar que una fecha string sea válida
export function isValidDate(dateStr: string, config?: LocaleConfig): boolean {
  try {
    parseDate(dateStr, config);
    return true;
  } catch {
    return false;
  }
}

// Verificar si una fecha es hoy con configuración dinámica
export function isToday(date: Date | LocalizedDate, config?: LocaleConfig): boolean {
  let today: LocalizedDate;
  
  if (date instanceof LocalizedDate) {
    today = LocalizedDate.now(date.getLocaleConfig());
    return date.equals(today);
  }

  // Comparar con objeto Date usando configuración
  today = LocalizedDate.now(config);
  return date.getFullYear() === today.year &&
         (date.getMonth() + 1) === today.month &&
         date.getDate() === today.day;
}

// Verificar si una fecha es anterior a hoy
export function isPast(date: LocalizedDate): boolean {
  const today = LocalizedDate.now(date.getLocaleConfig());
  return date.isBefore(today);
}

// Verificar si una fecha es futura
export function isFuture(date: LocalizedDate): boolean {
  const today = LocalizedDate.now(date.getLocaleConfig());
  return date.isAfter(today);
}

// Obtener fechas en un rango con configuración dinámica
export function getDateRange(start: LocalizedDate, end: LocalizedDate): LocalizedDate[] {
  const dates: LocalizedDate[] = [];
  let current = start.clone();

  while (!current.isAfter(end)) {
    dates.push(current.clone());
    current = current.addDays(1);
  }

  return dates;
}

// Calcular la diferencia en días entre dos fechas
export function getDaysDifference(date1: LocalizedDate, date2: LocalizedDate): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}


