# Glosa 2026 — Poder Ejecutivo del Estado de Querétaro

Aplicación estática en React, Vite y React Three Fiber para explorar comparecencias ante la LXI Legislatura. No necesita backend: los datos se cargan desde `public/` en el navegador. La identidad y los nombres suministrados son constantes de partida; verifica cargos, ortografía y vigencia antes de publicar. Las puntuaciones del ranking son conteos descriptivos de archivos, no una evaluación de desempeño.

## Instalar y publicar

Requiere Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
npm run build
npm run preview
```

Para Vercel: sube esta carpeta a un repositorio GitHub, importa el repositorio en Vercel, selecciona el directorio raíz del proyecto, Framework Preset **Vite**, Build Command `npm run build` y Output Directory `dist`. `vercel.json` ya contiene esos valores. Si guardas la aplicación dentro de una subcarpeta del repositorio, establece esa carpeta como Root Directory. No hay variables de entorno obligatorias. Cada cambio en `public/` requiere un nuevo despliegue. Los datos son públicos y descargables por cualquier visitante.

## Organización

```
public/
  documentos/logoQHE.png
  resumen/SEGOB.txt
  pregyresp/SEGOB.txt
  indicadores/SEGOB.txt
  analisis/SEGOB.txt
  munici/SEGOB.txt
  intersec/SEGOB.txt
  nube/SEGOB.txt
```

Repite el mismo código de archivo para las 18 dependencias: `SEGOB`, `SECFIN`, `SECPLAN`, `CONT`, `SEDESU`, `SEDEA`, `SDUOP`, `SEDESOQ`, `SEDEQ`, `SESEQ`, `SSC`, `SECTUR`, `SECULT`, `ST`, `SEJUVE`, `AMEQ`, `SEMUJERES`, `CEA`. Los nombres distinguen mayúsculas en Vercel. Codifica todos los `.txt` en UTF-8. No agregues rutas absolutas a los archivos. Los archivos pueden faltar: cada sección mostrará un estado vacío y el ranking asignará cero a los campos sin datos. No incluyas información privada o sin derecho de publicación.

**Logo:** coloca la imagen institucional autorizada en `public/documentos/logoQHE.png`. El núcleo carga esa ruta con `new THREE.TextureLoader().load(...)`; si falta o falla, se muestra una forma de reserva sin romper la escena. Comprueba licencia y uso institucional antes de desplegar. Las fotos remotas definidas en `src/data.js` son referencias de datos y no se muestran de forma predeterminada.

### `resumen/[CÓDIGO].txt`

Texto libre en párrafos separados por una línea vacía. Incluye contexto, puntos principales y conclusiones; usa un encabezado en texto si hace falta. La vista conserva los saltos de línea dentro de cada párrafo.

```text
La dependencia presentó sus principales resultados del periodo.

Tema: Cobertura territorial. Se describieron las intervenciones y sus alcances.
```

### `pregyresp/[CÓDIGO].txt`

Una intervención empieza al inicio de línea con `Pregunta [Nombre]:` o `Respuesta [Nombre]:`. También se admite `Pregunta Nombre:` y `Respuesta Nombre:`. Las líneas siguientes pertenecen a esa intervención hasta la siguiente etiqueta. Deja el nombre exactamente como deseas que aparezca; para que el buscador reconozca un diputado, usa su nombre completo según `src/data.js`. Las líneas previas a la primera intervención se muestran como nota. Cada encabezado `Pregunta` cuenta una pregunta en el ranking, salvo que `analisis/` defina una cifra explícita.

```text
Pregunta [Homero Barrera Mcdonald]: ¿Cuántos municipios recibieron el programa?
¿Con qué presupuesto?
Respuesta [Eric Gudiño Torres]: Se atendieron 12 municipios.
El presupuesto reportado fue de 20 millones de pesos.

Pregunta [Claudia Díaz Gayou]: ¿Cuál fue el resultado?
Respuesta [Eric Gudiño Torres]: El informe incluye el detalle.
```

Si una respuesta corresponde a varias preguntas, sepárala según el intercambio real. La aplicación no atribuye contenido automáticamente.

### `indicadores/[CÓDIGO].txt`

Texto libre, preferentemente una métrica por renglón con unidad, periodo, fuente y meta. Los números se cuentan mediante una detección simple; no se deduplican ni se validan contra documentos originales.

```text
Cobertura: 12 municipios de 18. Periodo: enero–agosto 2026.
Meta: 15 municipios. Fuente: informe de comparecencia.
```

### `analisis/[CÓDIGO].txt`

Una métrica por línea en formato `clave: valor` o `clave = valor`. Se permiten acentos, espacios y mayúsculas; internamente se normalizan a minúsculas con guion bajo. Las claves siguientes activan datos concretos:

| Clave recomendada | Uso |
| --- | --- |
| `preguntas` | Número de preguntas en ranking; si falta, cuenta las etiquetas `Pregunta` del diálogo. |
| `tiempo_minutos` | Minutos de intervención en ranking; no se infieren de la extensión del texto. |
| `datos_numericos` | Cantidad de datos numéricos en ranking; si falta, cuenta apariciones numéricas en indicadores. |
| `acciones` | Número de acciones en ranking; si falta, cuenta listas con `-`, `*`, `•` o `1.` en municipios e indicadores. |
| `gobernador_directas` | Menciones directas. |
| `gobernador_indirectas` | Menciones indirectas. |
| `aqui_contigo` | Menciones a las jornadas Aquí Contigo. |
| `plan_estatal_de_desarrollo` | Menciones al Plan Estatal de Desarrollo. |
| `puntos_de_friccion` | Breve texto mostrado en Relaciones. |

```text
preguntas: 8
tiempo_minutos: 42
datos_numericos: 17
acciones: 11
gobernador_directas: 3
gobernador_indirectas: 2
aqui_contigo: 1
plan_estatal_de_desarrollo: 4
puntos_de_friccion: Diferencia de criterios sobre la cobertura del programa.
```

Para las cuatro métricas del ranking, el valor debe ser un número no negativo. Un `0` explícito también puede activar la estimación de respaldo, por lo que si necesitas un cero exacto con contenido contradictorio, depura el archivo fuente. Los demás pares se visualizan como tarjetas; el texto completo se conserva debajo.

### `munici/[CÓDIGO].txt`

Texto libre sobre acciones por municipio; usa una viñeta por acción si deseas un conteo de respaldo. Escribe municipio, programa, periodo y resultado medible.

```text
- Querétaro: Programa A, 2026, 120 beneficiarios.
- San Juan del Río: Programa B, 2026, 2 instalaciones.
```

### `intersec/[CÓDIGO].txt`

Texto libre con acciones conjuntas y dependencias involucradas. Escribe el **código exacto** de la dependencia relacionada (`SECFIN`, `SEDEQ`, etc.) para que aparezca en el mapa de relaciones. En la vista de relaciones también se listan los nombres de quienes hicieron preguntas según `pregyresp/`. Evita atribuir fricciones sin evidencia; registra una fuente o referencia en el propio texto.

```text
SECFIN: coordinación presupuestaria para el programa A.
SEDEQ: colaboración en centros educativos.
```

### `nube/[CÓDIGO].txt`

Palabras o expresiones separadas por coma, punto y coma o salto de línea. Se muestran hasta 30 fragmentos como fondo visual decorativo. Para conservar frases de varias palabras, sepáralas con coma; el fondo no interpreta frecuencias. Si falta, aparece un fondo genérico.

```text
transparencia, participación, inversión, cobertura municipal, desarrollo
```

## Código y comportamiento

- `src/data.js`: titulares, diputados, lectura, análisis del diálogo y conteos.
- `src/main.jsx`: interfaz, escena 3D, ranking, búsqueda y paneles.
- `src/style.css`: diseño adaptable y temas. El tema elegido se guarda en `localStorage`.
- La búsqueda local filtra nombres, códigos y texto cargado; también encuentra diputados cuando su nombre aparece en un diálogo.
- El navegador carga los archivos de todas las dependencias en paralelo al abrir la página. Para colecciones mucho más grandes conviene generar un índice durante el build o cargar por demanda.
- El modo relaciones enumera diputados y dependencias detectadas en texto; no infiere una red semántica ni verifica hechos automáticamente.
- Si no hay WebGL, algunas plataformas no mostrarán la escena 3D. El ranking sigue siendo la vía tabular de consulta.
- Respeta `prefers-reduced-motion`; el tema claro se puede cambiar en el encabezado.

## Verificación editorial antes de publicar

Confirma cada titular, diputación, fecha, cifra y atribución contra la fuente oficial que corresponda. Añade fuente y periodo dentro de cada archivo. Esta interfaz no reemplaza la transcripción original ni audita automáticamente los datos.
