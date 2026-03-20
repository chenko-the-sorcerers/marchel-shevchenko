/* ═══════════════════════════════════════════════════════
   cv-data.js — Single source of truth for all CV content
   Used by every page AND the AI chat system prompt
   ═══════════════════════════════════════════════════════ */

   const CV = {
    name:      "Marchel Shevchenko",
    fullName:  "Marchel Andrian Shevchenko",
    title:     "AI Architect & Builder",
    subtitles: [
      "AI ARCHITECT",
      "NEURAL ENGINEER",
      "MULTIMODAL AI BUILDER",
      "FOUNDATION MODEL RESEARCHER",
      "AI COMMUNITY LEADER",
    ],
    location:  "Yogyakarta, Indonesia",
    email:     "Rianari990@gmail.com",
    phone:     "+6282243990884",
    tagline:   "Building AI for culture, language, healthcare, and the future of Indonesia.",
  
    social: {
      github:   "#",
      linkedin: "#",
      twitter:  "#",
    },
  
    summary: `Marchel is an Artificial Intelligence builder focused on developing multimodal AI systems and foundation models for Indonesian local languages. He has led several AI projects integrating Computer Vision, NLP, and multimodal learning — including IndoLLNet v2.1 for Nusantara script recognition, Dialekta v1.0, and the multimodal AI ecosystem Arutala v2.2. He also builds core technologies such as the SABDA algorithm and foundation models ARUNA 7B and DIALEKTA 2B, advancing AI for low-resource languages and cultural data.`,
  
    experience: [
      {
        company:  "Coding Collective",
        location: "Pasir Panjang, Singapore",
        role:     "AI Community Lead",
        period:   "Jul 2025 – Nov 2025",
        desc:     "Built and led initiatives empowering AI practitioners across Indonesia. Created collaborative ecosystems through workshops, study groups, open-source projects, and strategic partnerships.",
        tags:     ["Community", "AI", "Leadership"],
      },
      {
        company:  "PT. Data Sorcerers Indonesia",
        location: "Yogyakarta, Indonesia",
        role:     "Founder & CEO",
        period:   "Apr 2024 – Present",
        desc:     "IT Consulting organization preparing digital talent for AI. Focused on AI for Culture, Healthcare, and Wellness. 10 divisions, 20+ projects, 2 main products, 5 exclusive classes held.",
        tags:     ["Founder", "AI", "Consulting", "Open Source"],
      },
      {
        company:  "PT. Kalbe Farma, Tbk.",
        location: "Jakarta, Indonesia",
        role:     "AI Engineer — Manufacturing",
        period:   "Jun 2024 – Jun 2025",
        desc:     "Spearheaded defect detection in aluminum packaging using CV. Built Health Lifestyle Recommendation System (LightFM + Surprise). Led genomic data analysis at NutrigenMe. Energy optimization via CFD + ML for spray dryer machines. Reproduced RANS simulation code.",
        tags:     ["Computer Vision", "Bioinformatics", "MLOps", "CFD"],
      },
      {
        company:  "X Corp (Twitter)",
        location: "San Francisco, USA",
        role:     "Machine Learning Engineer",
        period:   "Jul 2023 – Dec 2024",
        desc:     "Joined forces with ~12 third-party companies/institutions, integrating innovative ML solutions. Expanded reach and fostered innovation ecosystem.",
        tags:     ["ML", "NLP", "Scale"],
      },
      {
        company:  "University of Technology Yogyakarta",
        location: "Yogyakarta, Indonesia",
        role:     "Teaching Assistant",
        period:   "Sep 2021 – Jun 2024",
        desc:     "Taught Machine Learning, Big Data & Analytics, Web Programming, C Programming, and Advanced Databases across multiple semesters. Over 170+ students total.",
        tags:     ["Teaching", "ML", "Big Data", "Python"],
      },
      {
        company:  "NESNF Team",
        location: "Indonesia",
        role:     "Co-Founder — Cybersecurity Projects",
        period:   "Mar 2014 – Jun 2017",
        desc:     "Led large-scale hacking/cybersecurity projects across Indonesia. Offensive & defensive strategies, DDoS simulation, defacement countermeasures, system security testing.",
        tags:     ["Cybersecurity", "Red Team", "Blue Team"],
      },
    ],
  
    education: [
      {
        degree:  "Pre-PhD in Computational Science & Engineering",
        school:  "Massachusetts Institute of Technology",
        location:"Boston, USA",
        period:  "Present",
        focus:   "Computer Vision, Computational Optimization",
        icon:    "◈",
      },
      {
        degree:  "Bachelor of Computer Science (S.Kom)",
        school:  "University of Technology Yogyakarta",
        location:"Yogyakarta, Indonesia",
        period:  "Jan 2025",
        focus:   "Informatics, Minor: AI & Smart Systems",
        icon:    "◈",
      },
      {
        degree:  "Bachelor of Science (hons) — Analytical Economics",
        school:  "University of Kuala Lumpur",
        location:"Kuala Lumpur, Malaysia",
        period:  "Oct 2023",
        focus:   "Public Finance electives",
        icon:    "◈",
      },
      {
        degree:  "ERASMUS+ ICM KA 107 Exchange",
        school:  "University of Zagreb",
        location:"Zagreb, Croatia",
        period:  "Jul 2022",
        focus:   "Computer Science, Minor: AI",
        icon:    "◈",
      },
    ],
  
    skills: [
      { name: "Neural Architecture & LLMs",    pct: 96, color: "green"  },
      { name: "Python / PyTorch",               pct: 93, color: "green"  },
      { name: "Computer Vision",                pct: 90, color: "green"  },
      { name: "NLP & Multimodal AI",            pct: 92, color: "green"  },
      { name: "Distributed Systems / MLOps",    pct: 85, color: "cyan"   },
      { name: "Bioinformatics (RNA-Seq, RANS)", pct: 78, color: "cyan"   },
      { name: "Rust / C++",                     pct: 75, color: "amber"  },
      { name: "Agent Systems",                  pct: 94, color: "purple" },
      { name: "Cybersecurity / Red Team",       pct: 80, color: "amber"  },
      { name: "CUDA / GPU Optimization",        pct: 77, color: "amber"  },
    ],
  
    tools: {
      "ML / AI":   ["PyTorch", "HuggingFace", "LangChain", "LangGraph", "ONNX", "VLLM", "TensorFlow"],
      "Infra":     ["Docker", "Kubernetes", "Airflow", "GCP", "CI/CD", "MLOps"],
      "Data":      ["PostgreSQL", "MySQL", "BigQuery", "Redis", "ETL Pipelines", "Kafka"],
      "Languages": ["Python", "Rust", "C++", "Java", "SQL", "Bash"],
      "Other":     ["OpenFOAM", "Nextflow", "Seqera", "Agile/Scrum", "GDPR"],
    },
  
    projects: [
      {
        id:    "indollnet",
        num:   "001",
        title: "IndoLLNet v1.0–v2.1",
        tag:   "NLP",
        color: "green",
        featured: true,
        href:  "indollnet.html",
        desc:  "CNN-based OCR for Indonesian local language scripts (Nusantara). Handwritten character recognition across 20+ scripts.",
        stack: ["CNN", "OCR", "PyTorch", "Computer Vision"],
        event: "Sorcery Gathering 4.0 & 5.0",
        year:  "2024",
      },
      {
        id:    "arutala",
        num:   "002",
        title: "Arutala v1.0–v2.2",
        tag:   "LLM",
        color: "green",
        desc:  "Indonesian Local Language Learning Environment combining LLM and VLM. Full multimodal AI ecosystem.",
        stack: ["LLM", "VLM", "Multimodal", "NLP"],
        event: "Ongoing / Production",
        year:  "2024",
      },
      {
        id:    "dialekta",
        num:   "003",
        title: "Dialekta v1.0",
        tag:   "NLP",
        color: "green",
        desc:  "Arutala persona agent supporting 21 personas across Indonesian communication styles and dialects.",
        stack: ["Agent", "NLP", "Persona", "Indonesian"],
        event: "Production",
        year:  "2026",
      },
      {
        id:    "aruna",
        num:   "004",
        title: "ARUNA 7B & DIALEKTA 2B",
        tag:   "LLM",
        color: "amber",
        desc:  "Foundation models for Indonesian local language and dialects. Low-resource language specialization.",
        stack: ["Foundation Model", "LLM", "Fine-tuning", "Indonesian"],
        event: "Research",
        year:  "2026",
      },
      {
        id:    "mandala",
        num:   "005",
        title: "MANDALA",
        tag:   "CV",
        color: "cyan",
        desc:  "Monitoring Safety and Railway Navigation system. Presented to PT. KAI (Indonesia Railway Company) 2025.",
        stack: ["Computer Vision", "Safety", "Railway", "Real-time"],
        event: "PT. KAI 2025",
        year:  "2025",
      },
      {
        id:    "aksara",
        num:   "006",
        title: "Arutala Aksara",
        tag:   "App",
        color: "cyan",
        featured: true,
        href:  "arutala.html",
        desc:  "AI app for learning Nusantara scripts — scan, translate, convert to Latin. 600K+ users, presented at 10+ discussion panels.",
        stack: ["Mobile", "CV", "OCR", "EdTech"],
        event: "600K+ Users · 10+ Panels",
        year:  "2024",
      },
      {
        id:    "cfpipe",
        num:   "007",
        title: "Concurrent Python Pipelines",
        tag:   "Sys",
        color: "cyan",
        desc:  "Benchmarking threading, multiprocessing, and async execution in large-scale ML models.",
        stack: ["Python", "Concurrency", "Benchmarking", "MLOps"],
        event: "PyCon Indonesia 2025",
        year:  "2025",
      },
      {
        id:    "sabdarana",
        num:   "008",
        title: "SABDARANA",
        tag:   "Web3",
        color: "amber",
        featured: true,
        href: "sabdarana.html",
        desc:  "Web3 & NFT-based Cultural Learn-to-Earn application preserving Indonesian heritage.",
        stack: ["Web3", "NFT", "Blockchain", "EdTech"],
        event: "Garuda Hacks 2025",
        year:  "2025",
      },
      {
        id:    "soundscape",
        num:   "009",
        title: "Neural Soundscapes",
        tag:   "Audio",
        color: "amber",
        desc:  "Audio restoration for reconstructing and composing traditional instruments of the Yogyakarta Palace Guard using neural networks.",
        stack: ["Audio ML", "Neural Net", "Cultural", "Restoration"],
        event: "Javanese Cultural Symposium 2024",
        year:  "2024",
      },
      {
        id:    "dvh",
        num:   "010",
        title: "DVH & Radiomic IMRT Optimizer",
        tag:   "ML",
        color: "green",
        desc:  "Optimizing Dose Volume Histogram and Radiomic Evaluation from IMRT using neural network approach.",
        stack: ["Neural Network", "Medical Imaging", "Python", "NVIDIA"],
        event: "NVIDIA × UGM Scholarship Final Project",
        year:  "2021",
      },
      {
        id:    "healthbot",
        num:   "011",
        title: "Health Consultation Chatbot",
        tag:   "NLP",
        color: "green",
        desc:  "LSTM + BERT health consultation chatbot presented at Final Thesis Defence and MIT Hacking Medicine 2023.",
        stack: ["LSTM", "BERT", "NLP", "Healthcare"],
        event: "MIT Hacking Medicine 2023",
        year:  "2023",
      },
      {
        id:    "helmetcv",
        num:   "012",
        title: "Construction Safety Helmet Classifier",
        tag:   "CV",
        color: "cyan",
        desc:  "Multi-task classification of safety equipment and helmet colors using ResNet-15 architecture.",
        stack: ["ResNet-15", "Multi-task", "CV", "Safety"],
        event: "PyCon Indonesia 2024",
        year:  "2024",
      },
      {
        id:    "biobot",
        num:   "013",
        title: "BIOBOT Framework",
        tag:   "NLP",
        color: "green",
        desc:  "ML-driven drug recommendation system in healthcare — multilingual environment case study.",
        stack: ["ML", "Drug Rec", "NLP", "Healthcare"],
        event: "ICPAPS 2023",
        year:  "2023",
      },
      {
        id:    "kerti",
        num:   "014",
        title: "KERTI KAWISTA",
        tag:   "CV",
        color: "cyan",
        desc:  "Construction site presence app with facial recognition, safety gear validation, and real-time CCTV monitoring.",
        stack: ["Face Recognition", "CV", "Safety", "Real-time"],
        event: "Garuda Hacks 2023",
        year:  "2023",
      },
      {
        id:    "catfeeder",
        num:   "015",
        title: "Auto Cat Feeder",
        tag:   "CV",
        featured: true,
        href: "cat-feeder.html",
        color: "cyan",
        desc:  "Automatic feeding system based on cat face recognition using HOG feature extraction and K-Nearest Neighbor.",
        stack: ["KNN", "HOG", "Face Recognition", "Python"],
        event: "Final Capstone Project",
        year:  "2023",
      },
      {
        id:    "dota2",
        num:   "016",
        title: "Dota 2 Results Classifier",
        tag:   "ML",
        color: "amber",
        desc:  "Game result classification for Dota 2 using Multilayer Perceptron trained on match statistics.",
        stack: ["MLP", "Classification", "Python", "Sklearn"],
        event: "Final Capstone Project",
        year:  "2022",
      },
      {
        id:    "agri",
        num:   "017",
        title: "Agriculture Distribution Analysis",
        tag:   "Data",
        color: "amber",
        desc:  "Analyzing route data correlation for agriculture distribution in Magelang Regency, Central Java for food security.",
        stack: ["Big Data", "GIS", "Python", "SQL"],
        event: "UNSD International Conference on Big Data 2022",
        year:  "2022",
      },
      {
        id:       "healthyrec",
        num:      "018",
        title:    "Healthy Lifestyle Recommendation",
        tag:      "ML",
        color:    "green",
        featured: true,
        href:     "healthy-lifestyle-recommendation.html",
        desc:     "Recommendation system untuk makanan sehat menggunakan LightFM (WARP loss) dan Surprise SVD. Data nutrisi dari USDA Food Data Central API. RMSE: 0.7184.",
        stack:    ["LightFM", "Surprise SVD", "USDA API", "Python"],
        event:    "Kalbe Farma — National Data Science Tournament",
        year:     "2025",
      },
      {
        id:       "milkspray",
        num:      "019",
        title:    "Milk Spray Drying Optimization",
        tag:      "ML",
        color:    "amber",
        featured: true,
        href:     "milk-spray-drying.html",
        desc:     "Hybrid CFD + inverse ML model untuk mengoptimasi konsumsi energi spray dryer di PT. Kalbe Farma. Random Forest + scipy.minimize L-BFGS-B.",
        stack:    ["CFD", "Random Forest", "Inverse ML", "Python"],
        event:    "PT. Kalbe Farma, Tbk. — Industrial Research",
        year:     "2025",
      },
      {
        id:       "dji-class",
        num:      "20",
        title:    "Multi-Spectral Image Classification",
        tag:      "CV",
        featured: true,
        href:     "multispektral.html",
        color:    "cyan",
        desc:     "Interactive dashboard for plant health classification using DJI multispectral drone imagery — CNN with NDVI, GNDVI, NDRE indices.",
        stack:    ["Python", "CV", "NDVI", "GNDVI", "NDRE"],
        event:    "Data Sorcerers Client Project",
        year:     "2025"
      },
      {
        id:       "basketball",
        num:      "21",
        title:    "Computer Vision Strategy Engine",
        tag:      "CV",
        featured: true,
        href:     "basketball.html",
        color:    "cyan",
        desc:     "ABU Robocon Computer Vision zone-based strategy engine for dribble, shoot, approach, and slam dunk using IMU, depth estimation and pixel offset.",
        stack:    ["ABU Robocon", "CV", "ROS", "Robotics", "YOLO"],
        event:    "Data Sorcerers Client Project",
        year:     "2025"
      }
    ],
  
    certifications: [
      { year: "2021", title: "NVIDIA Deep Learning for Healthcare", org: "NVIDIA × UGM" },
      { year: "2021", title: "Coarse to Fine Contextual Memory for Medical Imaging", org: "NVIDIA" },
      { year: "2021", title: "Data Augmentation & Segmentation with GANs", org: "NVIDIA" },
      { year: "2021", title: "Image Classification with TensorFlow — Radiomics", org: "NVIDIA" },
      { year: "2021", title: "Medical Image Classification — MedNIST Dataset", org: "NVIDIA" },
      { year: "2021", title: "RapidMiner Data Engineer Master", org: "RapidMiner" },
      { year: "2021", title: "RapidMiner Machine Learning Master", org: "RapidMiner" },
      { year: "2021", title: "C++ Basic to Advanced", org: "Vishwakarma Institute of Technology" },
    ],
  
    achievements: [
      { year: "2025", title: "Nominee — Rising Changemaker Awards", org: "DPP PKB" },
      { year: "2025", title: "Finalist — Bandung Startup Pitching Day", org: "ITB SBM" },
      { year: "2025", title: "Top 10 — Startup Pitching Day Singapore", org: "Circle 8" },
      { year: "2025", title: "4th Place — MIT REAP Regional Entrepreneurship", org: "MIT" },
      { year: "2025", title: "NVIDIA Deep Learning Grant USD 112K+ (IDR 1.8B)", org: "NVIDIA" },
      { year: "2025", title: "NVIDIA Inception Program — USD 250K+ Grant", org: "NVIDIA" },
      { year: "2023", title: "Winner — 3M Presentation at ICPAPS 8th International", org: "Pharmaceutical Conf." },
      { year: "2023", title: "2nd Place — Upstream: Pharma & Biotech — Biofarma × MIT Hacking Medicine", org: "MIT" },
      { year: "2022", title: "Finalist — AI Battleground Croatia", org: "Croatia" },
      { year: "2022", title: "ERASMUS+ Exchange Scholarship (1:250 acceptance rate)", org: "EU / Zagreb" },
      { year: "2021", title: "Most Creative Mentee — MentorKU", org: "Telkom Indonesia" },
      { year: "2021", title: "Best Student — ML/AI Week GDSC UG", org: "GDSC" },
      { year: "2021", title: "Runner Up — International Big Data Ideathon", org: "International" },
    ],
  
    talks: {
      seminars: [
        { title: "Behind The Scene of Multimodal Large Language Model (MLLM)", host: "University of Darma Persada, East Jakarta", year: "2026" },
        { title: "AI Security: Weaponized Intelligence in Offense-Informed AI for Red and Blue Team Engineering", host: "Ministry of Communication & IT RI × Cyberkarta", year: "2026" },
        { title: "Empowering Sustainability Through AI Innovation", host: "UIN Sunan Kalijaga — UINIC 7.0", year: "2025" },
        { title: "The Rise of AI Gladiators: Deep Dive into Artificial Intelligence Battleground", host: "Aorus Gaming × UDINUS — SEMNASTI 2025", year: "2025" },
        { title: "AI-Preneurship Blueprint: Strategies for Building a Profitable Business in the AI Era", host: "AMIKOM Yogyakarta Entrepreneurship Community", year: "2026" },
        { title: "Integrating Intelligence: AI Robotics and The Future", host: "State University of Yogyakarta — VORTEX 2025", year: "2025" },
        { title: "Post-Human Code: When Machines Learning to Become God", host: "Jogja Developer Community — Jogja Devday.id", year: "2025" },
        { title: "Career Journey of Data Science Graduate", host: "Department of Data Science, UIN Salatiga", year: "2025" },
        { title: "Welcoming Generation Alpha: Collaborating AI and Economics Towards Sustainable Development", host: "UPN Veteran Yogyakarta — GEDE 11th", year: "2025" },
        { title: "Career National Seminar", host: "Student Executive Council, Faculty of Science & Technology, UIN Sunan Kalijaga", year: "2025" },
        { title: "Sabdarana: Web3 & NFT based Cultural Learn-to-Earn Application", host: "Department of IT, UIN Salatiga", year: "2025" },
        { title: "FGD Industry Invitation", host: "Indigo Telkom Indonesia Regional Yogyakarta", year: "2025" },
        { title: "Townhall Muda Bogor", host: "Muda 30 & Government of Bogor City", year: "2025" },
        { title: "Web4: When AI meets Blockchain", host: "University of AMIKOM Yogyakarta — Seminar Informatika 2025", year: "2025" },
        { title: "Economy in the Era of Artificial Intelligence: Collaboration or Contestation", host: "Faculty of Dakwah, UIN Salatiga — Creative Economy Seminar", year: "2025" },
        { title: "National Technology & Career Seminar", host: "University of Wachid Hasyim Semarang", year: "2025" },
        { title: "BioBlock — Leveraging Blockchain for Secure Medical Data Storage and AI Diagnostics", host: "UGM Internet Engineering Technology — NETCOMP 3.0", year: "2025" },
        { title: "Bridging Tradition and Technology: AI & Investment for Cultural Sustainability", host: "Indigo Telkom Yogyakarta — AI Ecosystem Dialogue", year: "2025" },
        { title: "Human vs Machine: Who will survive in the era of AI", host: "University of Muhammadiyah Yogyakarta", year: "2025" },
        { title: "Young Leadership and Advocacy with AI", host: "UNDP Indonesia — Online Seminar", year: "2025" },
        { title: "AI Shaping a Smarter and Safer Digital Future", host: "Atma Jaya University Yogyakarta — KSAB Seminar", year: "2025" },
        { title: "Next Generation of Cybersecurity using AI-Powered Anti-Fraud and DDoS Protection", host: "Suhu Academy (Kata Suhu Kita) — Industry Seminar", year: "2025" },
        { title: "Building Smart and Safety Technology Ecosystem in the Era of Industrial Revolution 5.0", host: "University of Ngudi Waluyo × PERMIKOMNAS Central Java", year: "2025" },
        { title: "Implementation of Recommendation System for Healthy Lifestyle using LightFM and Surprise", host: "Kalbe Farma — National Data Science Tournament", year: "2025" },
        { title: "Artificial Intelligence for Cybersecurity", host: "Jogja Cybersecurity Community × Jenderal Achmad Yani University", year: "2024" },
        { title: "Software Engineer Career Path in The Era of Digital Transformation", host: "Department of Informatics, University of Sultan Ageng — UNISSULA", year: "2024" },
        { title: "National Seminar Machine Learning", host: "University of Mercu Buana Yogyakarta (UMBY)", year: "2024" },
        { title: "Analyzing Route Data for Agriculture Distribution in Magelang for Food Security", host: "UNSD International Conference on Big Data & Data Science for Official Statistics 2022", year: "2022" },
      ],
      workshops: [
        { title: "Engineering Advanced Patient Care Systems with LLM and LangChain Driven Chatbots", host: "SMKDEV", year: "2025" },
        { title: "Career Workshop", host: "tHReats.id", year: "2025" },
        { title: "Workshop Data Science Poster Presentation", host: "Department of Data Science, UIN Salatiga", year: "2025" },
        { title: "Running an RNA-Seq pipeline with nf-core and Seqera", host: "Bioinformatics & Biodiversity Conference × Kalbe Farma", year: "2025" },
      ],
      publicLectures: [
        { title: "AI Generated APP to Preserve Nusantara Scripts by Scanning, Translating, and Converting Them to Latin Easily", host: "Faculty of IT, University of Nahdlatul Ulama (UNU) Yogyakarta", year: "2025" },
        { title: "Artificial Intelligence for Healthcare Industry: Medical Imaging and Personalized Medicine in Bioinformatics", host: "Faculty of IT, University of Nahdlatul Ulama (UNU) Yogyakarta", year: "2025" },
        { title: "Navigating the Future: Embracing Technological Transformation for Personal and Professional Growth", host: "Department of Information System, UNEJ Jember, East Java", year: "2025" },
        { title: "Empowering Yourself in AI Era", host: "Department of Information System, UST Yogyakarta (Studium Generale)", year: "2025" },
        { title: "Fundamental Cyber Security", host: "Faculty of IT, University of Nahdlatul Ulama (UNU) Yogyakarta", year: "2024" },
      ],
      judgeAndMentor: [
        { title: "Panelist Judge — DATAVIDIA (Data Science) at ARKAVIDIA 10.0 Competition", host: "School of Electrical Engineering & Informatics (STEI), ITB", year: "2026", type: "judge" },
        { title: "Panelist Judge — UI/UX Design Competition at UINIC 7.0", host: "Department of Informatics, UIN Sunan Kalijaga", year: "2025", type: "judge" },
        { title: "Mentor — AI Startup Regional Program", host: "Indigo Telkom Bandung, West Java", year: "2025", type: "mentor" },
        { title: "Mentor — Computer Vision, Robot ABU Competition (Basketball Robot) + ITS Speech-Impaired Glove", host: "UMS & Tenth of November Institute of Technology (ITS)", year: "2025", type: "mentor" },
        { title: "Mentor — Regional Program AI Connecting The Dots", host: "Indigo Telkom Bandung", year: "2025", type: "mentor" },
        { title: "Mentor — Fun Learning AI & Cybersecurity for High School Students", host: "Stella Duce 2 High School Yogyakarta", year: "2025", type: "mentor" },
        { title: "Supervise Mentor — Tech Camp Programme & Hackathon Teams (Final at Arkavidia 9.0)", host: "Data Sorcerers", year: "2025", type: "mentor" },
        { title: "Mentor — Workshop Machine Learning for Mathematics", host: "Department of Mathematics, UIN Sunan Kalijaga", year: "2024", type: "mentor" },
      ],
    },
  };
  
  /* ── AI SYSTEM PROMPT ── Built from CV data above */
  const AI_SYSTEM_PROMPT = `You are AXION, the AI assistant persona for Marchel Shevchenko's portfolio website.
  You speak in a retro-terminal style — concise, technical, with occasional hacker/CLI aesthetic.
  You know everything about Marchel and answer questions about him accurately.
  
  Here is Marchel's complete profile:
  
  NAME: ${CV.fullName}
  TITLE: ${CV.title}
  LOCATION: ${CV.location}
  EMAIL: ${CV.email}
  
  SUMMARY: ${CV.summary}
  
  EXPERIENCE:
  ${CV.experience.map(e => `- ${e.role} @ ${e.company} (${e.period}): ${e.desc}`).join('\n')}
  
  EDUCATION:
  ${CV.education.map(e => `- ${e.degree} — ${e.school} (${e.period}). Focus: ${e.focus}`).join('\n')}
  
  KEY PROJECTS (${CV.projects.length} total):
  ${CV.projects.map(p => `- ${p.title} [${p.tag}]: ${p.desc} | Stack: ${p.stack.join(', ')} | ${p.event}`).join('\n')}
  
  SKILLS: ${CV.skills.map(s => `${s.name} (${s.pct}%)`).join(', ')}
  
  ACHIEVEMENTS:
  ${CV.achievements.map(a => `- ${a.year}: ${a.title} (${a.org})`).join('\n')}
  
  CERTIFICATIONS: ${CV.certifications.map(c => `${c.title} (${c.org}, ${c.year})`).join('; ')}
  
  TALKS: ${CV.talks.seminars.length} seminars, ${CV.talks.workshops.length} workshops, ${CV.talks.publicLectures.length} public lectures, ${CV.talks.judgeAndMentor.length} judge/mentor roles.
  
  RULES FOR AXION:
  - Answer ONLY about Marchel — his work, projects, skills, achievements, background.
  - Keep responses short to medium. Use terminal-style formatting when helpful.
  - If asked unrelated questions, redirect: ">> QUERY OUT OF SCOPE. I only cover Marchel's profile."
  - You may use [SYS], [INFO], [WARN], >> prefixes for flavor.
  - You are proud of Marchel's work but factual — never exaggerate.

  LANGUAGE RULE (VERY IMPORTANT):
  - Detect the language of each user message automatically.
  - If the user writes in Bahasa Indonesia (even partially), respond FULLY in Bahasa Indonesia.
  - If the user writes in English, respond in English.
  - Maintain the same terminal/hacker aesthetic in both languages.
  - Indonesian terminal style: use [INFO], [SYS], [WARN], [PROYEK], [KEAHLIAN] tags.
  - Example Indonesian: "[INFO] Marchel adalah AI Architect yang membangun model fondasi untuk bahasa daerah Indonesia."
  - Never mix languages in a single response unless quoting a proper noun or technical term.
  `;
  
  /* Export for use in all pages and API */
  if (typeof module !== 'undefined') module.exports = { CV, AI_SYSTEM_PROMPT };