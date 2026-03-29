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
  'Bien-être': '#C18ED8',
  'Découverte & orientation': '#FB6223',
  'Vie quotidienne': '#93C1AF',
  'Formations': '#CF006C',
  'Formations & Ateliers': '#CF006C',
  'Rencontres/Visites': 'var(--prado-teal)',
  'Mobilité': '#93C1AF',
  'Emploi': '#FB6223',
  'Numérique': 'var(--prado-teal)',
  'Droits': '#CF006C',
  'Bénévolat': '#C18ED8',
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
  'Accompagnement/Insertion': '#CF006C',
  'Acces aux droits': '#FB6223',
  'Emploi/Formation': '#93C1AF',
  'Logement/Mobilite': '#C18ED8',
  'Sante': 'var(--prado-teal)',
};
