/* ===========================================================
   projects.js | declarative project registry

   Single source of truth for the work section. Each entry drives
   its own card size, hover animation, fallback artwork and case
   study, so no project-specific logic lives in the UI code.

   To use a real screenshot: set `image` to a path or URL. The
   loader swaps it in and keeps the generated artwork as fallback
   if it fails. Leave it null to use the artwork alone.
   =========================================================== */

const PROJECTS = [
  {
    id: 'mrn',
    idx: '01',
    title: 'MR & N',
    tagline: 'Math, Research & NumPy',
    cat: 'deep-learning',
    catLabel: 'Deep Learning',
    size: 'featured',
    badge: 'Flagship',
    lang: 'Python',
    langColor: '#3572A5',
    anim: 'neural',
    art: 'network',
    image: null,
    alt: 'Layered neural network diagram representing the MR & N framework',
    short: 'A deep learning framework built with nothing but base Python and NumPy. No autograd, no PyTorch, every gradient derived and implemented by hand.',
    body: [
      'A deep learning framework built with nothing but base Python and NumPy. No autograd, no PyTorch, every gradient derived and implemented by hand. It covers fully connected layers, convolutional networks, dropout, momentum-based gradient descent, learning-rate scheduling, and a spread of activation and cost functions.',
      'The repo carries its own history: a legacy array-based engine written when I was learning from Nielsen\'s book, and a rewritten doubly-linked-list, heavily class-based core that is modular, faster, and the one that gets to grow up. Built around modularity, simplicity and efficiency, with the lofty hope of one day making the industry standards nervous.'
    ],
    detail: 'Every gradient hand-derived. Zero autograd.',
    tech: ['NumPy', 'CNNs', 'Backpropagation', 'Optimisers', 'From scratch'],
    github: 'https://github.com/DevZro/MR---N',
    demo: null,
    cta: 'Inspect system',
    study: {
      overview: 'A deep learning framework where every component, from the gradient of a convolution to the learning-rate schedule, is written by hand in NumPy.',
      problem: 'Modern frameworks make it possible to train a network without understanding one line of what happens during the backward pass. Autograd is a black box by design. I wanted the opposite: a framework where nothing is hidden because I had to derive all of it.',
      approach: 'Start from the math. Derive each layer\'s gradient on paper, implement the forward and backward pass in NumPy, verify numerically, then build the next layer on top. No component gets added until its gradient is understood.',
      architecture: [
        ['Layers', 'Fully connected and convolutional, each owning its own forward and backward pass'],
        ['Regularisation', 'Dropout, implemented as a mask applied consistently across both passes'],
        ['Optimisation', 'Momentum-based gradient descent with learning-rate scheduling'],
        ['Functions', 'A spread of interchangeable activation and cost functions'],
        ['Core', 'Linked-list, class-based module graph replacing the earlier array-based engine']
      ],
      implementation: [
        'The repo deliberately keeps both engines. The legacy array-based version is the one written while learning from Nielsen\'s book, and it stays as a record of the starting point.',
        'The rewrite moves to a doubly linked list with a heavily class-based core. Modules hold their own state and neighbours, which makes the graph easier to extend. The repo describes the result as more modular, upgradeable, efficient and stable than the array version.',
        'Design priorities, in order: modularity, simplicity, efficiency. A new layer type should be addable without touching the training loop.'
      ],
      results: 'A working framework that trains networks end to end using only NumPy, with convolutional support and a modular core built to keep growing.',
      lessons: 'Deriving backpropagation by hand changes how you read framework source code afterwards. The rewrite also taught me that the data structure holding your compute graph is an architectural decision, not an implementation detail.'
    }
  },
  {
    id: 'chess',
    idx: '02',
    title: 'Chess Programming',
    tagline: 'Bitboard engine + Unity front end',
    cat: 'game-ai',
    catLabel: 'Game AI',
    size: 'featured',
    badge: 'In progress',
    badgeAlt: true,
    lang: 'C#',
    langColor: '#178600',
    anim: 'chess',
    art: 'board',
    image: null,
    alt: 'Chess board grid with bitboard occupancy pattern',
    short: 'A chess engine written from scratch in C#, with a Unity front end. Board state lives in bitboards and legal moves come straight from pin and check analysis.',
    body: [
      'A chess engine written from scratch in C#, with a Unity front end for playing and watching games. Board state is held in bitboards, and fully legal moves are generated directly through pin and check analysis rather than filtering pseudo-legal moves with make/unmake tests.',
      'It ships BondFish, a set of search engines 1.0 through 1.4, built up incrementally so the gain from each technique can be measured against the version before it: minimax, alpha-beta pruning and quiescence search among other classics. Move generation is verified with a perft harness against known node counts, which turns any bug into a localisable one.'
    ],
    detail: 'Legal moves generated directly, no make/unmake filtering.',
    tech: ['C#', 'Unity', 'Bitboards', 'Alpha-beta', 'Quiescence', 'Perft'],
    github: 'https://github.com/DevZro/Chess-Programming',
    demo: null,
    cta: 'Open case study',
    study: {
      overview: 'A from-scratch chess engine in C# with a Unity interface, built as a series of measurable versions rather than one monolithic push.',
      problem: 'Chess engines are easy to write slowly and badly. The two hard parts are generating legal moves correctly and searching deeply enough to play well. Most naive implementations generate pseudo-legal moves and then test each one by making it, checking for self-check, and unmaking it, which is both slow and easy to get subtly wrong.',
      approach: 'Represent the board as bitboards so move generation becomes bitwise arithmetic. Then generate fully legal moves directly by computing pins and checks up front, so illegal moves are never produced in the first place. Verify with perft before trusting any search result.',
      architecture: [
        ['Board', 'Bitboard representation, one 64-bit word per piece type and colour'],
        ['Movegen', 'Fully legal generation via pin and check analysis, no make/unmake filtering'],
        ['Search', 'BondFish 1.0 to 1.4, each version adding one technique'],
        ['Techniques', 'Minimax, alpha-beta pruning, quiescence search and other classics'],
        ['Testing', 'Perft harness compared against known node counts'],
        ['Front end', 'Unity project for playing and watching games']
      ],
      implementation: [
        'The BondFish versions are kept separate on purpose. Because 1.1 differs from 1.0 by exactly one technique, the gain from that technique is measurable instead of assumed.',
        'Perft is the foundation everything else rests on. Node counts either match the known values for a position or they do not, which converts a vague "the engine plays badly" symptom into a specific, localisable bug.',
        'Generating only legal moves means the search never wastes time on positions it has to discard, and the move list is trustworthy at every depth.'
      ],
      results: 'A working engine with a verified move generator and five incrementally built search versions. Active development continues.',
      lessons: 'Correctness infrastructure first. Perft made every later optimisation safe to attempt, because any regression showed up immediately as a wrong node count rather than as mysteriously worse play.'
    }
  },
  {
    id: 'lecturekit',
    idx: '03',
    title: 'LectureKit',
    tagline: 'Recording in, typeset PDF out',
    cat: 'applied-ml',
    catLabel: 'Applied ML',
    size: 'medium',
    badge: 'Runs offline',
    badgeAlt: true,
    lang: 'Python',
    langColor: '#3572A5',
    anim: 'audio',
    art: 'waveform',
    image: null,
    alt: 'Audio waveform resolving into lines of transcribed text',
    short: 'Turns a lecture recording into a formatted PDF: timecoded transcript, abstractive summary, and a glossary of the technical terms actually spoken.',
    body: [
      'Turns a lecture recording into a complete, formatted PDF: a timecoded transcript, an abstractive summary, and an appendix defining the prominent technical terms actually spoken in the lecture.',
      'Five cached stages: faster-whisper transcription with voice-activity detection, paragraph alignment, map-reduce summarisation with distilbart, fuzzy matching against a 4,808-term engineering glossary, then Jinja to LaTeX to PDF. The summariser is checked for its two real failure modes (verbatim regurgitation and degenerate repetition) and falls back to extractive selection rather than emitting nonsense. No API keys, no cloud, and it runs on a laptop CPU.'
    ],
    detail: 'Five cached stages. No API keys, no cloud, laptop CPU.',
    tech: ['Whisper', 'NLP', 'Summarisation', 'LaTeX', 'On-device'],
    github: 'https://github.com/DevZro/LectureKit',
    demo: null,
    cta: 'Open case study',
    study: {
      overview: 'An offline pipeline that converts a lecture recording into a typeset PDF containing a transcript, a summary, and definitions of the technical terms spoken.',
      problem: 'Recordings are hard to study from. You cannot skim audio. Cloud transcription services solve part of this but require API keys, upload of potentially private lecture material, and a network connection, none of which suit a student on an unreliable connection.',
      approach: 'Build a fully local pipeline out of small models that fit on a laptop CPU, cache every stage so a failure halfway through does not restart the whole run, and treat summariser failure modes as expected rather than exceptional.',
      architecture: [
        ['Stage 1', 'faster-whisper transcription with voice-activity detection'],
        ['Stage 2', 'Paragraph alignment over the timecoded segments'],
        ['Stage 3', 'Map-reduce abstractive summarisation with distilbart'],
        ['Stage 4', 'Fuzzy matching against a 4,808-term engineering glossary'],
        ['Stage 5', 'Jinja templating to LaTeX to PDF'],
        ['Guardrail', 'Extractive fallback when the summariser degenerates']
      ],
      implementation: [
        'Each of the five stages caches its output. Re-running after a crash or a tweak resumes rather than restarting, which matters when transcription is the slow step.',
        'The summariser is explicitly checked for its two real failure modes: verbatim regurgitation of the input, and degenerate repetition. When either is detected the pipeline falls back to extractive selection instead of emitting nonsense into a PDF.',
        'Glossary matching is fuzzy, so a term transcribed imperfectly still resolves to the right definition. Only terms actually spoken in the lecture reach the appendix.'
      ],
      results: 'A complete recording-to-PDF pipeline that runs entirely on-device with no API keys and no cloud dependency.',
      lessons: 'Designing around a model\'s failure modes is more valuable than trying to prevent them. Knowing distilbart degenerates in two specific ways made a cheap, reliable guardrail possible.'
    }
  },
  {
    id: 'audionet',
    idx: '04',
    title: 'AudioNet ESC-50',
    tagline: 'Hearing with an image model',
    cat: 'deep-learning',
    catLabel: 'Deep learning',
    size: 'medium',
    metric: '~67% acc.',
    lang: 'Python',
    langColor: '#3572A5',
    anim: 'spectrogram',
    art: 'spectrogram',
    image: null,
    alt: 'Spectrogram showing audio frequency intensity over time',
    short: 'Sounds converted into spectrograms so a fine-tuned image recognition network can do the listening. 67% test accuracy across 50 classes.',
    body: [
      'My foray into audio classification. Sounds are converted into spectrograms, or frequency maps, which lets a fine-tuned image recognition network do the listening via transfer learning.',
      'Built on the EfficientNet family (B4) and evaluated on the 50-class ESC-50 dataset, reaching 67% test accuracy. Includes the full pipeline: spectrogram precomputation, dataset splitting, training, and conditional GPU utilities.'
    ],
    detail: 'Audio as images: transfer learning from vision to sound.',
    tech: ['EfficientNet', 'Transfer learning', 'Spectrograms', 'ESC-50'],
    github: 'https://github.com/DevZro/AudioNet-ESC50-Classifier',
    demo: null,
    cta: 'View model',
    study: {
      overview: 'An environmental sound classifier that reframes audio as a vision problem, converting clips to spectrograms and fine-tuning EfficientNet-B4 on them.',
      problem: 'ESC-50 has 50 classes and only 2,000 clips, which is far too little data to train an audio model from scratch. The dataset is small enough that any large model will overfit almost immediately.',
      approach: 'Convert each clip into a spectrogram, a two-dimensional map of frequency intensity over time, which is structurally an image. That makes the enormous body of pretrained vision models available through transfer learning, so the model starts from useful features instead of noise.',
      architecture: [
        ['Input', 'Precomputed spectrograms cached ahead of training'],
        ['Backbone', 'EfficientNet-B4, pretrained, fine-tuned on the spectrograms'],
        ['Data', 'ESC-50, 50 classes of environmental sound'],
        ['Pipeline', 'Spectrogram precomputation, dataset splitting, training loop'],
        ['Infra', 'Conditional GPU utilities so it runs with or without CUDA']
      ],
      implementation: [
        'Spectrograms are precomputed and cached rather than generated per epoch. Transforming audio is expensive and entirely deterministic, so doing it once is a straightforward win.',
        'B4 was the size that balanced capacity against the small dataset. The conditional GPU utilities let the same code run on a CUDA machine or fall back to CPU without edits.',
        'Reported accuracy is measured on a held-out test split, not on training or validation data.'
      ],
      results: 'Up to 67% test accuracy across all 50 ESC-50 classes using a fine-tuned EfficientNet-B4, as reported in the repository.',
      lessons: 'Reframing a problem into a domain with better pretrained models can be worth more than tuning within the original domain. Turning audio into spectrograms is what made the whole body of pretrained vision work available here.'
    }
  },
  {
    id: 'transformer',
    idx: '05',
    title: 'Transformer',
    tagline: '"Attention Is All You Need", by hand',
    cat: 'deep-learning',
    catLabel: 'Deep Learning',
    size: 'medium',
    lang: 'Python',
    langColor: '#3572A5',
    anim: 'attention',
    art: 'attention',
    image: null,
    alt: 'Attention matrix heatmap showing token-to-token weights',
    short: 'A decoder-only transformer built up from primitive PyTorch tensors: one attention head, then multi-head, then the full stack.',
    body: [
      'A decoder-only transformer implemented from the ground up using only PyTorch tensors and primitive layers: self-attention head, then multi-head attention, then sub-blocks, then the full decoder stack.',
      'Trained on tiny_shakespeare with a character-level tokenizer, and evaluated on how convincingly it can hallucinate Shakespearean literature.'
    ],
    detail: 'Built bottom-up: one head, then many, then the stack.',
    tech: ['PyTorch', 'Self-attention', 'Language modelling', 'Tokenization'],
    github: 'https://github.com/DevZro/Transformer',
    demo: null,
    cta: 'Inspect system',
    study: {
      overview: 'A decoder-only transformer implementing the architecture from "Attention Is All You Need" using only primitive PyTorch operations.',
      problem: 'Calling a prebuilt attention layer teaches you nothing about what attention does. The mechanism is a handful of matrix operations, but that is not visible from the outside of an API.',
      approach: 'Build strictly bottom-up. A single self-attention head first, verified in isolation. Then multi-head attention composed from it, then the sub-blocks with their residual connections, then the full decoder stack.',
      architecture: [
        ['Head', 'Single self-attention head from raw tensor operations'],
        ['Multi-head', 'Parallel heads composed and projected'],
        ['Sub-blocks', 'Attention and feed-forward with residual connections'],
        ['Stack', 'Full decoder-only transformer'],
        ['Tokenizer', 'Character-level, built for tiny_shakespeare']
      ],
      implementation: [
        'Each layer of abstraction was working before the next was started, so a bug was always in the newest component rather than anywhere in the stack.',
        'Character-level tokenization keeps the vocabulary tiny, which means the interesting behaviour comes from the attention mechanism rather than from a sophisticated tokenizer.',
        'Evaluation is qualitative by design: how convincingly the model hallucinates Shakespearean text.'
      ],
      results: 'A complete working decoder-only transformer that generates Shakespeare-flavoured text, trained on tiny_shakespeare.',
      lessons: 'Attention is a smaller idea than its reputation suggests. Building it from tensor operations makes the query-key-value structure obvious in a way that reading about it does not.'
    }
  },
  {
    id: 'hexapawn',
    idx: '06',
    title: 'Hexapawn',
    tagline: 'AlphaZero, in miniature',
    cat: 'game-ai',
    catLabel: 'Game AI',
    size: 'small',
    lang: 'Python',
    langColor: '#3572A5',
    anim: 'tree',
    art: 'tree',
    image: null,
    alt: 'Search tree branching from a small three-by-three game board',
    short: 'A network learns Hexapawn twice: supervised on a minimax oracle, then AlphaZero-style through MCTS self-play. It plays perfectly.',
    body: [
      'My preparation before taking on chess proper. A neural network learns Hexapawn, a stripped-down cousin of chess, two ways: supervised on an exhaustive minimax oracle, then AlphaZero-style through self-play guided by Monte Carlo Tree Search, with the network supplying both policy priors and position values.',
      'Positions are encoded from the perspective of the side to move, so the network is blind to colour and symmetry is enforced for free. The result plays Hexapawn perfectly.'
    ],
    detail: 'Side-to-move encoding makes colour symmetry free.',
    tech: ['Reinforcement Learning', 'MCTS', 'Minimax', 'Self-play'],
    github: 'https://github.com/DevZro/Hexapawn',
    demo: null,
    cta: 'Open case study',
    study: {
      overview: 'A miniature AlphaZero: a neural network that learns to play Hexapawn perfectly, trained both supervised and through self-play.',
      problem: 'AlphaZero-style self-play is hard to debug on a real game, because you cannot tell whether a weak agent is a bug or just undertrained. Hexapawn is small enough to solve exhaustively, which means ground truth exists.',
      approach: 'Solve the game with minimax first to get a perfect oracle. Train a network supervised against that oracle to confirm the architecture can represent the solution. Then discard the oracle and retrain the same architecture AlphaZero-style through MCTS-guided self-play, where perfect play is the target to verify against.',
      architecture: [
        ['Oracle', 'Exhaustive minimax solution of the full game'],
        ['Supervised', 'Network trained directly on oracle labels'],
        ['Self-play', 'AlphaZero-style loop guided by Monte Carlo Tree Search'],
        ['Network', 'Supplies both policy priors and position values'],
        ['Encoding', 'Positions from the perspective of the side to move']
      ],
      implementation: [
        'Encoding every position from the mover\'s perspective means the network never sees colour. Symmetry comes free instead of needing data augmentation or a doubled training set.',
        'The network serves the two roles AlphaZero needs from one model: policy priors to guide tree search, and value estimates to evaluate leaves.',
        'Because the game is solved, "does it play perfectly" is a real pass/fail test rather than a judgement call.'
      ],
      results: 'The trained agent plays Hexapawn perfectly, matching the minimax oracle.',
      lessons: 'Proving the pipeline on a game with known ground truth is worth the detour. Every component was verified against a correct answer before being pointed at chess, where no such answer exists.'
    }
  },
  {
    id: 'stockbot',
    idx: '07',
    title: 'StockBot',
    tagline: 'Direction prediction on SPY',
    cat: 'applied-ml',
    catLabel: 'Applied ML',
    size: 'small',
    badge: 'Deployed',
    badgeAlt: true,
    lang: 'Python',
    langColor: '#3572A5',
    anim: 'chart',
    art: 'chart',
    image: null,
    alt: 'Financial time series chart with a forward prediction marker',
    short: 'A random forest predicting next-day direction on SPY from rolling-window trend features, served through an API behind a web front end.',
    body: [
      'A stock prediction web app. A random forest classifier is trained on daily SPY data to predict whether tomorrow closes higher than today, framed as binary direction rather than a price target.',
      'Features are built from rolling windows at five horizons, 2, 5, 20, 60 and 250 days, each contributing a close-to-moving-average ratio and a running trend count. The model is scored on precision, since a signal you act on matters more than overall accuracy. Data comes from Alpha Vantage and the trained model is served through an API behind a web front end.'
    ],
    detail: 'Five rolling horizons, from 2 days to a full trading year.',
    tech: ['scikit-learn', 'Random Forest', 'Pandas', 'Alpha Vantage', 'API'],
    github: 'https://github.com/DevZro/StockBot',
    // The repo declares https://stock-oracle-api.vercel.app/ as its homepage,
    // but that host does not answer. Restore the URL here to show a Live link.
    demo: null,
    cta: 'Explore build',
    study: {
      overview: 'A deployed web app that predicts next-day direction on SPY using a random forest over multi-horizon trend features.',
      problem: 'Predicting a stock\'s exact price is a poor framing: it invites a regression model to look accurate while being useless. The decision a user actually faces is directional, so the target should be directional too.',
      approach: 'Reframe as binary classification: will tomorrow close above today. Build features that describe where price sits relative to its own recent history across several timescales, then score on precision rather than accuracy, because the cost of a false positive is what matters when a signal triggers an action.',
      architecture: [
        ['Data', 'Daily SPY series from Alpha Vantage'],
        ['Target', 'Binary: tomorrow\'s close above today\'s'],
        ['Features', 'Close-to-mean ratio and trend count at 2, 5, 20, 60 and 250 days'],
        ['Model', 'Random forest, 50 trees, minimum split size 50'],
        ['Metric', 'Precision on the positive class'],
        ['Serving', 'Trained model persisted and served through an API with a web front end']
      ],
      implementation: [
        'Each of the five horizons contributes two features: how far the close sits from that window\'s moving average, and how many up-days occurred within it. Together they describe short-term position and longer-term momentum.',
        'The trend features are computed on shifted data so no row can see its own outcome, which keeps the obvious lookahead leak out of the training set.',
        'A generous minimum split size relative to the tree count keeps individual trees from memorising noise in what is a low signal-to-noise problem.'
      ],
      results: 'PLACEHOLDER: add the measured precision from your own backtest here. The repo ships a live-tracking stats file, but its counters currently read zero, so no performance figure is claimed on this site.',
      lessons: 'Choosing the metric is part of choosing the problem. Precision over accuracy follows directly from the fact that acting on a false signal costs more than missing a true one.'
    }
  }
];
