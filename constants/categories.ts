export type ProgrammationCategory =
  | 'Bien-être'
  | 'Découverte & orientation'
  | 'Vie quotidienne'
  | 'Formations'
  | 'Rencontres/Visites'
  | 'Mobilité'
  | 'Emploi'
  | 'Numérique'
  | 'Formations & Ateliers'
  | 'Droits'
  | 'Bénévolat';

export const PROGRAMMATION_CATEGORIES: ProgrammationCategory[] = [
  'Bien-être', 'Découverte & orientation', 'Vie quotidienne', 'Formations',
  'Formations & Ateliers', 'Rencontres/Visites', 'Mobilité', 'Emploi',
  'Numérique', 'Droits', 'Bénévolat',
];

export const PROGRAMMATION_CATEGORY_COLORS: Record<ProgrammationCategory, string> = {
  'Bien-être': '#024266',
  'Découverte & orientation': '#FB6223',
  'Vie quotidienne': '#93C1AF',
  'Formations': '#FB6223',
  'Formations & Ateliers': '#FB6223',
  'Rencontres/Visites': 'var(--prado-teal)',
  'Mobilité': '#93C1AF',
  'Emploi': '#FB6223',
  'Numérique': 'var(--prado-teal)',
  'Droits': '#FB6223',
  'Bénévolat': '#024266',
};

export type RessourceCategory =
  | 'Accompagnement/Insertion'
  | 'Acces aux droits'
  | 'Emploi/Formation'
  | 'Logement/Mobilite'
  | 'Sante';

export const RESSOURCE_CATEGORIES: RessourceCategory[] = [
  'Accompagnement/Insertion', 'Acces aux droits', 'Emploi/Formation',
  'Logement/Mobilite', 'Sante',
];

export const RESSOURCE_CATEGORY_COLORS: Record<RessourceCategory, string> = {
  'Accompagnement/Insertion': '#FB6223',
  'Acces aux droits': '#FB6223',
  'Emploi/Formation': '#93C1AF',
  'Logement/Mobilite': '#024266',
  'Sante': 'var(--prado-teal)',
};
