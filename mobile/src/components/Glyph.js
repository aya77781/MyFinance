import Svg, { Path, Circle, Rect, Line, G, Polyline } from 'react-native-svg';

// Bibliotheque d'icones lineaires dessinees a la main (aucune librairie, aucun emoji).
export default function Glyph({ name, color = '#10131A', size = 22, strokeWidth = 1.9 }) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const V = (children) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );

  switch (name) {
    case 'cart': // Courses
      return V(
        <G {...p}>
          <Circle cx="9" cy="20" r="1.3" fill={color} stroke="none" />
          <Circle cx="18" cy="20" r="1.3" fill={color} stroke="none" />
          <Path d="M3 4 H5 L7 15 H19 L21 7 H6" />
        </G>
      );
    case 'fork': // Restaurant
      return V(
        <G {...p}>
          <Path d="M7 3 V21 M5 3 V8 a2 2 0 0 0 4 0 V3" />
          <Path d="M16 3 c-1.5 0 -2.5 2 -2.5 5 c0 2 1 3 2.5 3 V21" />
        </G>
      );
    case 'car': // Transport
      return V(
        <G {...p}>
          <Path d="M4 13 L5.5 8 H18.5 L20 13" />
          <Rect x="3" y="13" width="18" height="5" rx="1.5" />
          <Circle cx="7" cy="18.5" r="1.2" fill={color} stroke="none" />
          <Circle cx="17" cy="18.5" r="1.2" fill={color} stroke="none" />
        </G>
      );
    case 'home': // Logement
      return V(
        <Path {...p} d="M4 11 L12 4 L20 11 V20 H4 Z M10 20 V14 H14 V20" />
      );
    case 'ticket': // Loisirs
      return V(
        <G {...p}>
          <Path d="M4 8 a2 2 0 0 1 2-2 H18 a2 2 0 0 1 2 2 a2 2 0 0 0 0 4 a2 2 0 0 1 0 4 H6 a2 2 0 0 1-2-2 a2 2 0 0 0 0-4 Z" />
          <Line x1="13" y1="6" x2="13" y2="18" strokeDasharray="1 2" />
        </G>
      );
    case 'heart': // Sante
      return V(
        <Path {...p} d="M12 20 C5 15 3 11 4.5 8 C6 5.5 9.5 6 12 9 C14.5 6 18 5.5 19.5 8 C21 11 19 15 12 20 Z" />
      );
    case 'repeat': // Abonnements
      return V(
        <G {...p}>
          <Path d="M4 9 a8 8 0 0 1 14-4 L19 6" />
          <Path d="M20 15 a8 8 0 0 1-14 4 L5 18" />
          <Polyline points="19,2 19,6 15,6" />
          <Polyline points="5,22 5,18 9,18" />
        </G>
      );
    case 'bag': // Shopping
      return V(
        <G {...p}>
          <Path d="M6 8 H18 L19 20 H5 Z" />
          <Path d="M9 8 V6 a3 3 0 0 1 6 0 V8" />
        </G>
      );
    case 'list': // Transactions
      return V(
        <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
          <Line x1="9" y1="7" x2="20" y2="7" />
          <Line x1="9" y1="12" x2="20" y2="12" />
          <Line x1="9" y1="17" x2="20" y2="17" />
          <Circle cx="4.5" cy="7" r="1" fill={color} stroke="none" />
          <Circle cx="4.5" cy="12" r="1" fill={color} stroke="none" />
          <Circle cx="4.5" cy="17" r="1" fill={color} stroke="none" />
        </G>
      );
    case 'plus': // Action ajouter
      return V(<G {...p}><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></G>);
    case 'savings': // Action epargne (tirelire stylisee)
      return V(
        <G {...p}>
          <Path d="M4 12 a6 5 0 0 1 12 0 a6 5 0 0 1-12 0 Z" />
          <Path d="M16 10 c2 0 3 1.5 3 3 M9 7 a3 2 0 0 1 4 0" />
          <Line x1="7" y1="17" x2="7" y2="19" />
          <Line x1="13" y1="17" x2="13" y2="19" />
        </G>
      );
    case 'target': // Action challenge
      return V(
        <G {...p}>
          <Circle cx="12" cy="12" r="8" />
          <Circle cx="12" cy="12" r="4" />
          <Circle cx="12" cy="12" r="1" fill={color} stroke="none" />
        </G>
      );
    case 'wallet': // Action budget
      return V(
        <G {...p}>
          <Rect x="3" y="6" width="18" height="13" rx="3" />
          <Path d="M3 10 H21" />
          <Circle cx="16.5" cy="14" r="1.1" fill={color} stroke="none" />
        </G>
      );
    case 'arrowUp':
      return V(<G {...p}><Line x1="12" y1="19" x2="12" y2="5" /><Polyline points="6,11 12,5 18,11" /></G>);
    case 'arrowDown':
      return V(<G {...p}><Line x1="12" y1="5" x2="12" y2="19" /><Polyline points="6,13 12,19 18,13" /></G>);
    case 'dots':
      return V(
        <G fill={color}>
          <Circle cx="5" cy="12" r="1.6" />
          <Circle cx="12" cy="12" r="1.6" />
          <Circle cx="19" cy="12" r="1.6" />
        </G>
      );
    case 'chevron':
      return V(<Polyline {...p} points="9,6 15,12 9,18" />);
    case 'news': // Onglet Marche
      return V(
        <G {...p}>
          <Path d="M4 5 H17 V19 a2 2 0 0 1-2 2 H5 a1 1 0 0 1-1-1 Z" />
          <Path d="M17 8 H20 V19 a2 2 0 0 1-2 2" />
          <Line x1="7" y1="9" x2="14" y2="9" />
          <Line x1="7" y1="13" x2="14" y2="13" />
          <Line x1="7" y1="17" x2="11" y2="17" />
        </G>
      );
    case 'trending':
      return V(
        <G {...p}>
          <Polyline points="3,16 9,10 13,14 21,6" />
          <Polyline points="15,6 21,6 21,12" />
        </G>
      );
    case 'external':
      return V(
        <G {...p}>
          <Path d="M14 4 H20 V10" />
          <Line x1="20" y1="4" x2="11" y2="13" />
          <Path d="M18 14 V19 a1 1 0 0 1-1 1 H6 a1 1 0 0 1-1-1 V8 a1 1 0 0 1 1-1 H11" />
        </G>
      );
    case 'tag':
    default:
      return V(
        <G {...p}>
          <Path d="M4 4 H12 L20 12 L12 20 L4 12 Z" />
          <Circle cx="8" cy="8" r="1.2" fill={color} stroke="none" />
        </G>
      );
  }
}

// Choisit un glyphe a partir du nom de categorie (FR).
export function glyphForCategory(name = '') {
  const n = name.toLowerCase();
  if (/(course|aliment|march|epicerie|superm)/.test(n)) return 'cart';
  if (/(resto|restaurant|repas|dejeuner|diner|cafe)/.test(n)) return 'fork';
  if (/(transport|essence|metro|train|bus|voiture|taxi|uber)/.test(n)) return 'car';
  if (/(logement|loyer|maison|appart|immo)/.test(n)) return 'home';
  if (/(loisir|sortie|cinema|sport|jeu)/.test(n)) return 'ticket';
  if (/(sante|medecin|pharma|assur|mutuelle)/.test(n)) return 'heart';
  if (/(abonn|netflix|spotify|sub|telephone|internet)/.test(n)) return 'repeat';
  if (/(shopping|vetement|achat|mode)/.test(n)) return 'bag';
  return 'tag';
}
