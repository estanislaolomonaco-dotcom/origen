// Catalogo de instrumentos musicales de Origen.
// 4 guitarras electricas, 3 acusticas, 2 bajos, 3 accesorios.

export const products = [
  {
    id: 1,
    name: "Stratocaster Vintage Sunburst",
    price: 850000,
    description:
      "Guitarra electrica estilo Stratocaster. Cuerpo de aliso, mastil de arce con diapason de palo de rosa, 3 pastillas single coil, puente con tremolo. Sonido limpio y cristalino, ideal para blues, rock y funk. Acabado sunburst clasico.",
    category: "Electricas",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    stock: 8,
  },
  {
    id: 2,
    name: "Les Paul Standard Cherry",
    price: 1250000,
    description:
      "Guitarra electrica de cuerpo solido con tapa de arce flameado y caoba en el cuerpo. Mastil de caoba con diapason de palo de rosa. Dos pastillas humbucker, puente Tune-O-Matic. Sustain prolongado, sonido grueso y calido. Hecha para rock y hard rock.",
    category: "Electricas",
    image:
      "https://images.unsplash.com/photo-1564186763-fc1da1a8a3c0?w=800&q=80",
    stock: 5,
  },
  {
    id: 3,
    name: "Telecaster Butterscotch",
    price: 780000,
    description:
      "Guitarra electrica de cuerpo de fresno acabado butterscotch blonde. Mastil de arce de una sola pieza, dos pastillas single coil con bridge plate de acero. Brillante, mordiente y articulada. Iconica del country, rock e indie.",
    category: "Electricas",
    image:
      "https://images.unsplash.com/photo-1564186763-2f5e0e96f1f4?w=800&q=80",
    stock: 7,
  },
  {
    id: 4,
    name: "SG Special Cherry",
    price: 620000,
    description:
      "Guitarra electrica de caoba solida con doble cutaway profundo. Mastil delgado de caoba, dos humbuckers de salida media. Liviana, comoda y agresiva. Pensada para rock duro y hard rock estilo Angus Young.",
    category: "Electricas",
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80",
    stock: 6,
  },
  {
    id: 5,
    name: "Acustica Folk Dreadnought",
    price: 320000,
    description:
      "Guitarra acustica con caja Dreadnought, tapa de pino abeto macizo y aros y fondo de caoba. Mastil de nato, diapason de palo de rosa. Cuerdas de acero. Proyeccion potente y graves marcados. Ideal para acompanar canto.",
    category: "Acusticas",
    image:
      "https://images.unsplash.com/photo-1493225458734-fcc6cf62c4c5?w=800&q=80",
    stock: 12,
  },
  {
    id: 6,
    name: "Clasica de Concierto Nylon",
    price: 280000,
    description:
      "Guitarra clasica con cuerdas de nylon. Tapa de cedro, fondo y aros de palo de rosa, mastil de cedro. Diapason de ebano. Sonido calido y dulce, ideal para folklore, bossa nova y musica clasica.",
    category: "Acusticas",
    image:
      "https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&q=80",
    stock: 10,
  },
  {
    id: 7,
    name: "Electroacustica Jumbo",
    price: 480000,
    description:
      "Guitarra electroacustica con caja Jumbo y cutaway. Tapa de pino abeto macizo, preamplificador con afinador integrado y EQ de 3 bandas. Conexion jack 1/4 para amplificar. Versatil para vivo y grabacion.",
    category: "Acusticas",
    image:
      "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?w=800&q=80",
    stock: 8,
  },
  {
    id: 8,
    name: "Jazz Bass 4 Cuerdas",
    price: 720000,
    description:
      "Bajo electrico estilo Jazz Bass de 4 cuerdas. Cuerpo de aliso, mastil de arce con diapason de palo de rosa. Dos pastillas single coil con controles de volumen independientes y tono maestro. Mastil delgado, sonido moderno y articulado.",
    category: "Bajos",
    image:
      "https://images.unsplash.com/photo-1583120715055-c5dba93cf67d?w=800&q=80",
    stock: 4,
  },
  {
    id: 9,
    name: "Precision Bass Active",
    price: 890000,
    description:
      "Bajo electrico estilo Precision con electronica activa. Cuerpo de aliso, mastil de arce. Pastilla split coil + jazz en el puente. Preamplificador activo con EQ de 2 bandas. Punch profundo, ideal para rock y funk.",
    category: "Bajos",
    image:
      "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800&q=80",
    stock: 3,
  },
  {
    id: 10,
    name: "Amplificador 30W Combo",
    price: 245000,
    description:
      "Amplificador combo de 30W con parlante de 10 pulgadas. Dos canales (limpio y crunch), reverb digital, entrada auxiliar para celular y salida de auriculares. Ideal para practica y ensayos chicos.",
    category: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1556379118-7034d926d258?w=800&q=80",
    stock: 15,
  },
  {
    id: 11,
    name: "Pedal de Distorsion Vintage",
    price: 89000,
    description:
      "Pedal de distorsion analogico con tres controles: volumen, tono y ganancia. Bypass real, alimentacion 9V (no incluye fuente). Sonido grueso y armonico estilo amplificador valvular. Construccion metalica robusta.",
    category: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1571974599782-87624638275a?w=800&q=80",
    stock: 25,
  },
  {
    id: 12,
    name: "Set de Cuerdas Acero 0.10",
    price: 18500,
    description:
      "Juego completo de cuerdas para guitarra electrica calibre 0.10-0.46. Nucleo de acero hexagonal con entorchado de niquel. Empacadas individualmente con sellado anti-corrosion. Sonido brillante y duradero.",
    category: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1599642010050-7e2f1bbd0e93?w=800&q=80",
    stock: 100,
  },
];

export const categories = [
  "Electricas",
  "Acusticas",
  "Bajos",
  "Accesorios",
];

// Helpers para obtener productos.
export function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}

export function getRelatedProducts(productId, category, limit = 4) {
  return products
    .filter((p) => p.id !== Number(productId) && p.category === category)
    .slice(0, limit);
}
