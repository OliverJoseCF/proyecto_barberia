-- ============================================
-- ESTRUCTURA DE BASE DE DATOS PARA CANTABARBA STUDIO
-- ============================================
-- Instrucciones:
-- 1. Crea una cuenta en Supabase (https://supabase.com)
-- 2. Crea un nuevo proyecto
-- 3. Ve a SQL Editor
-- 4. Copia y pega este script completo
-- 5. Ejecuta (Run)

-- ============================================
-- TABLA: citas
-- ============================================
CREATE TABLE IF NOT EXISTS public.citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nombre VARCHAR(100) NOT NULL,
  cliente_telefono VARCHAR(15) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(5) NOT NULL, -- Formato HH:MM (ej: "09:00", "14:30")
  servicio VARCHAR(100) NOT NULL,
  barbero VARCHAR(100) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- TABLA: servicios (OPCIONAL - para gestión)
-- ============================================
CREATE TABLE IF NOT EXISTS public.servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  duracion INTEGER NOT NULL, -- minutos
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABLA: barberos (OPCIONAL - para gestión)
-- ============================================
CREATE TABLE IF NOT EXISTS public.barberos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  especialidad TEXT,
  telefono VARCHAR(15),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- TABLA: recordatorios
-- ============================================
CREATE TABLE IF NOT EXISTS public.recordatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id UUID REFERENCES public.citas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('confirmacion', 'recordatorio', 'seguimiento')),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
  fecha_envio TIMESTAMP WITH TIME ZONE,
  mensaje TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ÍNDICES para optimizar consultas
-- ============================================
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON public.citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_barbero ON public.citas(barbero);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_telefono ON public.citas(cliente_telefono);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_barbero ON public.citas(fecha, barbero);
CREATE INDEX IF NOT EXISTS idx_recordatorios_cita ON public.recordatorios(cita_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_estado ON public.recordatorios(estado);

-- ============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- INSERTAR DATOS INICIALES: Servicios
-- ============================================
INSERT INTO public.servicios (nombre, descripcion, precio, duracion) VALUES
  ('Corte de Cabello (Hombre)', 'Cortes modernos y clásicos adaptados a tu estilo personal', 250.00, 45),
  ('Corte de Cabello (Niño)', 'Corte especial para niños', 200.00, 30),
  ('Arreglo de Barba', 'Definición y estilizado de barba con técnicas profesionales', 150.00, 30),
  ('Afeitado Clásico', 'Experiencia tradicional con navaja, toallas calientes y acabado perfecto', 200.00, 45),
  ('Tintes', 'Coloración profesional con productos de alta calidad', 400.00, 90),
  ('Diseños Capilares', 'Diseños únicos y personalizados para expresar tu personalidad', 300.00, 60),
  ('Tratamientos Barba y Cejas', 'Tratamientos especializados para barba y perfilado de cejas', 180.00, 30),
  ('Faciales y Skincare', 'Faciales, mascarillas y exfoliaciones para el cuidado completo de la piel', 350.00, 60)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- INSERTAR DATOS INICIALES: Barberos
-- ============================================
INSERT INTO public.barberos (nombre, especialidad, telefono, email) VALUES
  ('Ángel Ramírez', 'Cortes clásicos y modernos, diseños capilares', '5512345678', 'angel@cantabarba.com'),
  ('Emiliano Vega', 'Barbería tradicional, afeitado con navaja', '5598765432', 'emiliano@cantabarba.com')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública de servicios y barberos
CREATE POLICY "Permitir lectura pública de servicios"
  ON public.servicios FOR SELECT
  USING (true);

CREATE POLICY "Permitir lectura pública de barberos"
  ON public.barberos FOR SELECT
  USING (true);

-- Política: Permitir inserción pública de citas (para el formulario web)
CREATE POLICY "Permitir inserción pública de citas"
  ON public.citas FOR INSERT
  WITH CHECK (true);

-- Política: Permitir lectura de citas (para verificar disponibilidad)
CREATE POLICY "Permitir lectura pública de citas"
  ON public.citas FOR SELECT
  USING (true);

-- Política: Permitir actualización pública de citas
-- NOTA: En producción, cambiar esto a requerir autenticación
CREATE POLICY "Permitir actualización pública de citas"
  ON public.citas FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política: Permitir eliminación pública de citas
-- NOTA: En producción, cambiar esto a requerir autenticación
CREATE POLICY "Permitir eliminación pública de citas"
  ON public.citas FOR DELETE
CREATE POLICY "Permitir eliminación pública de citas"
  ON public.citas FOR DELETE
  USING (true);

-- ============================================
-- FUNCIÓN: Verificar disponibilidad de horario
-- ============================================
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad(
  p_fecha DATE,
  p_hora TIME,
  p_barbero VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.citas
    WHERE fecha = p_fecha
      AND hora = p_hora
      AND barbero = p_barbero
      AND estado IN ('pendiente', 'confirmada')
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTA: Estadísticas del día
-- ============================================
CREATE OR REPLACE VIEW public.estadisticas_hoy AS
SELECT
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
  COUNT(*) FILTER (WHERE estado = 'confirmada') AS confirmadas,
  COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
  COUNT(*) FILTER (WHERE estado = 'cancelada') AS canceladas,
  COUNT(*) AS total
FROM public.citas
WHERE fecha = CURRENT_DATE;

-- ============================================
-- VISTA: Citas del mes
-- ============================================
CREATE OR REPLACE VIEW public.citas_mes_actual AS
SELECT *
FROM public.citas
WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY fecha, hora;

-- ============================================
-- FINALIZADO
-- ============================================
-- ✅ Base de datos lista para usar
-- 
-- PRÓXIMOS PASOS:
-- 1. Ve a Settings > API en Supabase
-- 2. Copia tu Project URL y anon key
-- 3. Crea un archivo .env en tu proyecto
-- 4. Agrega las credenciales:
--    VITE_SUPABASE_URL=tu-url
--    VITE_SUPABASE_ANON_KEY=tu-key
-- 5. ¡Listo! Tu app se conectará automáticamente
