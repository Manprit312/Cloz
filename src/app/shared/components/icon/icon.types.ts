// Icon names - logical names for icons
export type IconName =
  | 'wardrobe'
  | 'outfits'
  | 'profile'
  | 'shirt'
  | 'person'
  | 'person-circle'
  | 'home'
  | 'settings'
  | 'add'
  | 'check'
  | 'delete'
  | 'edit'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'chevron-forward'
  | 'chevron-back'
  | 'checkmark-circle'
  | 'close'
  | 'menu'
  | 'search'
  | 'more-vert'
  | 'more-horiz'
  | 'hanger'
  | 'swap-horiz'
  | 'refresh'
  | 'image'
  | 'unfold-more'
  | 'magic-wand'
  | 'accessibility';

// Mapping from logical names to Material Symbols icon names
// Material Symbols uses lowercase with hyphens
export const MATERIAL_SYMBOLS_MAPPING: Record<IconName, string> = {
  wardrobe: 'checkroom',
  outfits: 'checkroom',
  profile: 'person',
  shirt: 'checkroom',
  person: 'person',
  'person-circle': 'account_circle',
  home: 'home',
  settings: 'settings',
  add: 'add',
  check: 'check',
  delete: 'delete',
  edit: 'edit',
  'arrow-left': 'arrow_back',
  'arrow-right': 'arrow_forward',
  'arrow-up': 'arrow_upward',
  'arrow-down': 'arrow_downward',
  'chevron-forward': 'chevron_right',
  'chevron-back': 'chevron_left',
  'checkmark-circle': 'check_circle',
  close: 'close',
  menu: 'menu',
  search: 'search',
  'more-vert': 'more_vert',
  'more-horiz': 'more_horiz',
  hanger: 'checkroom',
  'swap-horiz': 'swap_horiz',
  refresh: 'refresh',
  image: 'image',
  'unfold-more': 'unfold_more',
  'magic-wand': 'auto_awesome',
  accessibility: 'accessibility',
} as const;
