-- ============================================================
-- MusicTrack — Seed inicial
-- Inserta los 12 instrumentos del catálogo en la tabla products.
-- Ejecutar DESPUÉS de 001_init.sql.
-- ============================================================

-- Limpio antes de insertar (idempotente)
delete from public.products;

-- Reinicio la secuencia para que los ids empiecen en 1
alter sequence public.products_id_seq restart with 1;

insert into public.products (name, price, description, category, image, stock) values
(
  'Stratocaster Vintage Sunburst',
  850000,
  'Guitarra electrica estilo Stratocaster. Cuerpo de aliso, mastil de arce con diapason de palo de rosa, 3 pastillas single coil, puente con tremolo. Sonido limpio y cristalino, ideal para blues, rock y funk. Acabado sunburst clasico.',
  'Electricas',
  '/products/stratocaster.jpg',
  8
),
(
  'Les Paul Standard Cherry',
  1250000,
  'Guitarra electrica de cuerpo solido con tapa de arce flameado y caoba en el cuerpo. Mastil de caoba con diapason de palo de rosa. Dos pastillas humbucker, puente Tune-O-Matic. Sustain prolongado, sonido grueso y calido. Hecha para rock y hard rock.',
  'Electricas',
  '/products/lespaul.jpg',
  5
),
(
  'Telecaster Butterscotch',
  780000,
  'Guitarra electrica de cuerpo de fresno acabado butterscotch blonde. Mastil de arce de una sola pieza, dos pastillas single coil con bridge plate de acero. Brillante, mordiente y articulada. Iconica del country, rock e indie.',
  'Electricas',
  '/products/telecaster.png',
  7
),
(
  'SG Special Cherry',
  620000,
  'Guitarra electrica de caoba solida con doble cutaway profundo. Mastil delgado de caoba, dos humbuckers de salida media. Liviana, comoda y agresiva. Pensada para rock duro y hard rock estilo Angus Young.',
  'Electricas',
  '/products/sg.jpg',
  6
),
(
  'Acustica Folk Dreadnought',
  320000,
  'Guitarra acustica con caja Dreadnought, tapa de pino abeto macizo y aros y fondo de caoba. Mastil de nato, diapason de palo de rosa. Cuerdas de acero. Proyeccion potente y graves marcados. Ideal para acompanar canto.',
  'Acusticas',
  '/products/folk.jpg',
  12
),
(
  'Clasica de Concierto Nylon',
  280000,
  'Guitarra clasica con cuerdas de nylon. Tapa de cedro, fondo y aros de palo de rosa, mastil de cedro. Diapason de ebano. Sonido calido y dulce, ideal para folklore, bossa nova y musica clasica.',
  'Acusticas',
  '/products/clasica.png',
  10
),
(
  'Electroacustica Jumbo',
  480000,
  'Guitarra electroacustica con caja Jumbo y cutaway. Tapa de pino abeto macizo, preamplificador con afinador integrado y EQ de 3 bandas. Conexion jack 1/4 para amplificar. Versatil para vivo y grabacion.',
  'Acusticas',
  '/products/electroacustica.jpg',
  8
),
(
  'Jazz Bass 4 Cuerdas',
  720000,
  'Bajo electrico estilo Jazz Bass de 4 cuerdas. Cuerpo de aliso, mastil de arce con diapason de palo de rosa. Dos pastillas single coil con controles de volumen independientes y tono maestro. Mastil delgado, sonido moderno y articulado.',
  'Bajos',
  '/products/jazzbass.jpg',
  4
),
(
  'Precision Bass Active',
  890000,
  'Bajo electrico estilo Precision con electronica activa. Cuerpo de aliso, mastil de arce. Pastilla split coil + jazz en el puente. Preamplificador activo con EQ de 2 bandas. Punch profundo, ideal para rock y funk.',
  'Bajos',
  '/products/precisionbass.jpg',
  3
),
(
  'Amplificador 30W Combo',
  245000,
  'Amplificador combo de 30W con parlante de 10 pulgadas. Dos canales (limpio y crunch), reverb digital, entrada auxiliar para celular y salida de auriculares. Ideal para practica y ensayos chicos.',
  'Accesorios',
  '/products/amplificador.jpg',
  15
),
(
  'Pedal de Distorsion Vintage',
  89000,
  'Pedal de distorsion analogico con tres controles: volumen, tono y ganancia. Bypass real, alimentacion 9V (no incluye fuente). Sonido grueso y armonico estilo amplificador valvular. Construccion metalica robusta.',
  'Accesorios',
  '/products/pedal.jpg',
  25
),
(
  'Set de Cuerdas Acero 0.10',
  18500,
  'Juego completo de cuerdas para guitarra electrica calibre 0.10-0.46. Nucleo de acero hexagonal con entorchado de niquel. Empacadas individualmente con sellado anti-corrosion. Sonido brillante y duradero.',
  'Accesorios',
  '/products/cuerdas.jpg',
  100
);

-- Verificación
-- select id, name, category, price, stock from public.products order by id;
