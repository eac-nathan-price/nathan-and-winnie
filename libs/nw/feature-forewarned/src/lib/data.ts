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
}

export const mejai = {
  necreph: {
    name: 'Necreph the Shadow',
    note: '',
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
    note: '',
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
    note: '',
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
    note: '',
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
    note: '',
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
    note: '',
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
    note: '',
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
