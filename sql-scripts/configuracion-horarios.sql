-- ============================================
-- TABLAS PARA CONFIGURACIÓN DE HORARIOS
-- ============================================

-- Tabla de configuración general
CREATE TABLE IF NOT EXISTS public.configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) DEFAULT 'texto', -- texto, numero, json, boolean
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabla de horarios semanales
CREATE TABLE IF NOT EXISTS public.horarios_semanales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, ..., 6=Sábado
  activo BOOLEAN DEFAULT true,
  hora_apertura TIME NOT NULL,
  hora_cierre TIME NOT NULL,
  pausa_inicio TIME,
  pausa_fin TIME,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(dia_semana)
);

-- Tabla de días festivos/cerrados
CREATE TABLE IF NOT EXISTS public.dias_festivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  recurrente BOOLEAN DEFAULT false, -- Si se repite cada año (ej: Navidad)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(fecha)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_horarios_dia ON public.horarios_semanales(dia_semana);
CREATE INDEX IF NOT EXISTS idx_festivos_fecha ON public.dias_festivos(fecha);
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON public.configuracion(clave);

-- Trigger para actualizar updated_at
CREATE TRIGGER set_updated_at_horarios
  BEFORE UPDATE ON public.horarios_semanales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_configuracion
  BEFORE UPDATE ON public.configuracion
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- DATOS INICIALES: Horarios por defecto
-- ============================================
INSERT INTO public.horarios_semanales (dia_semana, activo, hora_apertura, hora_cierre) VALUES
  (1, true, '09:00', '19:00'),  -- Lunes
  (2, true, '09:00', '19:00'),  -- Martes
  (3, true, '09:00', '19:00'),  -- Miércoles
  (4, true, '09:00', '19:00'),  -- Jueves
  (5, true, '09:00', '20:00'),  -- Viernes
  (6, true, '09:00', '18:00'),  -- Sábado
  (0, false, '10:00', '14:00')  -- Domingo (cerrado por defecto)
ON CONFLICT (dia_semana) DO NOTHING;

-- ============================================
-- DATOS INICIALES: Configuración
-- ============================================
INSERT INTO public.configuracion (clave, valor, descripcion, tipo) VALUES
  ('intervalo_citas_minutos', '30', 'Intervalo de tiempo entre citas en minutos', 'numero'),
  ('anticipacion_minima_horas', '2', 'Horas mínimas de anticipación para agendar', 'numero'),
  ('anticipacion_maxima_dias', '30', 'Días máximos de anticipación para agendar', 'numero')
ON CONFLICT (clave) DO NOTHING;

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dias_festivos ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública
CREATE POLICY "Permitir lectura pública de configuración"
  ON public.configuracion FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de horarios"
  ON public.horarios_semanales FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de festivos"
  ON public.dias_festivos FOR SELECT
  USING (true);

-- Políticas: Solo admins pueden modificar (requiere autenticación)
-- Nota: Ajustar según tu sistema de autenticación
CREATE POLICY "Solo admins pueden modificar configuración"
  ON public.configuracion FOR ALL
  USING (true); -- Temporal: permitir todo. Cambiar cuando tengas auth

CREATE POLICY "Solo admins pueden modificar horarios"
  ON public.horarios_semanales FOR ALL
  USING (true);

CREATE POLICY "Solo admins pueden modificar festivos"
  ON public.dias_festivos FOR ALL
  USING (true);

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE public.configuracion IS 'Configuración general del sistema';
COMMENT ON TABLE public.horarios_semanales IS 'Horarios de trabajo por día de la semana';
COMMENT ON TABLE public.dias_festivos IS 'Días cerrados o festivos';
