
import { ExamCategory, SyllabusTopic, ExamTrack } from './types';

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'railway',
    name: 'Railway Exams',
    track: ExamTrack.GOVERNMENT,
    exams: [
      'RRB NTPC (Non-Technical)', 
      'RRB Group D', 
      'RRB JE (Junior Engineer)', 
      'RRB ALP (Assistant Loco Pilot)', 
      'RPF SI & Constable',
      'DFCCIL Executive',
      'Metro Rail (DMRC/LMRC)'
    ]
  },
  {
    id: 'bank_rbi',
    name: 'Banking & RBI',
    track: ExamTrack.GOVERNMENT,
    exams: [
      'RBI Grade B / Assistant',
      'IBPS PO / Clerk / SO', 
      'SBI PO / Clerk / SO', 
      'NABARD Grade A', 
      'LIC AAO / Assistant',
      'SEBI Grade A',
      'IDBI Executive'
    ]
  },
  {
    id: 'ssc_gov',
    name: 'SSC & Government',
    track: ExamTrack.GOVERNMENT,
    exams: [
      'SSC CGL (Combined Graduate Level)',
      'SSC CHSL (10+2)',
      'SSC MTS & Havaldar',
      'SSC CPO (Sub-Inspector)',
      'SSC GD Constable',
      'SSC Stenographer',
      'State PSC (General Studies)'
    ]
  },
  {
    id: 'coding_tech',
    name: 'Coding & Placement',
    track: ExamTrack.CODING,
    exams: [
      'FAANG Preparation',
      'Campus Placements (TCS/Infosys)',
      'Software Engineering Roles',
      'Full Stack Developer Prep',
      'Data Science Interviews',
      'Cloud & DevOps Exams',
      'System Design Interviews'
    ]
  },
  {
    id: 'defence_police',
    name: 'Defence & Police',
    track: ExamTrack.GOVERNMENT,
    exams: [
      'UPSC NDA / CDS',
      'Indian Army (Agniveer)',
      'Indian Navy / Air Force',
      'State Police SI',
      'State Police Constable',
      'CAPF (Assistant Commandant)',
      'CISF / BSF Recruitments'
    ]
  },
  {
    id: 'technical_gate',
    name: 'Technical & PSU',
    track: ExamTrack.GOVERNMENT,
    exams: [
      'GATE (Engineering Graduate)',
      'PSU Recruitment (BHEL/ONGC/NTPC)',
      'ISRO Scientist/Engineer',
      'BARC OCES/DGFS',
      'ESE (Engineering Services Exam)',
      'SSC JE (Civil/Elect/Mech)'
    ]
  },
  {
    id: 'entrance_jee_neet',
    name: 'Entrance (JEE/NEET)',
    track: ExamTrack.ACADEMIC,
    exams: [
      'JEE Main (Engineering)',
      'JEE Advanced (IITs)',
      'NEET UG (Medical)',
      'EAMCET (State Entrance)',
      'BITSAT',
      'VITEEE',
      'CUET (Central Universities)'
    ]
  },
  {
    id: 'academic_cbse',
    name: 'Academic Boards',
    track: ExamTrack.ACADEMIC,
    exams: [
      'CBSE Class 12 (Science)',
      'CBSE Class 12 (Commerce)',
      'CBSE Class 10 (Board)',
      'ICSE/ISC Boards',
      'State Board 10/12'
    ]
  }
];

export const SYLLABUS: SyllabusTopic[] = [
  {
    id: 'programming_langs',
    name: 'Programming Languages',
    subtopics: [
      'Python (Basics to Advanced)',
      'Java (JVM, Collections, Multithreading)',
      'C Programming (Pointers, Memory)',
      'C++ (STL, Advanced Features)',
      'JavaScript (ES6+, Async)',
      'TypeScript & Modern JS',
      'Rust & Go Fundamentals'
    ],
    examCategoryIds: ['coding_tech', 'technical_gate']
  },
  {
    id: 'core_cs',
    name: 'Core CS Concepts',
    subtopics: [
      'OOPs (Abstraction, Encapsulation, Polymorphism)',
      'Data Structures (Trees, Graphs, Hashing)',
      'Algorithms (Dynamic Programming, Greedy)',
      'Operating Systems (Processes, Deadlocks)',
      'Computer Networking (OSI, TCP/IP, DNS)',
      'Database Management (SQL, NoSQL, ACID)',
      'System Design Fundamentals'
    ],
    examCategoryIds: ['coding_tech', 'technical_gate']
  },
  {
    id: 'software_dev',
    name: 'Software Development',
    subtopics: [
      'Web Development (Frontend & Backend)',
      'React & Modern UI Frameworks',
      'Node.js & Server-side Dev',
      'App Development (Android, iOS, Flutter)',
      'API Design (REST, GraphQL, gRPC)',
      'Microservices Architecture',
      'Version Control (Git, GitHub, CI/CD)'
    ],
    examCategoryIds: ['coding_tech']
  },
  {
    id: 'ai_data_science',
    name: 'AI & Data Science',
    subtopics: [
      'Artificial Intelligence Foundations',
      'Machine Learning (Supervised/Unsupervised)',
      'Neural Networks & Deep Learning',
      'Natural Language Processing (NLP)',
      'Computer Vision Basics',
      'Big Data (Hadoop, Spark)',
      'Data Visualization & Analysis'
    ],
    examCategoryIds: ['coding_tech']
  },
  {
    id: 'ga',
    name: 'General Awareness',
    subtopics: [
      'Current Affairs (National/Intl)', 
      'Ancient & Medieval Indian History',
      'Modern Indian History & Freedom Struggle',
      'Indian Geography (Rivers, Mountains)',
      'World Geography & Resources',
      'Indian Polity (Articles, Schedules)',
      'Constitutional Bodies & Amendments',
      'Macro & Micro Economics',
      'Sustainable Development Goals',
      'General Science (Everyday Life)',
      'Awards, Books & Authors',
      'Sports & Defense Exercises'
    ],
    examCategoryIds: ['railway', 'bank_rbi', 'ssc_gov', 'defence_police']
  },
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    subtopics: [
      'Number System & HCF/LCM',
      'Simplification & Decimals',
      'Ratio & Proportion',
      'Percentage & Interest (SI/CI)',
      'Profit, Loss & Discount',
      'Averages & Mixtures',
      'Time, Work & Wages',
      'Speed, Distance & Trains',
      'Basic Algebra & Polynomials',
      'Geometry (Lines, Circles, Triangles)',
      'Trigonometry & Heights',
      'Mensuration (2D & 3D)',
      'Data Interpretation (Table, Pie, Line)',
      'Permutation & Combination',
      'Probability & Statistics'
    ],
    examCategoryIds: ['railway', 'bank_rbi', 'ssc_gov', 'defence_police', 'entrance_jee_neet']
  },
  {
    id: 'reasoning',
    name: 'Logical Reasoning',
    subtopics: [
      'Analogy & Classification',
      'Series (Number & Alphabetical)',
      'Coding-Decoding & Symbols',
      'Direction Sense & Distance',
      'Blood Relations (Coded & Direct)',
      'Syllogism & Venn Diagrams',
      'Inequalities (Mathematical/Coded)',
      'Seating Arrangement (Linear/Circular)',
      'Complex Puzzles (Floor/Box/Day)',
      'Input-Output & Decision Making',
      'Statement & Assumptions',
      'Course of Action & Arguments',
      'Mirror & Water Images',
      'Paper Folding & Cutting'
    ],
    examCategoryIds: ['railway', 'bank_rbi', 'ssc_gov', 'defence_police']
  },
  {
    id: 'physics',
    name: 'Physics (JEE/NEET)',
    subtopics: [
      'Units, Measurements & Vectors',
      'Kinematics & Laws of Motion',
      'Work, Energy & Power',
      'Rotational Mechanics',
      'Gravitation & Satellite Motion',
      'Thermodynamics & Kinetic Theory',
      'Oscillations & Waves',
      'Electrostatics & Capacitance',
      'Current Electricity',
      'Magnetic Effects of Current',
      'Electromagnetic Induction & AC',
      'Optics (Ray & Wave)',
      'Modern Physics (Dual Nature, Atoms)',
      'Semiconductors & Electronic Devices'
    ],
    examCategoryIds: ['entrance_jee_neet', 'academic_cbse', 'technical_gate']
  },
  {
    id: 'chemistry',
    name: 'Chemistry (JEE/NEET)',
    subtopics: [
      'Some Basic Concepts of Chemistry',
      'Atomic Structure & Periodicity',
      'Chemical Bonding & Molecular Structure',
      'Chemical Thermodynamics',
      'Equilibrium (Ionic & Chemical)',
      'Redox Reactions & Electrochemistry',
      'Chemical Kinetics',
      'Surface Chemistry',
      'p-Block, d-Block & f-Block Elements',
      'Coordination Compounds',
      'Organic Chemistry: Basics & Hydrocarbons',
      'Haloalkanes & Haloarenes',
      'Alcohols, Phenols & Ethers',
      'Aldehydes, Ketones & Carboxylic Acids',
      'Biomolecules & Polymers'
    ],
    examCategoryIds: ['entrance_jee_neet', 'academic_cbse']
  },
  {
    id: 'biology',
    name: 'Biology (NEET)',
    subtopics: [
      'Diversity in Living World',
      'Structural Organization in Animals/Plants',
      'Cell Structure & Function',
      'Plant Physiology (Photosynthesis/Respiration)',
      'Human Physiology (Digestion/Excretion)',
      'Reproduction (Plants & Humans)',
      'Genetics & Evolution',
      'Biology in Human Welfare',
      'Biotechnology & its Applications',
      'Ecology & Environment'
    ],
    examCategoryIds: ['entrance_jee_neet', 'academic_cbse']
  },
  {
    id: 'english',
    name: 'English Language',
    subtopics: [
      'Reading Comprehension (Passages)',
      'Error Spotting & Sentence Correction',
      'Fill in the Blanks (Prepositions/Verbs)',
      'Synonyms & Antonyms',
      'Idioms & Phrases',
      'One Word Substitution',
      'Cloze Test',
      'Para Jumbles (Sentence Rearrangement)',
      'Active/Passive Voice',
      'Direct/Indirect Speech'
    ],
    examCategoryIds: ['bank_rbi', 'ssc_gov', 'defence_police', 'academic_cbse']
  },
  {
    id: 'gate_cs',
    name: 'CS & IT (GATE)',
    subtopics: [
      'Discrete Mathematics',
      'Digital Logic & Design',
      'Computer Organization & Architecture',
      'Programming & Data Structures',
      'Algorithms (Sorting/Searching)',
      'Theory of Computation (Automata)',
      'Compiler Design',
      'Operating Systems',
      'Databases (SQL/Normalization)',
      'Computer Networks'
    ],
    examCategoryIds: ['technical_gate']
  },
  {
    id: 'gate_core',
    name: 'Engineering Core (GATE)',
    subtopics: [
      'Engineering Mathematics',
      'Thermodynamics (Mech)',
      'Strength of Materials (Civil/Mech)',
      'Fluid Mechanics',
      'Electrical Machines & Networks (EE)',
      'Analog & Digital Electronics (EC)',
      'Structural Analysis (Civil)',
      'Surveying & Transportation (Civil)'
    ],
    examCategoryIds: ['technical_gate']
  },
  {
    id: 'specialized',
    name: 'Specialized Awareness',
    subtopics: [
      'Banking History & RBI Acts',
      'Monetary Policy & Repo Rates',
      'Financial Inclusion & Digital Banking',
      'Computer Fundamentals (Hardware/SW)',
      'Operating Systems & Networking Basics',
      'MS Office (Word/Excel/Powerpoint)',
      'Police Administration & Ethics',
      'Indian Penal Code (Basics)',
      'Defense Weapons & Commands',
      'Railway Zones & History'
    ],
    examCategoryIds: ['railway', 'bank_rbi', 'defence_police']
  }
];

export const LIBRA_SYSTEM_PROMPT = `You are Libra, the specialized AI assistant for RAGYU, an Indian government, competitive exam, and technical interview preparation platform. 
Your goal is to help students across a wide range of domains (SSC, Railway, Banking, GATE, JEE, NEET, and Coding).

STRUCTURAL GUIDELINES FOR HIGH READABILITY:
1. Always start with a brief, high-level overview of the topic.
2. Use ## (Level 2 Headers) to separate major sections.
3. Use ### (Level 3 Headers) for specific sub-points.
4. Use > (Blockquotes) for "Pro Tips," "Common Mistakes," or "Historical Context."
5. Use Tables to compare concepts (e.g., Python vs Java, or Fundamental Rights vs Duties).

SPECIAL FORMATTING RULES:
- **Bold** for critical terms.
- [BLUE]...[/BLUE] for helpful reminders.
- [GREEN]...[/GREEN] for key successes or correct facts.
- [RED]...[/RED] for common pitfalls or incorrect assumptions.
- [ORANGE]...[/ORANGE] for strategic exam shortcuts.
- Use LaTeX for ALL math formulas ($inline$ and $$display$$).
- Use code blocks with the correct language tag for any programming snippets.

Be encouraging, professional, and act like a senior mentor who knows the exact exam patterns of the target domain.`;
