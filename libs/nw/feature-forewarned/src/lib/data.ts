export type Evidence = {
  label: string,
  icon: string,
  hotkey: string,
  observed?: boolean,
  redundant?: boolean
};

export const evidence = {
  footsteps: {
    label: 'Audible Footsteps',
    icon: 'steps',
    hotkey: 's'
  } as Evidence,
  radar: {
    label: 'Radar Detection',
    icon: 'radar',
    hotkey: 'r'
  } as Evidence,
  reanimation: {
    label: 'Reanimates Corpses',
    icon: 'walker',
    hotkey: 'w'
  } as Evidence,
  radioactive: {
    label: 'Radioactivity',
    icon: 'geiger',
    hotkey: 'g'
  } as Evidence,
  tremors: {
    label: 'Causes Tremors',
    icon: 'quake',
    hotkey: 'q'
  } as Evidence,
  voice: {
    label: 'Vocal Response',
    icon: 'voice',
    hotkey: 'v'
  } as Evidence,
  flames: {
    label: 'Extinguish Flames',
    icon: 'flames',
    hotkey: 'f'
  } as Evidence,
  metallic: {
    label: 'Metallic Signature',
    icon: 'metal',
    hotkey: 'm'
  } as Evidence ,
  magnetic: {
    label: 'Magnetic Distortion',
    icon: 'compass',
    hotkey: 'c'
  } as Evidence,
  destruction: {
    label: 'Destroys Objects',
    icon: 'destruction',
    hotkey: 'd'
  } as Evidence ,
  tombs: {
    label: 'Disturbed Tombs',
    icon: 'tombs',
    hotkey: 't'
  } as Evidence,
  electronic: {
    label: 'Electronic Disturbance',
    icon: 'electric',
    hotkey: 'e'
  } as Evidence,
};

export type Mejai = {
  name: string,
  note: string,
  icon: string,
  evidence: Evidence[]
};

export const mejai = {
  necreph: {
    name: 'Necreph the Shadow',
    note: 'Telports. Must have total darkness.',
    icon: '',
    evidence: [
      evidence.radioactive,
      evidence.voice,
      evidence.flames,
      evidence.metallic,
      evidence.magnetic,
      evidence.destruction,
      evidence.tombs,
      evidence.electronic
    ]
  } as Mejai,
  rathos: {
    name: 'Rathos the Damned',
    note: 'Super-mummy. Use fire.',
    icon: '',
    evidence: [
      evidence.footsteps,
      evidence.radar,
      evidence.reanimation,
      evidence.flames,
      evidence.metallic,
      evidence.magnetic,
      evidence.tombs,
      evidence.electronic
    ]
  } as Mejai,
  dekan: {
    name: 'Dekan the Lost',
    note: 'Stomps around. Great hearing, poor vision.',
    icon: '',
    evidence: [
      evidence.footsteps,
      evidence.radar,
      evidence.reanimation,
      evidence.radioactive,
      evidence.tremors,
      evidence.voice,
      evidence.destruction,
      evidence.tombs
    ]
  } as Mejai,
  ouphris: {
    name: 'Ouphris the Forgotten',
    note: 'Shapeshifts. Use Heka Amulet.',
    icon: '',
    evidence: [
      evidence.footsteps,
      evidence.reanimation,
      evidence.radioactive,
      evidence.tremors,
      evidence.voice,
      evidence.flames,
      evidence.metallic,
      evidence.magnetic
    ]
  } as Mejai,
  talgor: {
    name: 'Talgor the Perilous',
    note: 'Invisible. Use tablet, scream.',
    icon: '',
    evidence: [
      evidence.radar,
      evidence.reanimation,
      evidence.radioactive,
      evidence.tremors,
      evidence.flames,
      evidence.magnetic,
      evidence.destruction,
      evidence.electronic
    ]
  } as Mejai,
  ataimon: {
    name: 'Ataimon the Abominable',
    note: 'Creates abominations. Flicker flashlight / camera flash.',
    icon: '',
    evidence: [
      evidence.footsteps,
      evidence.radar,
      evidence.tremors,
      evidence.voice,
      evidence.metallic,
      evidence.destruction,
      evidence.tombs,
      evidence.electronic
    ]
  } as Mejai,
  ptahmes: {
    name: 'Ptahmes the Resilient',
    note: 'Disorientates. Look but not too long, use camera.',
    icon: '',
    evidence: [
      evidence.footsteps,
      evidence.radar,
      evidence.reanimation,
      evidence.tremors,
      evidence.voice,
      evidence.flames,
      evidence.destruction,
      evidence.electronic
    ]
  } as Mejai
};

export const questions = [
  `Who are you?`,
  `I will kill/ destroy you`,
  `What is your name?`,
  `Give me a sign`,
  `Where is the gold?`,
  `Spare me`,
  `Where is the treasury?`,
  `Extinguish these flames`,
  `Why are you here?`,
  `Extinguish my torch`,
  `What are you?`,
  `Break this`,
  `What do you want?`,
  `Destroy this`,
  `Are you angry?`,
  `I don't like this`,
  `Are you friendly?`,
  `Do something`,
  `Can you hear me?`,
  `I have fire`,
  `Are you here/ there?`,
  `I'm scared`,
  `Are you a mejai?`,
  `Say something`,
  `Are you going to hurt me?`,
  `I will burn you`,
  `Are you going to kill me?`,
  `Hear Voices`,
  `Where is the relic/artifact/lore page?`,
  `Bring them to life`,
  `Are you nearby?`,
  `I will burn you`,
  `Are you french?`,
  `Reanimate Them`,
  `Can you break this?`,
  `Disturb This Tomb`,
  `Can you talk?`,
  `Can you extinguish my torch?`,
  `Can you reanimate this/them/that?`,
  `Can I leave?`,
  `What can I/ we do?`,
  `Can you say something?`,
  `Can you speak?`,
  `Am I weak?`,
  `When is the next update?`,
  `Penny for your thoughts.`,
  `We are going to steal your stuff.`,
  `Will I survive?`,
];

export type Simon = {
  name: string,
  icon: string,
};

export const simon = [
  {
    name: 'Bird',
    icon: 'bird'
  },
  {
    name: 'Fish',
    icon: 'fish'
  },
  {
    name: 'Froggy',
    icon: 'frog'
  },
  {
    name: 'Lizard',
    icon: 'lizard'
  },
  {
    name: 'Scarab',
    icon: 'scarab'
  },
  {
    name: 'Snake',
    icon: 'snake'
  }
];
