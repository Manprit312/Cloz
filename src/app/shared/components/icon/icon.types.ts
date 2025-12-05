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
  | 'arrow-down';

// Mapping from logical names to actual sprite IDs
// Icons default to line variant, but can be specified as solid by adding '-solid' suffix
export const ICON_MAPPING: Record<
  IconName,
  string | { line: string; solid: string }
> = {
  wardrobe: {
    line: 'Wardrobe--line',
    solid: 'Wardrobe--solid',
  },
  outfits: {
    line: 'Outfits--line',
    solid: 'Outfits--solid',
  },
  profile: {
    line: 'Profile--line',
    solid: 'Profile--solid',
  },
  shirt: {
    line: 'Shirt--line',
    solid: 'Shirt--solid',
  },
  person: {
    line: 'Person--line',
    solid: 'Person--solid',
  },
  'person-circle': {
    line: 'Person-Circle--line',
    solid: 'Person-Circle--solid',
  },
  home: {
    line: 'Home--line',
    solid: 'Home--solid',
  },
  settings: {
    line: 'Settings--line',
    solid: 'Settings--solid',
  },
  add: {
    line: 'Add--line',
    solid: 'Add--solid',
  },
  check: {
    line: 'Check--line',
    solid: 'Check--solid',
  },
  delete: {
    line: 'Delete--line',
    solid: 'Delete--solid',
  },
  edit: {
    line: 'Edit--line',
    solid: 'Edit--solid',
  },
  'arrow-left': {
    line: 'Arrow-Left--line',
    solid: 'Arrow-Left--solid',
  },
  'arrow-right': {
    line: 'Arrow-Right--line',
    solid: 'Arrow-Right--solid',
  },
  'arrow-up': {
    line: 'Arrow-Up--line',
    solid: 'Arrow-Up--solid',
  },
  'arrow-down': {
    line: 'Arrow-Down--line',
    solid: 'Arrow-Down--solid',
  },
} as const;

