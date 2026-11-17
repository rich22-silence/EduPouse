import { useEffect, useState } from 'react'
import './App.css'

type Subject = 'Mathématiques' | 'Français' | 'Physique-chimie' | 'SVT' | 'Histoire-géo' | 'Anglais' | 'SES' | 'SNT & technologie'
type Question = { id: string; subject: Subject; level: string; difficulty: string; type: 'choice' | 'truefalse'; prompt: string; answers: string[]; correct: string; explanation: string }
type Challenge = { subject: Subject | 'Mixte'; mode: string; difficulty: string; count: number; seconds: number; level: string }
type Result = { score: number; correct: number; total: number; elapsed: number; subject: string; date: string }
type AgendaEvent = { id: string; title: string; date: string; time: string; subject: string }
const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const subjects: { name: Subject; icon: string; tone: string; topic: string }[] = [
  { name: 'Mathématiques', icon: '∑', tone: 'violet', topic: 'Algèbre & fonctions' }, { name: 'Français', icon: 'Aa', tone: 'rose', topic: 'Langue & littérature' },
  { name: 'Physique-chimie', icon: '⚗', tone: 'blue', topic: 'Matière & énergie' }, { name: 'SVT', icon: '✿', tone: 'green', topic: 'Le vivant & la Terre' },
  { name: 'Histoire-géo', icon: '◷', tone: 'orange', topic: 'Repères & territoires' }, { name: 'Anglais', icon: '文', tone: 'cyan', topic: 'Vocabulary & grammar' },
  { name: 'SES', icon: '↗', tone: 'yellow', topic: 'Économie & société' }, { name: 'SNT & technologie', icon: '⌘', tone: 'purple', topic: 'Numérique & innovation' },
]
const bank: Question[] = []
// Each subject has a thousand deterministic, level-tagged question records. Template families
// are deliberately bounded to the French seconde curriculum and produce reproducible variants.
for (const [si, subjectInfo] of subjects.entries()) {
  const subject = subjectInfo.name
  for (let i = 0; i < 1000; i++) {
    const n = i + 1; const a = (n * 7 + si * 11) % 19 + 2; const b = (n * 13 + si * 5) % 17 + 3; const c = (n * 3 + si * 7) % 9 + 2
    let prompt = ''; let correct = ''; let wrong = ''; let explanation = ''; let type: Question['type'] = 'choice'
    switch (subject) {
      case 'Mathématiques': {
        const mode = n % 5
        if (mode === 0) { prompt = `Calculer ${a}² − ${b}².`; correct = String(a * a - b * b); wrong = `${a * a + b * b}`; explanation = `Différence de deux carrés : ${a}² − ${b}² = (${a} − ${b})(${a} + ${b}) = ${a * a - b * b}.` }
        else if (mode === 1) { prompt = `Résoudre ${a}x + ${b} = ${a * c + b}.`; correct = String(c); wrong = String(c + 1); explanation = `On soustrait ${b}, puis on divise par ${a} : x = ${c}.` }
        else if (mode === 2) { prompt = `Quelle est l'image de ${c} par f(x) = ${a}x − ${b} ?`; correct = String(a * c - b); wrong = String(a * c + b); explanation = `f(${c}) = ${a} × ${c} − ${b} = ${a * c - b}.` }
        else if (mode === 3) { prompt = `Développer ${a}(x + ${b}).`; correct = `${a}x + ${a * b}`; wrong = `${a}x + ${b}`; explanation = `La distributivité donne ${a} × x + ${a} × ${b}, soit ${a}x + ${a * b}.` }
        else { prompt = `Un article à ${a * 10} € bénéficie d'une réduction de ${b * 5} %. Quel est le prix réduit ?`; correct = `${(a * 10 * (100 - b * 5) / 100).toFixed(2)} €`; wrong = `${(a * 10 * (1 + b * 5 / 100)).toFixed(2)} €`; explanation = `On multiplie le prix par 1 − ${b * 5}/100.` }
        break
      }
      case 'Français': {
        const modes = [
          [`Dans « ${['Les élèves attentifs prennent des notes.', 'Elle réfléchit avant de répondre.', 'Nous avançons avec confiance.'][n % 3]} », quelle classe grammaticale est visée par le mot souligné ?`, ['un adjectif qualificatif', 'un adverbe', 'un verbe conjugué', 'un déterminant'], (n % 3 === 0 ? 'un adjectif qualificatif' : n % 3 === 1 ? 'un adverbe' : 'un verbe conjugué'), 'La classe grammaticale dépend de la nature du mot dans la phrase.'],
          ['Quel temps exprime principalement une action achevée dans le passé et liée au présent ?', ['Le passé composé', 'L’imparfait', 'Le futur simple', 'Le présent'], 'Le passé composé', 'Le passé composé présente un fait accompli dans le passé.'],
          ['Dans une argumentation, à quoi sert un exemple ?', ['À illustrer ou appuyer un argument', 'À remplacer la thèse', 'À annoncer le plan uniquement', 'À conclure sans justification'], 'À illustrer ou appuyer un argument', 'Un exemple concret rend l’argument plus compréhensible et convaincant.'],
          ['Quelle figure de style rapproche deux éléments avec un outil de comparaison ?', ['La comparaison', 'La métaphore', 'La personnification', 'L’hyperbole'], 'La comparaison', 'La comparaison utilise un outil comme « tel », « comme » ou « pareil à ».'],
        ]; const row = modes[n % modes.length] as [string, string[], string, string]; prompt = row[0]; correct = row[2]; wrong = row[1].find(x => x !== correct) ?? row[1][0]; explanation = row[3]; break
      }
      case 'Physique-chimie': {
        const mode = n % 4
        if (mode === 0) { prompt = `Une masse de ${a * 10} g occupe ${b * 2} cm³. Quelle est sa masse volumique ?`; correct = `${(a * 10 / (b * 2)).toFixed(2)} g/cm³`; wrong = `${(b * 2 / (a * 10)).toFixed(2)} g/cm³`; explanation = `La masse volumique ρ = m/V = ${a * 10}/${b * 2} g/cm³.` }
        else if (mode === 1) { prompt = `Combien d'électrons possède un atome neutre de numéro atomique Z = ${a} ?`; correct = String(a); wrong = String(a + 1); explanation = `Un atome neutre possède autant d'électrons que de protons : ${a}.` }
        else if (mode === 2) { prompt = `Une voiture parcourt ${a * 5} m en ${b} s. Quelle est sa vitesse moyenne ?`; correct = `${(a * 5 / b).toFixed(1)} m/s`; wrong = `${(b / (a * 5)).toFixed(1)} m/s`; explanation = `v = distance / durée = ${a * 5}/${b} = ${(a * 5 / b).toFixed(1)} m/s.` }
        else { prompt = `Dans une solution aqueuse, le soluté est la substance qui…`; correct = 'se dissout dans le solvant'; wrong = 'dissout toujours le solvant'; explanation = 'Une solution est un mélange homogène obtenu quand un soluté se dissout dans un solvant.' }
        break
      }
      case 'SVT': {
        const set = [
          ['Quel est le rôle principal de l’ADN dans une cellule ?', 'Porter une information génétique', 'Produire directement toute l’énergie', 'Former la membrane cellulaire', 'L’ADN contient l’information nécessaire au fonctionnement et à la transmission des caractères.'],
          ['Quelle structure réalise la photosynthèse dans une cellule végétale ?', 'Le chloroplaste', 'La mitochondrie', 'Le noyau', 'Les chloroplastes contiennent la chlorophylle et captent l’énergie lumineuse.'],
          ['Quelle est la conséquence de la sélection naturelle ?', 'Une meilleure reproduction de certains individus dans un milieu donné', 'La transformation volontaire des individus', 'La disparition de toute variation', 'Dans un environnement donné, certains caractères favorisent la survie et la reproduction.'],
          ['Quel processus permet le renouvellement de la matière dans un écosystème ?', 'Les échanges entre producteurs, consommateurs et décomposeurs', 'La disparition des producteurs', 'La consommation exclusive de matière minérale', 'Les chaînes alimentaires et les décomposeurs assurent le recyclage de la matière.'],
        ]; const row = set[n % set.length]; prompt = row[0]; correct = row[1]; wrong = row[2]; explanation = row[4]; break
      }
      case 'Histoire-géo': {
        const set = [
          ['Quel changement caractérise principalement la Renaissance en Europe ?', 'Un renouveau artistique et intellectuel inspiré de l’Antiquité', 'La disparition des villes', 'La fin de toute circulation des idées', 'Humanisme, imprimerie et innovations artistiques marquent la Renaissance.'],
          ['Qu’appelle-t-on une métropole ?', 'Une grande ville qui concentre des fonctions de commandement', 'Un espace exclusivement rural', 'Une frontière naturelle', 'Une métropole concentre population, emplois et fonctions de décision.'],
          ['Quel document représente la Terre ou une partie de celle-ci à échelle réduite ?', 'Une carte', 'Un récit', 'Un organigramme', 'Une carte est une représentation plane et réduite d’un espace géographique.'],
          ['Quel phénomène désigne l’augmentation de la part de la population vivant en ville ?', 'L’urbanisation', 'La déforestation', 'La désertification', 'L’urbanisation correspond à la croissance des villes et de la population urbaine.'],
        ]; const row = set[n % set.length]; prompt = row[0]; correct = row[1]; wrong = row[2]; explanation = row[3]; break
      }
      case 'Anglais': {
        const set = [
          ['Choose the correct form: “She ___ to school every day.”', 'goes', 'go', 'The third-person singular in the present simple takes -s: she goes.'],
          ['What is the closest meaning of “to improve”?', 'to make better', 'to forget', '“To improve” means to make progress or become better.'],
          ['Complete: “If I had more time, I ___ a new language.”', 'would learn', 'will learned', 'The second conditional uses if + past, then would + infinitive.'],
          ['Which word is a comparative adjective?', 'more interesting', 'interestingly', 'A comparative adjective compares two things; “more interesting” does this.'],
        ]; const row = set[n % set.length]; prompt = row[0]; correct = row[1]; wrong = row[2]; explanation = row[3]; break
      }
      case 'SES': {
        const set = [
          ['Qu’est-ce qu’un marché ?', 'Un lieu réel ou fictif où se rencontrent offre et demande', 'Un impôt payé par les ménages', 'Un indicateur de population', 'Le marché organise la rencontre entre vendeurs et acheteurs.'],
          ['Le PIB mesure principalement…', 'La valeur des richesses produites sur un territoire en une période', 'Le bonheur individuel de chaque habitant', 'La quantité de monnaie détenue par l’État', 'Le produit intérieur brut mesure la production réalisée sur un territoire.'],
          ['Une ressource rare est une ressource…', 'dont la quantité est limitée au regard des besoins', 'disponible sans limite', 'qui n’a aucune utilité', 'La rareté implique de faire des choix entre des usages possibles.'],
          ['Quel acteur consomme et peut offrir son travail ?', 'Un ménage', 'Une banque centrale uniquement', 'Une association sportive uniquement', 'Les ménages consomment des biens et services et offrent leur travail aux organisations.'],
        ]; const row = set[n % set.length]; prompt = row[0]; correct = row[1]; wrong = row[2]; explanation = row[3]; break
      }
      case 'SNT & technologie': {
        const set = [
          ['À quoi sert principalement une adresse IP ?', 'Identifier un appareil sur un réseau', 'Chiffrer automatiquement tous les fichiers', 'Remplacer un mot de passe', 'L’adresse IP permet d’identifier et d’acheminer des données vers un appareil connecté.'],
          ['Que signifie une donnée binaire ?', 'Une donnée codée avec des 0 et des 1', 'Une donnée toujours écrite en deux langues', 'Une image sans pixels', 'Les systèmes numériques représentent l’information à l’aide de bits (0 ou 1).'],
          ['Quel est le rôle d’un algorithme ?', 'Décrire une suite finie d’instructions pour résoudre un problème', 'Stocker uniquement des images', 'Connecter deux écrans sans logiciel', 'Un algorithme décrit une méthode ordonnée et non ambiguë.'],
          ['Quel geste protège le mieux un compte en ligne ?', 'Utiliser un mot de passe long et unique', 'Réutiliser le même mot de passe partout', 'Partager son code de validation', 'Un mot de passe unique limite l’impact d’une fuite sur d’autres comptes.'],
        ]; const row = set[n % set.length]; prompt = row[0]; correct = row[1]; wrong = row[2]; explanation = row[3]; break
      }
    }
    const answers = [correct, wrong, ...((n % 2 === 0) ? ['Aucune de ces réponses', 'Toutes les réponses'] : ['Cela dépend du contexte', 'Impossible à déterminer'])]
    bank.push({ id: `${si}-${n}`, subject, level: 'Seconde', difficulty: n % 3 === 0 ? 'Difficile' : n % 3 === 1 ? 'Facile' : 'Intermédiaire', type, prompt, answers: answers.sort((x, y) => ((x.length + n) % 7) - ((y.length + n) % 7)), correct, explanation })
  }
}
const initialFavorites = (): string[] => { try { return JSON.parse(localStorage.getItem('ep-favorites') ?? '[]') as string[] } catch { return [] } }
const getResults = (): Result[] => { try { return JSON.parse(localStorage.getItem('ep-results') ?? '[]') as Result[] } catch { return [] } }
const modes = [ ['Questions éclair', 'challenges', 'Une question, un chrono, un réflexe.'], ['Quiz classique', 'results', 'Comprends chaque réponse avec son explication.'], ['Sprint chrono', 'clock', 'Combien de bonnes réponses en 60 secondes ?'], ['Vrai ou faux', 'check', 'Aiguise ton esprit critique.'], ['Défi surprise', 'sparkles', 'Laisse le hasard choisir ton prochain défi.'], ['Défi mixte', 'mix', 'Passe d’une matière à l’autre.'] ] as const
function secureRandomInt(max: number): number {
  const range = 0x1_0000_0000
  const limit = Math.floor(range / max) * max
  const value = new Uint32Array(1)
  do crypto.getRandomValues(value); while (value[0] >= limit)
  return value[0] % max
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const carouselSlides = [
    { kicker: 'ÉCOLES INTERNATIONALES MAARIF · TOGO', title: 'Bienvenue dans ton univers d’apprentissage.', sub: 'Découvre un lieu où les idées grandissent et où chaque journée ouvre de nouvelles possibilités.', image: 'https://tg.ecolesmaarif.org/uploads/banner/list/1643e92d34f13d.webp', credit: 'https://tg.ecolesmaarif.org/photo', action: 'explore' },
    { kicker: 'APPRENDRE · OSER · RÉUSSIR', title: 'Chaque élève peut aller plus loin.', sub: 'Le travail, la curiosité et la confiance transforment les projets en réussite.', image: 'https://tg.ecolesmaarif.org/uploads/16a61df84f3a55.webp', credit: 'https://tg.ecolesmaarif.org/news', action: 'planning' },
    { kicker: 'UNE ÉCOLE OUVERTE SUR LE MONDE', title: 'Les grandes idées commencent par une question.', sub: 'Explore les sciences, les langues et les cultures avec EduPouse.', image: 'https://tg.ecolesmaarif.org/uploads/16a61f888f35d9.webp', credit: 'https://tg.ecolesmaarif.org/news', action: 'explore' },
    { kicker: 'GRANDE SCIENTIFIQUE · MARIE CURIE', title: 'La curiosité fait avancer le monde.', sub: '« Rien dans la vie n’est à craindre, tout est à comprendre. » Découvre, observe et expérimente.', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Marie_Curie_c1920.jpg', credit: 'https://commons.wikimedia.org/wiki/File:Marie_Curie_c1920.jpg', action: 'science' },
    { kicker: 'GRAND SCIENTIFIQUE · ALBERT EINSTEIN', title: 'Imagine. Questionne. Comprends.', sub: 'Les sciences commencent souvent par une idée audacieuse et l’envie de chercher.', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg', credit: 'https://commons.wikimedia.org/wiki/File:Albert_Einstein_Head.jpg', action: 'math' },
  ] as const

const iconPaths = {
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  challenges: 'm13 2-9 12h6l-1 8 11-13h-6l1-7z',
  calendar: 'M4 5h16a1 1 0 0 1 1 1v14H3V6a1 1 0 0 1 1-1Zm3-2v4m10-4v4M3 10h18',
  favorites: 'M20.8 8.6c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z',
  results: 'M4 19V5m0 14h17M8 15l3-4 3 2 5-7',
  settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-6v3m0 13v3m10-9h-3M5 12H2m17.1-7.1-2.1 2.1M7 17l-2.1 2.1m14.2 0L17 17M7 7 4.9 4.9',
  back: 'm15 18-6-6 6-6M9 12h12',
  next: 'M4 12h12m-6-6 6 6-6 6',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2',
  check: 'm5 12 4 4L19 6',
  sparkles: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 11 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14ZM5 2l.8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z',
  mix: 'M4 7h2a5 5 0 0 1 5 5 5 5 0 0 0 5 5h4m-4-4 4 4-4 4M4 17h2a5 5 0 0 0 4-2m5-6a5 5 0 0 1 1-2h3m-4-4 4 4-4 4',
} as const
type IconName = keyof typeof iconPaths
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>
}

function App() {
  const [page, setPage] = useState('Accueil')
  const [subject, setSubject] = useState<Subject | 'Mixte'>('Mathématiques')
  const [mode, setMode] = useState('Quiz classique')
  const [difficulty, setDifficulty] = useState('Toutes')
  const [count, setCount] = useState(20)
  const [seconds, setSeconds] = useState(60)
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [feedback, setFeedback] = useState(false)
  const [game, setGame] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [favorites, setFavorites] = useState<string[]>(initialFavorites)
  const [results, setResults] = useState<Result[]>(getResults)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [slide, setSlide] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileName, setProfileName] = useState(() => {
    try { return localStorage.getItem('ep-profile-name') ?? 'Élève' } catch { return 'Élève' }
  })
  const profileInitial = profileName.trim().charAt(0).toLocaleUpperCase('fr-FR') || 'E'
  const [plan, setPlan] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('ep-plan') ?? '[]') as string[] } catch { return [] } })
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>(() => { try { return JSON.parse(localStorage.getItem('ep-agenda-events') ?? '[]') as AgendaEvent[] } catch { return [] } })
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()))
  const [calendarMonth, setCalendarMonth] = useState(() => { const today = new Date(); return new Date(today.getFullYear(), today.getMonth(), 1) })
  const [newActivity, setNewActivity] = useState('')
  const [newActivityTime, setNewActivityTime] = useState('17:00')
  const [newActivitySubject, setNewActivitySubject] = useState<Subject | 'Autre'>('Mathématiques')
  const current = questions[index]
  const best = Math.max(0, ...results.map(r => r.score))
  const totalQuestions = bank.length
  const availableQuestions = subject === 'Mixte' ? totalQuestions : 1000
  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const calendarOffset = (firstOfMonth.getDay() + 6) % 7
  const calendarCells = Array.from({ length: 42 }, (_, i) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i - calendarOffset + 1))
  const selectedDayEvents = agendaEvents.filter(event => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
  const selectedDay = new Date(`${selectedDate}T12:00:00`)
  const upcomingEvents = agendaEvents.filter(event => event.date >= localDateKey(new Date())).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 3)
  const nav = [['Accueil','home'],['Défis','challenges'],['Mon planning','calendar'],['Mes favoris','favorites'],['Mes résultats','results'],['Paramètres','settings']] as const
  useEffect(() => { localStorage.setItem('ep-favorites', JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { localStorage.setItem('ep-plan', JSON.stringify(plan)) }, [plan])
  useEffect(() => { localStorage.setItem('ep-agenda-events', JSON.stringify(agendaEvents)) }, [agendaEvents])
  useEffect(() => { localStorage.setItem('ep-results', JSON.stringify(results)) }, [results])
  useEffect(() => { localStorage.setItem('ep-profile-name', profileName) }, [profileName])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2400); return () => clearTimeout(t) } }, [toast])
  useEffect(() => { if (page !== 'Accueil') return; const t = setInterval(() => setSlide(s => (s + 1) % carouselSlides.length), 6500); return () => clearInterval(t) }, [page])
  useEffect(() => {
    if (!game) return
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
      if (mode !== 'Sprint chrono' && mode !== 'Questions éclair') return
      if (remaining > 1) { setRemaining(v => v - 1); return }
      setRemaining(0)
      if (mode === 'Sprint chrono') { finishGame(); return }
      if (!feedback) {
        setSelected('')
        setFeedback(true)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [game, remaining, startedAt, mode, score, correctCount, index, feedback, questions.length])
  function startGame(config?: Partial<Challenge>) {
    const chosenMode = config?.mode ?? mode; const chosenSubject = config?.subject ?? subject
    if (chosenMode === 'Défi surprise') { const randomSubject = shuffle(subjects)[0].name; setSubject(randomSubject); setMode('Questions éclair'); setToast(`Tirage… ${randomSubject} !`); setTimeout(() => launchQuestions(randomSubject, 'Questions éclair', config?.count ?? count, config?.seconds ?? seconds), 900); return }
    setMode(chosenMode); setSubject(chosenSubject); launchQuestions(chosenSubject, chosenMode, config?.count ?? count, config?.seconds ?? seconds)
  }
  function launchQuestions(chosenSubject: Subject | 'Mixte', chosenMode: string, howMany: number, clock: number) {
    let source = bank.filter(q => chosenSubject === 'Mixte' || q.subject === chosenSubject)
    if (difficulty !== 'Toutes') source = source.filter(q => q.difficulty === difficulty)
    let selection = shuffle(source).slice(0, Math.min(howMany, source.length))
    if (chosenMode === 'Vrai ou faux') selection = selection.map(q => { const proposed = shuffle([q.correct, q.answers.find(a => a !== q.correct)!])[0]; return { ...q, type: 'truefalse' as const, prompt: `Vrai ou faux : « ${q.prompt} » — la réponse proposée est « ${proposed} » ?`, answers: ['Vrai', 'Faux'], correct: proposed === q.correct ? 'Vrai' : 'Faux' } })
    setQuestions(selection); setIndex(0); setSelected(''); setFeedback(false); setScore(0); setCorrectCount(0); setRemaining(chosenMode === 'Sprint chrono' ? clock : (chosenMode === 'Questions éclair' ? 15 : clock)); setStartedAt(Date.now()); setElapsed(0); setGame(true); setPage('Jeu')
  }
  function choose(answer: string) { if (feedback || !current) return; setSelected(answer); setFeedback(true); if (answer === current.correct) { setCorrectCount(c => c + 1); setScore(s => s + (current.difficulty === 'Difficile' ? 150 : current.difficulty === 'Intermédiaire' ? 120 : 100) + (mode === 'Sprint chrono' ? Math.max(0, remaining) : 0)) } }
  function nextQuestion() { if (index + 1 >= questions.length || (mode === 'Sprint chrono' && remaining <= 0)) { finishGame(); return } setIndex(i => i + 1); setSelected(''); setFeedback(false); if (mode === 'Questions éclair') setRemaining(15) }
  function finishGame() {
    if (!game) return
    setGame(false)
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000))
    const answered = Math.min(questions.length, index + (feedback ? 1 : 0))
    const result = { score, correct: correctCount, total: answered, elapsed: elapsedSeconds, subject, date: new Date().toISOString() }
    setElapsed(elapsedSeconds)
    setResults(old => [result, ...old].slice(0, 50))
    setPage('Résultat')
  }
  function toggleFavorite(id: string) { setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]); setToast(favorites.includes(id) ? 'Retiré des favoris' : 'Ajouté aux favoris') }
  const activeQuestion = current

  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('Accueil') }}><span className="brand-mark">e</span><span>EduPouse<small>LE PLAISIR D’APPRENDRE</small></span></a><small>ÉCOLES INTERNATIONALES MAARIF · TOGO</small><div className="side-label">MENU PRINCIPAL</div><nav>{nav.map(([label, icon]) => <button type="button" key={label} className={`nav-item ${page === label || (label === 'Défis' && (page === 'Jeu' || page === 'Résultat')) ? 'active' : ''}`} onClick={() => { setGame(false); setNotificationsOpen(false); setPage(label) }}><span className="nav-icon"><Icon name={icon} size={17} /></span>{label}{page === label && <i />}</button>)}</nav><div className="sidebar-bottom"><div className="streak"><span>✦</span><div><b>Prêt à progresser ?</b><small>Un défi par jour, ça change tout.</small></div></div><button type="button" className="profile profile-button" onClick={() => setPage('Paramètres')}><div className="avatar">{profileInitial}</div><div><b>{profileName}</b><small>Seconde · Écoles Maarif Togo</small></div><span className="dots">•••</span></button></div></aside>
    <main className="main-area"><header className="topbar"><div className="crumb">Espace apprenant <span>/</span> <b>{page === 'Jeu' ? 'Défi en cours' : page}</b></div><div className="top-actions"><span className="level-pill">✦ Seconde</span><div className="notification-wrap"><button type="button" className="icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(open => !open)}><Icon name="bell" size={17} /><i /></button>{notificationsOpen && <div className="notification-panel"><span className="eyebrow">ACTUALITÉS</span><b>Bienvenue sur EduPouse</b><p>Ton prochain défi est prêt à être lancé.</p><button type="button" onClick={() => { setNotificationsOpen(false); setPage('Défis') }}>Voir les défis →</button></div>}</div><button type="button" className="avatar small profile-avatar" aria-label="Ouvrir les paramètres" onClick={() => setPage('Paramètres')}>{profileInitial}</button></div></header>
    {page === 'Accueil' && <div className="page-content home-page">
      <section key={slide} className={`carousel hero-slide hero-slide-${slide}`} onTouchStart={event => { setTouchStartX(event.touches[0]?.clientX ?? null) }} onTouchEnd={event => { if (touchStartX !== null) { const delta = event.changedTouches[0]?.clientX - touchStartX; if (delta > 45) setSlide(currentSlide => (currentSlide + carouselSlides.length - 1) % carouselSlides.length); if (delta < -45) setSlide(currentSlide => (currentSlide + 1) % carouselSlides.length) } setTouchStartX(null) }} style={{ backgroundImage: `linear-gradient(90deg,rgba(10,36,30,.84),rgba(12,43,34,.58) 48%,rgba(10,29,27,.28)),url('${carouselSlides[slide].image}')` }}><span className="hero-orbit orbit-one">∑</span><span className="hero-orbit orbit-two">π</span><span className="hero-orbit orbit-three">✦</span><div className="hero-layout"><div className="carousel-content"><span className="eyebrow light">{carouselSlides[slide].kicker}</span><div className="hero-welcome">TON AVENIR <span>COMMENCE ICI</span></div><h1>{carouselSlides[slide].title}</h1><p>{carouselSlides[slide].sub}</p><div className="hero-actions"><button className="button white" onClick={() => { const currentSlide = carouselSlides[slide]; if (currentSlide.action === 'planning') setPage('Mon planning'); else if (currentSlide.action === 'science') startGame({ subject: 'Physique-chimie', mode: 'Quiz classique', count, seconds }); else if (currentSlide.action === 'math') startGame({ subject: 'Mathématiques', mode: 'Quiz classique', count, seconds }); else setPage('Défis') }}>{carouselSlides[slide].action === 'science' ? 'Défi sciences' : carouselSlides[slide].action === 'math' ? 'Défi mathématiques' : carouselSlides[slide].action === 'planning' ? 'Voir mon agenda' : 'Explorer les défis'} <b>→</b></button><span className="hero-caption">ÉDUPOUSE · SECONDE</span></div></div></div><div className="hero-slide-footer"><div className="carousel-controls"><button aria-label="Diapositive précédente" onClick={() => setSlide((slide + carouselSlides.length - 1) % carouselSlides.length)}><Icon name="back" size={14} /></button>{carouselSlides.map((item, i) => <button key={item.kicker} className={`dot ${slide === i ? 'selected' : ''}`} onClick={() => setSlide(i)} aria-label={`Diapositive ${i + 1} : ${item.kicker}`} />)}<button aria-label="Diapositive suivante" onClick={() => setSlide((slide + 1) % carouselSlides.length)}><Icon name="next" size={14} /></button></div><span className="photo-credit"><a target="_blank" rel="noreferrer" href={carouselSlides[slide].credit}>Crédit photo · {slide < 3 ? 'Maarif Togo' : slide === 3 ? 'Wikimedia Commons' : 'Wikimedia Commons'}</a></span></div><div className="hero-slide-number">0{slide + 1}<span> / 0{carouselSlides.length}</span></div></section>
      <section className="welcome-row"><div><div className="eyebrow">MARDI 17 NOVEMBRE 2026</div><h2>Bonjour, {profileName} <span className="wave">✦</span></h2><p>Tu as tout ce qu’il faut pour faire une belle journée.</p></div><button type="button" className="button primary" onClick={() => setPage('Défis')}>Choisir un défi <b>→</b></button></section>
      <section className="stat-grid"><div className="stat-card"><span className="stat-icon violet">✦</span><div><small>Points gagnés</small><b>{results.reduce((s, r) => s + r.score, 0).toLocaleString('fr-FR')}</b><em>+ continue comme ça</em></div><span className="sparkline">⌁</span></div><div className="stat-card"><span className="stat-icon orange">⚡</span><div><small>Défis terminés</small><b>{results.length}</b><em>chaque effort compte</em></div></div><div className="stat-card"><span className="stat-icon green">◷</span><div><small>Temps d’apprentissage</small><b>{Math.floor(results.reduce((s, r) => s + r.elapsed, 0) / 60)} min</b><em>temps réellement passé</em></div></div><div className="stat-card"><span className="stat-icon pink">♧</span><div><small>Meilleur score</small><b>{best}</b><em>à battre !</em></div></div></section>
      <div className="section-heading"><div><span className="eyebrow">POUR TOI</span><h2>Défis recommandés</h2></div><button className="text-link" onClick={() => setPage('Défis')}>Tous les défis <b>→</b></button></div><section className="recommend-grid">{[subjects[0], subjects[1], subjects[2]].map((s, i) => <article className={`recommend-card ${s.tone}`} key={s.name}><button className={`heart ${favorites.includes(s.name) ? 'hearted' : ''}`} onClick={() => toggleFavorite(s.name)} aria-label="Ajouter aux favoris"><Icon name="favorites" size={17} /></button><div className="recommend-icon">{s.icon}</div><span className="tag">{['POPULAIRE', 'À DÉCOUVRIR', 'RECOMMANDÉ'][i]}</span><h3>{['Calcul mental express', 'Les clés de la grammaire', 'Matière & transformations'][i]}</h3><p>{s.name} <span>·</span> Seconde</p><button className="card-cta" onClick={() => startGame({ subject: s.name, mode: 'Questions éclair', count, seconds: 15 })}>Jouer <b>→</b></button></article>)}</section>
      <section className="home-bottom"><div className="panel"><div className="section-heading compact"><div><span className="eyebrow">TON PROGRAMME</span><h2>À venir</h2></div><button className="text-link" onClick={() => setPage('Mon planning')}>Mon planning →</button></div>{upcomingEvents.length ? upcomingEvents.map(event => <div className="upcoming" key={event.id}><span className="date-block">{new Date(`${event.date}T12:00:00`).toLocaleDateString('fr-FR', { day: '2-digit' })}<small>{new Date(`${event.date}T12:00:00`).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase()}</small></span><div><b>{event.title}</b><small>{event.subject} · {event.time}</small></div><span className="tiny-dot" /></div>) : plan.length ? plan.slice(0, 3).map((item, i) => <div className="upcoming" key={`${item}-${i}`}><span className="date-block">--<small>À FIXER</small></span><div><b>{item}</b><small>Rappel à planifier</small></div><span className="tiny-dot" /></div>) : <div className="empty-inline">Aucune activité prévue. Ajoute un défi à ton planning.</div>}</div><div className="daily-goal"><div className="goal-top"><span>✦</span><small>OBJECTIF DU JOUR</small></div><h3>10 minutes pour<br/>toi, aujourd’hui.</h3><div className="goal-progress"><div style={{ width: `${Math.min(100, Math.floor(results.reduce((s, r) => s + r.elapsed, 0) / 600 * 100))}%` }} /></div><small>{Math.min(10, Math.floor(results.reduce((s, r) => s + r.elapsed, 0) / 60))} / 10 min d’apprentissage</small><button onClick={() => setPage('Défis')}>Je relève le défi <b>→</b></button></div></section><div className="quote">“La réussite est la somme de petits efforts, répétés jour après jour.” <span>— Robert Collier</span></div>
    </div>}
    {page === 'Défis' && <div className="page-content"><div className="page-title"><div><span className="eyebrow">APPRENDS EN T’AMUSANT</span><h1>À toi de jouer !</h1><p>Choisis ton terrain de jeu et fais progresser tes connaissances.</p></div><div className="challenge-actions"><button className="button primary" onClick={() => startGame({ mode: 'Questions éclair', subject, count, seconds: 15 })}>Jouer maintenant <b>→</b></button></div></div><div className="filter-row"><label>Matière<select value={subject} onChange={e => setSubject(e.target.value as Subject | 'Mixte')}><option>Mixte</option>{subjects.map(s => <option key={s.name}>{s.name}</option>)}</select></label><label>Niveau<select defaultValue="Seconde"><option>Seconde</option></select></label><label>Difficulté<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>Toutes</option><option>Facile</option><option>Intermédiaire</option><option>Difficile</option></select></label></div><div className="mode-grid">{modes.map(([name, icon, desc], i) => <article className={`mode-card mode-${i}`} key={name}><div className="mode-top"><span className="mode-icon"><Icon name={icon} size={19} /></span><button className={`heart ${favorites.includes(name) ? 'hearted' : ''}`} onClick={() => toggleFavorite(name)}><Icon name="favorites" size={17} /></button></div><h3>{name}</h3><p>{desc}</p><div className="mode-meta"><span>{i === 2 ? '20 questions · chrono' : i === 0 ? '20 questions · 15 sec' : '20 questions'}</span><button className="round-arrow" aria-label={`Lancer ${name}`} onClick={() => startGame({ mode: name, subject: name === 'Défi mixte' ? 'Mixte' : subject, count, seconds })}><Icon name="next" size={15} /></button></div></article>)}</div><div className="setup-panel"><div><span className="eyebrow">PERSONNALISE TON DÉFI</span><h3>Un défi sur mesure</h3><p>20 questions choisies parmi la banque disponible.</p></div><div className="fixed-count"><small>QUESTIONS PAR PARTIE</small><b>{count} questions</b></div><label>Nombre de questions<select value={count} onChange={e => setCount(Number(e.target.value))}><option value={5}>5 questions</option><option value={10}>10 questions</option><option value={15}>15 questions</option><option value={20}>20 questions</option><option value={25}>25 questions</option><option value={30}>30 questions</option><option value={40}>40 questions</option><option value={50}>50 questions</option></select></label><label>Durée<select value={seconds} onChange={e => setSeconds(Number(e.target.value))}><option value={30}>30 secondes</option><option value={60}>60 secondes</option><option value={90}>90 secondes</option><option value={120}>120 secondes</option></select></label><button className="button primary" onClick={() => startGame()}>Lancer un quiz <b>→</b></button></div><p className="bank-note">Chaque partie pioche 20 questions sans doublon parmi les {availableQuestions.toLocaleString('fr-FR')} questions disponibles{subject === 'Mixte' ? '' : ` en ${subject}`} · Programme français de Seconde.</p></div>}
    {page === 'Jeu' && activeQuestion && <div className="game-wrap"><div className="game-top"><button className="back-link" aria-label="Quitter le défi et revenir aux défis" onClick={() => { setGame(false); setPage('Défis') }}><span className="back-icon"><Icon name="back" size={17} /></span><span>Quitter le défi</span></button><div className="game-subject">{activeQuestion.subject} <span>·</span> Seconde</div><div className="game-clock"><Icon name="clock" size={16} /> {mode === 'Sprint chrono' || mode === 'Questions éclair' ? remaining : elapsed}<small>{mode === 'Sprint chrono' || mode === 'Questions éclair' ? 's' : 's écoulées'}</small></div></div><div className="game-progress"><div style={{ width: `${mode === 'Sprint chrono' ? (1 - remaining / seconds) * 100 : (index / questions.length) * 100}%` }} /></div><div className="game-count">QUESTION {index + 1} <span>/ {questions.length}</span><span className="game-time">Temps écoulé : {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span></div><div className="question-card"><div className="question-type">{mode.toUpperCase()} <span>·</span> {activeQuestion.difficulty.toUpperCase()}</div><h2>{activeQuestion.prompt}</h2><div className="answer-grid">{activeQuestion.answers.map((answer, i) => <button key={answer} className={`answer-option ${feedback && answer === activeQuestion.correct ? 'right' : ''} ${feedback && answer === selected && answer !== activeQuestion.correct ? 'wrong' : ''} ${selected === answer && !feedback ? 'chosen' : ''}`} onClick={() => choose(answer)}><span>{String.fromCharCode(65 + i)}</span>{answer}{feedback && answer === activeQuestion.correct && <b>✓</b>}</button>)}</div>{feedback && <div className={`explanation ${selected === activeQuestion.correct ? 'good' : 'bad'}`}><b>{selected === activeQuestion.correct ? 'Bien joué !' : 'On apprend aussi en se trompant.'}</b><span>{activeQuestion.explanation}</span></div>}<div className="game-footer"><span>✦ {score} points</span>{feedback ? <button className="button primary" onClick={nextQuestion}>{index + 1 >= questions.length ? 'Voir mes résultats' : 'Continuer'} <b>→</b></button> : <button className="button muted" disabled>Choisis une réponse</button>}</div></div><div className="game-tip">Prends ton temps pour comprendre : chaque réponse est une occasion d’apprendre.</div></div>}
    {page === 'Résultat' && <div className="page-content results-page"><div className="result-hero"><span className="result-star">✦</span><span className="eyebrow light">DÉFI TERMINÉ</span><h1>Bravo, {profileName} !</h1><p>Chaque défi te fait avancer. Voici comment tu t’en es sorti.</p><div className="result-score">{score}<small>POINTS</small></div></div><div className="result-grid"><div><small>Bonnes réponses</small><b>{correctCount} / {Math.max(1, index + (feedback ? 1 : 0))}</b></div><div><small>Temps utilisé</small><b>{Math.floor(elapsed / 60)} min {elapsed % 60} s</b></div><div><small>Discipline</small><b>{subject}</b></div><div><small>Meilleur score</small><b>{Math.max(best, score)} pts</b></div></div><div className="result-actions"><button className="button primary" onClick={() => startGame()}>Rejouer <b>↻</b></button><button className="button outline" onClick={() => setPage('Défis')}>Choisir un autre défi</button></div></div>}
    {page === 'Mon planning' && <div className="page-content agenda-page"><div className="page-title agenda-title"><div><span className="eyebrow">TON ORGANISATION, À TON RYTHME</span><h1>Mon agenda</h1><p>Planifie tes révisions et garde une vue claire sur ta semaine.</p></div><button className="button primary" onClick={() => document.getElementById('agenda-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>＋ Ajouter une activité</button></div><div className="agenda-layout"><section className="agenda-calendar"><div className="agenda-month-head"><div><span className="eyebrow">CALENDRIER</span><h2>{calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2></div><div className="month-controls"><button aria-label="Mois précédent" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>‹</button><button aria-label="Mois suivant" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button></div></div><div className="calendar-weekdays">{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{calendarCells.map(day => { const key = localDateKey(day); const hasEvents = agendaEvents.some(event => event.date === key); const isToday = key === localDateKey(new Date()); return <button key={key} className={`calendar-day ${day.getMonth() !== calendarMonth.getMonth() ? 'outside' : ''} ${key === selectedDate ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => { setSelectedDate(key); if (day.getMonth() !== calendarMonth.getMonth()) setCalendarMonth(new Date(day.getFullYear(), day.getMonth(), 1)) }}><span>{day.getDate()}</span>{hasEvents && <i />}</button>})}</div><div className="calendar-legend"><span><i className="today-dot" />Aujourd’hui</span><span><i className="event-dot" />Activité prévue</span></div></section><section className="agenda-day"><div className="agenda-day-head"><div><span className="eyebrow">TON PROGRAMME</span><h2>{selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2></div><span className="agenda-count">{selectedDayEvents.length} activité{selectedDayEvents.length > 1 ? 's' : ''}</span></div>{selectedDayEvents.length ? <div className="agenda-timeline">{selectedDayEvents.map((event, i) => <article className="agenda-event" key={event.id}><time>{event.time}</time><span className={`event-line event-color-${i % 4}`} /><div className="agenda-event-card"><span className="event-subject">{event.subject}</span><h3>{event.title}</h3><p>Révision personnelle · 30 min</p></div><button className="delete-event" aria-label={`Supprimer ${event.title}`} onClick={() => setAgendaEvents(events => events.filter(item => item.id !== event.id))}>×</button></article>)}</div> : <div className="agenda-empty"><span>✦</span><b>Une journée encore libre</b><p>Ajoute une séance de révision pour la remplir.</p><button onClick={() => document.getElementById('agenda-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>＋ Planifier une activité</button></div>}{plan.length > 0 && <div className="legacy-reminders"><span className="eyebrow">RAPPELS À PLANIFIER</span>{plan.slice(0, 3).map((item, i) => <div key={`${item}-${i}`}><span>{item}</span><button onClick={() => { setAgendaEvents(events => [...events, { id: `${Date.now()}-${i}`, title: item, date: selectedDate, time: '17:00', subject: 'Autre' }]); setPlan(old => old.filter((_, index) => index !== i)); setToast('Activité ajoutée à cet agenda') }}>Planifier</button></div>)}</div>}</section></div><form id="agenda-form" className="agenda-form" onSubmit={event => { event.preventDefault(); if (!newActivity.trim()) return; setAgendaEvents(events => [...events, { id: `${Date.now()}`, title: newActivity.trim(), date: selectedDate, time: newActivityTime, subject: newActivitySubject }]); setNewActivity(''); setToast('Activité ajoutée à ton agenda') }}><div className="agenda-form-heading"><span className="agenda-form-icon">＋</span><div><span className="eyebrow">NOUVELLE SÉANCE</span><h2>Préparer ma prochaine révision</h2></div></div><div className="agenda-fields"><label>Activité<input value={newActivity} onChange={event => setNewActivity(event.target.value)} placeholder="Ex. Réviser les fonctions" required /></label><label>Date<input type="date" value={selectedDate} onChange={event => { setSelectedDate(event.target.value); const date = new Date(`${event.target.value}T12:00:00`); setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1)) }} required /></label><label>Heure<input type="time" value={newActivityTime} onChange={event => setNewActivityTime(event.target.value)} required /></label><label>Matière<select value={newActivitySubject} onChange={event => setNewActivitySubject(event.target.value as Subject | 'Autre')}><option>Autre</option>{subjects.map(item => <option key={item.name}>{item.name}</option>)}</select></label><button className="button primary" type="submit">Enregistrer dans l’agenda <b>→</b></button></div></form><div className="panel save-favorite"><span className="stat-icon pink">♡</span><div><b>Transforme un favori en révision</b><p>Retrouve tes défis enregistrés dans « Mes favoris » et ajoute-les à ton planning.</p></div><button className="text-link" onClick={() => setPage('Mes favoris')}>Voir mes favoris →</button></div></div>}
    {page === 'Mes favoris' && <div className="page-content"><div className="page-title"><div><span className="eyebrow">GARDÉS POUR PLUS TARD</span><h1>Mes favoris <span className="favorite-count">{favorites.length}</span></h1><p>Tes défis préférés, prêts à être relancés.</p></div></div><div className="favorite-tabs"><button className="selected">♡ Mes défis favoris <span>{favorites.length}</span></button><button onClick={() => setToast('Ajoute une question favorite depuis une partie.')}>☆ Mes questions favorites <span>0</span></button></div>{favorites.length ? <div className="favorite-grid">{favorites.map(f => { const s = subjects.find(x => x.name === f); const m = modes.find(x => x[0] === f); return <article className="favorite-card" key={f}><div className="mode-top"><span className={`recommend-icon ${s?.tone ?? 'violet'}`}>{m ? <Icon name={m[1]} size={16} /> : s?.icon ?? '✦'}</span><button className="heart hearted" aria-label="Retirer des favoris" onClick={() => toggleFavorite(f)}><Icon name="favorites" size={17} /></button></div><h3>{m ? f : `${f} · Seconde`}</h3><p>{m ? 'Défi à relancer' : (s?.topic ?? 'Défi enregistré')}</p><div className="favorite-actions"><button className="button primary" onClick={() => startGame({ subject: s?.name ?? subject, mode: m?.[0] ?? 'Quiz classique', count, seconds })}>Relancer →</button><button className="icon-button" title="Ajouter au planning" onClick={() => { setPlan(p => [...p, `Réviser ${f} avec mon défi favori`]); setToast('Ajouté à ton planning') }}>▦</button></div></article> })}</div> : <div className="empty-state large"><span>♡</span><h2>Un peu de place pour tes coups de cœur</h2><p>Enregistre les défis que tu aimes avec le cœur. Tu pourras les retrouver et les relancer ici.</p><button className="button primary" onClick={() => setPage('Défis')}>Découvrir les défis <b>→</b></button></div>}</div>}
    {page === 'Mes résultats' && <div className="page-content"><div className="page-title"><div><span className="eyebrow">TES PROGRÈS, EN UN COUP D’ŒIL</span><h1>Mes résultats</h1><p>Chaque partie compte. Regarde le chemin déjà parcouru.</p></div></div><div className="result-summary"><div><small>Points cumulés</small><b>{results.reduce((s,r)=>s+r.score,0).toLocaleString('fr-FR')}</b><span>✦ points</span></div><div><small>Défis terminés</small><b>{results.length}</b><span>parties jouées</span></div><div><small>Temps d’apprentissage</small><b>{Math.floor(results.reduce((s,r)=>s+r.elapsed,0)/60)} min</b><span>au total</span></div></div><div className="panel history"><div className="section-heading compact"><div><span className="eyebrow">TON HISTORIQUE</span><h2>Dernières parties</h2></div></div>{results.length ? results.map((r,i)=><div className="history-row" key={`${r.date}-${i}`}><div className="history-icon">✦</div><div className="history-main"><b>{r.subject} · Seconde</b><small>{new Date(r.date).toLocaleDateString('fr-FR')} · {r.correct}/{r.total} bonnes réponses · {Math.floor(r.elapsed/60)} min {r.elapsed%60} s</small></div><strong>{r.score} pts</strong></div>) : <div className="empty-state"><span>◫</span><h3>Ton aventure commence ici</h3><p>Termine un défi pour voir apparaître tes résultats.</p><button className="button primary" onClick={() => setPage('Défis')}>Lancer mon premier défi →</button></div>}</div></div>}
    {page === 'Paramètres' && <div className="page-content"><div className="page-title"><div><span className="eyebrow">À TON IMAGE</span><h1>Paramètres</h1><p>Personnalise ton espace d’apprentissage.</p></div></div><div className="settings-list"><div><div className="settings-icon">◉</div><div><b>Profil apprenant</b><p>Nom affiché et niveau scolaire</p></div><button onClick={() => { const name=window.prompt('Quel nom veux-tu afficher ?', profileName); if(name?.trim()) { setProfileName(name.trim()); setToast(`Profil mis à jour : ${name.trim()}`) } }}>Modifier →</button></div><div><div className="settings-icon">♧</div><div><b>Préférences de jeu</b><p>Niveau par défaut : Seconde · Programme français</p></div><span className="level-pill">Seconde</span></div><div><div className="settings-icon">▤</div><div><b>Données locales</b><p>Favoris, planning et résultats sauvegardés sur cet appareil</p></div><button onClick={() => setToast('Tes données sont sauvegardées sur cet appareil.')}>Vérifier →</button></div><div className="settings-tip"><span>✦</span><p><b>EduPouse évolue avec toi.</b><br/>Tes données restent dans ton navigateur et ne sont envoyées à aucun serveur.</p></div></div></div>}
    </main><nav className="mobile-nav">{nav.map(([label,icon])=><button key={label} className={page === label ? 'active' : ''} onClick={() => { setGame(false); setPage(label) }}><span><Icon name={icon} size={18} /></span><small>{label === 'Mon planning' ? 'Planning' : label === 'Mes favoris' ? 'Favoris' : label === 'Mes résultats' ? 'Résultats' : label}</small></button>)}</nav>{toast && <div className="toast"><span className="toast-check"><Icon name="check" size={16} /></span>{toast}</div>}
  </div>
}
export default App
