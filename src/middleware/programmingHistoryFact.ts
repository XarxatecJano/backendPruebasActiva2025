import { MiddlewareHandler } from 'hono'

// Extender el tipo de contexto de Hono
declare module 'hono' {
  interface ContextVariableMap {
    fact: string
  }
}

const facts = [
  'El primer bug informático documentado fue una polilla encontrada en un relé en 1947.',
  'Ada Lovelace escribió en 1843 el primer algoritmo destinado a ser procesado por una máquina.',
  'COBOL fue diseñado en 1959 para que pudiera leerse casi como inglés natural.',
  'El lenguaje C fue creado por Dennis Ritchie en 1972 y aún hoy influye en la mayoría de lenguajes modernos.',
  'El símbolo @ en informática se popularizó cuando Ray Tomlinson lo usó para el primer envío de email en 1971.',
  'El primer videojuego conocido es “Tennis for Two”, creado en 1958, anterior incluso a “Pong”.',
  'Python fue creado por Guido van Rossum en Navidad de 1989 como un proyecto personal.',
  'El lenguaje Java originalmente se llamó Oak, inspirado en un árbol frente a la oficina.',
  'El primer disco duro de IBM (1956) pesaba más de una tonelada y almacenaba solo 5 MB.',
  'La palabra “debugging” ya existía antes de la informática, pero Grace Hopper la popularizó tras encontrar el famoso insecto.'
]

export const programmingHistoryFact: MiddlewareHandler = async (c, next) => {
  const fact = facts[Math.floor(Math.random() * facts.length)]
  c.set('fact', fact)

  await next()
}