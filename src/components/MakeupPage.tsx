import { useState } from 'react';
import { FaceAnalysis } from './AnalysisPage';

// ── Personalized shade selector based on skin tone ───────────────────────
function getPersonalizedShade(category: string, skinTone: string, undertone: string): string {
  const isWarm = undertone.toLowerCase().includes('warm') || undertone.toLowerCase().includes('golden');
  const isCool = undertone.toLowerCase().includes('cool') || undertone.toLowerCase().includes('pink');
  const isDeep = ['Deep', 'Rich', 'Tan'].includes(skinTone);
  const isFair = ['Fair', 'Light'].includes(skinTone);
  const isMedium = ['Medium', 'Olive'].includes(skinTone);

  const shades: Record<string, Record<string, string>> = {
    Foundation: {
      fair_warm: 'Warm Ivory N10', fair_cool: 'Porcelain Rose N08', fair_neutral: 'Soft Ivory N12',
      light_warm: 'Golden Buff W20', light_cool: 'Pink Sand C18', light_neutral: 'Natural Nude N20',
      medium_warm: 'Warm Beige W30', medium_cool: 'Rose Beige C28', medium_neutral: 'Sand Dune N30',
      olive_warm: 'Golden Olive W35', olive_cool: 'Cool Olive C33', olive_neutral: 'Neutral Olive N34',
      tan_warm: 'Honey Bronze W40', tan_cool: 'Dusty Rose C38', tan_neutral: 'Caramel N42',
      deep_warm: 'Mahogany W50', deep_cool: 'Espresso C48', deep_neutral: 'Cocoa N50',
      rich_warm: 'Rich Ebony W60', rich_cool: 'Deep Plum C58', rich_neutral: 'Dark Espresso N60',
    },
    Concealer: {
      fair: 'Alabaster', light: 'Linen', medium: 'Warm Sand', olive: 'Golden Beige',
      tan: 'Honey', deep: 'Chestnut', rich: 'Ebony',
    },
    Lip: {
      warm: isDeep ? 'Rich Berry' : isFair ? 'Peachy Nude' : 'Terracotta',
      cool: isDeep ? 'Deep Plum' : isFair ? 'Rose Pink' : 'Mauve Berry',
      neutral: isDeep ? 'Mocha Brown' : isFair ? 'Barely There' : 'Dusty Rose',
    },
    Blush: {
      warm: isDeep ? 'Warm Amber' : isFair ? 'Peach Sorbet' : 'Coral Flush',
      cool: isDeep ? 'Berry Glow' : isFair ? 'Baby Pink' : 'Rose Flush',
      neutral: isDeep ? 'Bronzed Berry' : isFair ? 'Soft Petal' : 'Dusty Mauve',
    },
    Bronzer: {
      fair: 'Sun Kissed (Light)', light: 'Bronze Latte', medium: 'Amber Glow',
      olive: 'Terra Cotta', tan: 'Deep Bronze', deep: 'Ebony Bronze', rich: 'Dark Mahogany',
    },
    Highlighter: {
      warm: isDeep ? 'Gold Dust' : isFair ? 'Champagne Pearl' : 'Warm Gold',
      cool: isDeep ? 'Silver Prism' : isFair ? 'Icy Pearl' : 'Rose Gold',
      neutral: isDeep ? 'Bronze Beam' : isFair ? 'Soft Opal' : 'Peachy Gold',
    },
  };

  const toneKey = skinTone.toLowerCase();
  const undertoneKey = isWarm ? 'warm' : isCool ? 'cool' : 'neutral';

  if (category === 'Foundation' || category === 'Base') {
    const key = `${toneKey}_${undertoneKey}`;
    return shades.Foundation[key] || shades.Foundation[`medium_${undertoneKey}`] || 'Natural Nude N30';
  }
  if (category === 'Concealer') {
    return shades.Concealer[toneKey] || 'Warm Sand';
  }
  if (category.toLowerCase().includes('lip')) {
    return shades.Lip[undertoneKey] || 'Dusty Rose';
  }
  if (category.toLowerCase().includes('blush')) {
    return shades.Blush[undertoneKey] || 'Rose Flush';
  }
  if (category.toLowerCase().includes('bronzer') || category.toLowerCase().includes('bronze')) {
    return shades.Bronzer[toneKey] || 'Amber Glow';
  }
  if (category.toLowerCase().includes('highlight')) {
    return shades.Highlighter[undertoneKey] || 'Peachy Gold';
  }
  return isMedium ? 'Medium Neutral' : isDeep ? 'Deep Tone' : 'Light Natural';
}

interface MakeupPageProps {
  imageUrl: string;
  analysis: FaceAnalysis;
  onBack: () => void;
}

interface MakeupLook {
  id: string;
  name: string;
  category: string;
  tagline: string;
  icon: string;
  difficulty: string;
  time: string;
  occasion: string;
  palette: string[];
  steps: MakeupStep[];
  products: ProductRec[];
  tips: string[];
}

interface MakeupStep {
  stepNum: number;
  title: string;
  description: string;
  product: string;
  technique: string;
  duration: string;
}

interface ProductRec {
  category: string;
  name: string;
  shade: string;
}

const makeupLooks: MakeupLook[] = [
  {
    id: 'no-makeup',
    name: 'No-Makeup Makeup',
    category: 'Natural',
    tagline: 'Effortlessly beautiful, barely there',
    icon: '✿',
    difficulty: 'Beginner',
    time: '10 min',
    occasion: 'Daily · Work · Morning',
    palette: ['#f5e6d8', '#e8c9b0', '#d4a58a', '#c18870', '#a06b52'],
    steps: [
      { stepNum: 1, title: 'Skin Prep & Primer', description: 'Start with a hydrating primer applied in upward strokes. Focus on pores and fine lines.', product: 'Hydrating Blur Primer', technique: 'Fingertip pressing motion', duration: '2 min' },
      { stepNum: 2, title: 'Skin Tint Application', description: 'Apply a sheer skin tint matching your analyzed skin tone. Blend outward from center of face.', product: 'Luminous Skin Tint', technique: 'Damp beauty sponge', duration: '2 min' },
      { stepNum: 3, title: 'Concealer', description: 'Dot lightweight concealer under eyes and on any spots. Triangle method for under-eyes.', product: 'Radiant Touch Concealer', technique: 'Triangular blending', duration: '1 min' },
      { stepNum: 4, title: 'Brow Grooming', description: 'Brush brows upward, fill sparse areas with feathery strokes following your natural arch.', product: 'Micro Precision Brow Pen', technique: 'Hair-stroke technique', duration: '2 min' },
      { stepNum: 5, title: 'Lash Curling & Mascara', description: 'Curl lashes at root, middle, tip. Apply one coat mascara in zigzag motion.', product: 'Lengthening Mascara', technique: 'Zigzag & roll', duration: '1 min' },
      { stepNum: 6, title: 'Tinted Lip Balm', description: 'Swipe a MLBB (My Lips But Better) tinted balm for natural flush.', product: 'Rosy Nude Lip Tint', technique: 'Direct application', duration: '30 sec' },
    ],
    products: [
      { category: 'Base', name: 'Luminous Skin Tint', shade: 'Warm Nude 03' },
      { category: 'Concealer', name: 'Radiant Concealer', shade: 'Porcelain' },
      { category: 'Mascara', name: 'Lash Curling Formula', shade: 'Soft Black' },
      { category: 'Lip', name: 'Rosy Tinted Balm', shade: 'Barely Blush' },
    ],
    tips: ['Less is more — build coverage gradually', 'Set with a dewy setting spray for glow', 'Use your fingers for the most natural finish'],
  },
  {
    id: 'casual',
    name: 'Casual Glam',
    category: 'Casual',
    tagline: 'Put-together without trying too hard',
    icon: '◎',
    difficulty: 'Beginner',
    time: '20 min',
    occasion: 'Weekend · Brunch · Shopping',
    palette: ['#c4956a', '#b07d58', '#9e6843', '#d4a882', '#e8c4a0'],
    steps: [
      { stepNum: 1, title: 'Foundation & Setting', description: 'Apply medium-coverage foundation with a brush. Build coverage where needed.', product: 'Satin Foundation', technique: 'Stippling brush', duration: '3 min' },
      { stepNum: 2, title: 'Bronzer Contouring', description: 'Warm up the face with bronzer in the "3" shape — forehead, hollows, jaw.', product: 'Sun-Kissed Bronzer', technique: 'Fluffy angled brush', duration: '2 min' },
      { stepNum: 3, title: 'Blush Application', description: 'Apply peachy-nude blush on the apples of cheeks, blending upward toward temples.', product: 'Peachy Flush Blush', technique: 'Dome brush in circular motion', duration: '2 min' },
      { stepNum: 4, title: 'Eye Shadow Base', description: 'Sweep warm taupe across lids. Apply deeper shade in crease for dimension.', product: 'Nude Warm Palette', technique: 'Blending brush', duration: '4 min' },
      { stepNum: 5, title: 'Mascara & Lash Lift', description: 'Two coats mascara — wiggle at roots. Lower lash line mascara optional.', product: 'Volume Boost Mascara', technique: 'Root-to-tip wiggle', duration: '2 min' },
      { stepNum: 6, title: 'Nude Lip Color', description: 'Line lips with nude liner, fill, then apply matching lipstick. Blot for longevity.', product: 'Cashmere Nude Lipstick', technique: 'Liner then lipstick', duration: '2 min' },
    ],
    products: [
      { category: 'Foundation', name: 'Satin Veil Foundation', shade: 'Warm Beige 04' },
      { category: 'Bronzer', name: 'Sun Ritual Bronzer', shade: 'Golden Sand' },
      { category: 'Blush', name: 'Cheek Flush', shade: 'Peachy Coral' },
      { category: 'Lip', name: 'Velvet Nude Lipstick', shade: 'Caramel Kiss' },
    ],
    tips: ['Blend bronzer onto neck for seamless look', 'Smile when applying blush for natural placement', 'Layer thin coats for buildable coverage'],
  },
  {
    id: 'office',
    name: 'Office Chic',
    category: 'Professional',
    tagline: 'Polished authority with feminine grace',
    icon: '◈',
    difficulty: 'Intermediate',
    time: '25 min',
    occasion: 'Work · Meetings · Presentations',
    palette: ['#8b6353', '#c4956a', '#6d4c41', '#b8896a', '#e8d5c4'],
    steps: [
      { stepNum: 1, title: 'Flawless Base', description: 'Full-coverage foundation with setting powder for long-wearing matte finish.', product: 'HD Full Coverage Foundation', technique: 'Beauty blender, then powder brush', duration: '4 min' },
      { stepNum: 2, title: 'Precise Contouring', description: 'Define cheekbones and slim nose bridge with cool-toned contour powder.', product: 'Sculpt & Define Palette', technique: 'Angled contour brush', duration: '3 min' },
      { stepNum: 3, title: 'Structured Brows', description: 'Create sharp, defined brows that frame the face. Fill, define, and set.', product: 'Brow Pomade + Clear Gel', technique: 'Spoolie + angled brush', duration: '3 min' },
      { stepNum: 4, title: 'Neutral Eye Look', description: 'Wash of champagne on lid, defined crease in medium brown, black liner on upper lid.', product: 'Taupe Neutrals Palette', technique: 'Flat + blending brush', duration: '5 min' },
      { stepNum: 5, title: 'Classic Liner', description: 'Thin precise line on upper lash line for definition without drama.', product: 'Precision Felt Liner', technique: 'Short strokes from inner to outer', duration: '2 min' },
      { stepNum: 6, title: 'Berry Mauve Lip', description: 'Deep mauve or berry lip with precise lip liner for professional sophistication.', product: 'Power Matte Lipstick', technique: 'Liner first, then lipstick', duration: '2 min' },
    ],
    products: [
      { category: 'Foundation', name: 'Pro Longwear Foundation', shade: 'Natural Beige' },
      { category: 'Contour', name: 'Sculpting Powder', shade: 'Cool Taupe' },
      { category: 'Eye', name: 'Neutral Gaze Palette', shade: 'Stone & Bronze' },
      { category: 'Lip', name: 'All Day Matte Lip', shade: 'Mulberry' },
    ],
    tips: ['Set T-zone with loose powder first', 'Tap off excess product before applying', 'Matte lip needs perfect liner for clean edges'],
  },
  {
    id: 'evening',
    name: 'Evening Allure',
    category: 'Glamour',
    tagline: 'Captivating from dusk to dawn',
    icon: '✦',
    difficulty: 'Intermediate',
    time: '35 min',
    occasion: 'Dinner · Date · Party',
    palette: ['#5c3d2e', '#8b5e3c', '#c4896a', '#e8b89a', '#f5dcc8'],
    steps: [
      { stepNum: 1, title: 'Luminous Base', description: 'Mix foundation with luminizer for an inner-glow effect. Build coverage selectively.', product: 'Radiance Foundation', technique: 'Brush and blend with fingers', duration: '4 min' },
      { stepNum: 2, title: 'Sculpted Contour', description: 'Deep contour for dramatic cheekbone definition. Highlight the high points.', product: 'Contour & Glow Duo', technique: 'Angled brush + fan brush', duration: '4 min' },
      { stepNum: 3, title: 'Sultry Eye Base', description: 'Prime eyelids. Apply dark brown in crease. Deepen outer corners with mahogany.', product: 'Deep Smoky Palette', technique: 'Blending brush in windshield motion', duration: '6 min' },
      { stepNum: 4, title: 'Smoky Definition', description: 'Smudge dark liner on upper lash line and smoked out lower lash line for intensity.', product: 'Kohl Eyeliner Pencil', technique: 'Smudge brush', duration: '3 min' },
      { stepNum: 5, title: 'Dramatic Lashes', description: 'Apply false lash strip or layer two coats mascara with lash primer for full, fanned lashes.', product: 'Volume × Drama Mascara', technique: 'Fan out from center', duration: '5 min' },
      { stepNum: 6, title: 'Statement Lip', description: 'Rich nude or deep terracotta lip — the crown jewel of the evening look.', product: 'Luxe Velvet Lip Color', technique: 'Precise application with brush', duration: '3 min' },
    ],
    products: [
      { category: 'Base', name: 'Luminous Satin Foundation', shade: 'Toasted Almond' },
      { category: 'Eye', name: 'Midnight Smoky Palette', shade: 'Mahogany + Espresso' },
      { category: 'Liner', name: 'Smoldering Kohl', shade: 'Deep Brown' },
      { category: 'Lip', name: 'Velour Lip Stain', shade: 'Terracotta Dream' },
    ],
    tips: ['Build smoke gradually — avoid jumping too dark', 'Use tape at outer corner for sharp wing', 'Highlight cupid\'s bow for fuller lip effect'],
  },
  {
    id: 'bridal',
    name: 'Bridal Radiance',
    category: 'Bridal',
    tagline: 'Timeless beauty for your forever day',
    icon: '❋',
    difficulty: 'Advanced',
    time: '60 min',
    occasion: 'Wedding · Engagement · Ceremony',
    palette: ['#e8d5c4', '#d4b8a0', '#c4956a', '#a8784e', '#8b6040'],
    steps: [
      { stepNum: 1, title: 'Skin Perfection Prep', description: 'Facial massage, hydrating mask, then SPF-free primer. Skin must be a flawless canvas.', product: 'Bridal Glow Primer', technique: 'Upward facial massage', duration: '8 min' },
      { stepNum: 2, title: 'HD Foundation', description: 'Airbrush-like foundation or HD formula. Blend until absolutely seamless. Set with powder.', product: 'HD Flawless Foundation', technique: 'Damp sponge + brush', duration: '8 min' },
      { stepNum: 3, title: 'Waterproof Setting', description: 'Set with translucent powder, then setting spray for tear-proof, sweat-proof hold.', product: 'Bridal Lock Setting Spray', technique: 'Hold 12 inches away', duration: '2 min' },
      { stepNum: 4, title: 'Ethereal Eye Look', description: 'Champagne shimmer lid, soft rose in crease, pearl highlight on brow bone. Timeless and romantic.', product: 'Bridal Glow Eye Palette', technique: 'Layered blending', duration: '10 min' },
      { stepNum: 5, title: 'Soft Wing Liner', description: 'Delicate, thin wing liner. Brown recommended over black for softer bridal aesthetic.', product: 'Micro Precision Liner', technique: 'Thin precise strokes', duration: '5 min' },
      { stepNum: 6, title: 'Bridal Blush & Highlight', description: 'Soft peach blush on cheeks + temple. Liquid highlighter on cheekbones, nose tip, cupid\'s bow.', product: 'Bridal Glow Bundle', technique: 'Fan brush + fingertip patting', duration: '5 min' },
      { stepNum: 7, title: 'Luxe Nude Lip', description: 'Your perfect nude — lip liner, then velvet lipstick, topped with clear gloss for dimension.', product: 'Wedding Day Lip Kit', technique: 'Layer: liner, lipstick, gloss', duration: '5 min' },
      { stepNum: 8, title: 'Final Setting', description: 'Final fix setting spray from crown of head, let mist fall naturally over face.', product: 'Bridal Finale Spray', technique: 'X then T pattern', duration: '1 min' },
    ],
    products: [
      { category: 'Foundation', name: 'Bridal HD Foundation', shade: 'Porcelain Glow' },
      { category: 'Eye', name: 'Champagne Bridal Palette', shade: 'Rose Gold & Pearl' },
      { category: 'Blush', name: 'Ethereal Blush', shade: 'Rose Petal' },
      { category: 'Lip', name: 'Bridal Nude Lip Kit', shade: 'Champagne Beige' },
      { category: 'Highlight', name: 'Liquid Luminizer', shade: 'Pearl Dew' },
    ],
    tips: ['Test look 2 weeks before wedding for photos', 'Always go waterproof for mascara and liner', 'Bring touch-up kit with blotting papers and lip color', 'Photograph in different lighting before finalizing'],
  },
  {
    id: 'editorial',
    name: 'Editorial Avant-garde',
    category: 'Editorial',
    tagline: 'Art meets beauty, rules are meant to break',
    icon: '◐',
    difficulty: 'Advanced',
    time: '45 min',
    occasion: 'Photoshoot · Events · Fashion',
    palette: ['#3d2820', '#6d4c41', '#b8896a', '#d4a882', '#f0dcc4'],
    steps: [
      { stepNum: 1, title: 'Flawless Complexion', description: 'Matte, poreless skin as a canvas. No shine allowed — full coverage, fully set.', product: 'Studio Fix Foundation', technique: 'Brush + powder', duration: '5 min' },
      { stepNum: 2, title: 'Graphic Liner Art', description: 'Bold graphic liner — geometric shapes, floating liner, or extended wing for editorial impact.', product: 'Precision Liquid Liner', technique: 'Ruler guide technique', duration: '8 min' },
      { stepNum: 3, title: 'Sculptural Contour', description: 'Extreme face sculpting — shadow and light to redefine bone structure dramatically.', product: 'Procontour Palette', technique: 'Fan + precise brush', duration: '6 min' },
      { stepNum: 4, title: 'Bold Eye Color', description: 'Rich terracotta, burnt sienna, or smoked mahogany lid for editorial depth.', product: 'Artistry Eye Palette', technique: 'Bold wash technique', duration: '6 min' },
      { stepNum: 5, title: 'Skin Texture Highlight', description: 'Blinding highlighter on cheekbones, temples, and bridge of nose for camera-ready glow.', product: 'Strobe Cream Highlighter', technique: 'Fingertip press and pat', duration: '3 min' },
      { stepNum: 6, title: 'Power Lip', description: 'Bold, architectural lip — precise liner, matte finish, no imperfections tolerated.', product: 'Intense Matte Lip', technique: 'Brush application', duration: '4 min' },
    ],
    products: [
      { category: 'Base', name: 'Studio Matte Foundation', shade: 'Sand Storm' },
      { category: 'Liner', name: 'Graphic Liquid Art Liner', shade: 'Jet Black' },
      { category: 'Eye', name: 'Avant-garde Warm Palette', shade: 'Terracotta & Sienna' },
      { category: 'Lip', name: 'Bold Matte Lip', shade: 'Burnt Umber' },
    ],
    tips: ['Reference photos are essential for editorial looks', 'Use tape for sharp geometric lines', 'Shoot immediately — these looks are made for the lens'],
  },
  {
    id: 'festival',
    name: 'Festival Goddess',
    category: 'Festival',
    tagline: 'Radiant, free-spirited and unforgettable',
    icon: '✦',
    difficulty: 'Intermediate',
    time: '30 min',
    occasion: 'Festivals · Concerts · Celebrations',
    palette: ['#d4a882', '#c89060', '#b87840', '#e8c4a0', '#f5e6d4'],
    steps: [
      { stepNum: 1, title: 'Glowing Base', description: 'Sheer, glowy foundation mixed with illuminating drops for sun-kissed radiance.', product: 'Sun Glow Foundation', technique: 'Fingers for warmth', duration: '3 min' },
      { stepNum: 2, title: 'Warm Bronzer Vibes', description: 'Heavy hand on bronzer — temples, cheeks, nose for that outdoor goddess glow.', product: 'Baked Bronzer Palette', technique: 'Swirl-tap-buff', duration: '3 min' },
      { stepNum: 3, title: 'Glitter Eye Look', description: 'Chunky glitter on lid, loose pressed shadow at inner corner for light-catching effect.', product: 'Festival Glitter Kit', technique: 'Wet brush for glitter, pat to adhere', duration: '5 min' },
      { stepNum: 4, title: 'Sun-Kissed Freckles', description: 'Optional: dots of brown eyebrow pencil for faux freckles. Seal with setting spray.', product: 'Brow Pencil + Spray', technique: 'Irregular dot placement', duration: '2 min' },
      { stepNum: 5, title: 'Glossy Lips', description: 'High-shine gloss over nude liner for that effortless, juicy festival lip.', product: 'Ultra Gloss', technique: 'Direct from wand', duration: '1 min' },
      { stepNum: 6, title: 'Body Glow', description: 'Pearl shimmer body oil on collarbones, shoulders, décolletage for goddess radiance.', product: 'Luminous Body Oil', technique: 'Press and sweep', duration: '2 min' },
    ],
    products: [
      { category: 'Base', name: 'Glow Serum Foundation', shade: 'Honey Dew' },
      { category: 'Eye', name: 'Festival Glitter Duo', shade: 'Gold Rush & Rose Gold' },
      { category: 'Bronzer', name: 'Sun Goddess Bronzer', shade: 'Solar Flare' },
      { category: 'Lip', name: 'Plumping Lip Gloss', shade: 'Crystal Clear' },
    ],
    tips: ['Use glitter glue for face glitter that lasts', 'Waterproof everything for outdoor events', 'Face mist throughout the day for refreshed glow'],
  },
  {
    id: 'smoky',
    name: 'Classic Smoky Eye',
    category: 'Dramatic',
    tagline: 'Mysterious depth that commands attention',
    icon: '◑',
    difficulty: 'Intermediate',
    time: '30 min',
    occasion: 'Night Out · Gala · Events',
    palette: ['#2d1f18', '#4a3228', '#6d4c41', '#8d6e63', '#bfa094'],
    steps: [
      { stepNum: 1, title: 'Perfect Base', description: 'Flawless matte base to let the eyes be the star. Full coverage, well-set.', product: 'Matte Perfection Foundation', technique: 'Brush and blend', duration: '4 min' },
      { stepNum: 2, title: 'Eye Primer', description: 'Crease-proof primer across entire eyelid. Blend with fingertip for sticky base.', product: 'Urban Eye Primer', technique: 'Fingertip blend', duration: '1 min' },
      { stepNum: 3, title: 'Dark Shadow Base', description: 'Deep chocolate or espresso all over lid and lower lash line. Build, don\'t start too dark.', product: 'Dark Smoke Palette', technique: 'Flat brush press and blend', duration: '5 min' },
      { stepNum: 4, title: 'Crease Deepening', description: 'Very dark shade in crease and outer V. Blend vigorously — blending is everything.', product: 'Smoky Brown Shade', technique: 'Blending brush in circular motion', duration: '4 min' },
      { stepNum: 5, title: 'Smoked Liner', description: 'Thick kohl liner on upper waterline and smudged on lower lash line.', product: 'Deep Kohl Pencil', technique: 'Smudge with smudge brush immediately', duration: '3 min' },
      { stepNum: 6, title: 'Volumizing Mascara', description: 'Coat upper lashes with volumizing mascara. Add individual lashes at outer corners.', product: 'Supreme Volume Mascara', technique: 'Multiple coats at roots', duration: '3 min' },
    ],
    products: [
      { category: 'Eye', name: 'Deep Smoke Eye Palette', shade: 'Espresso & Dark Brown' },
      { category: 'Liner', name: 'Smoky Kohl Liner', shade: 'Deep Brown Black' },
      { category: 'Mascara', name: 'Volumizing Lash Mascara', shade: 'Blackest Black' },
      { category: 'Lip', name: 'Nude Lip Perfect', shade: 'Bare Skin' },
    ],
    tips: ['Always blend MORE than you think necessary', 'Keep lips nude to balance dramatic eyes', 'Clean lower fall-out before foundation'],
  },
];

const categories = ['All', 'Natural', 'Casual', 'Professional', 'Glamour', 'Bridal', 'Editorial', 'Festival', 'Dramatic'];

export default function MakeupPage({ imageUrl, analysis, onBack }: MakeupPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLook, setSelectedLook] = useState<MakeupLook | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'products' | 'tips'>('steps');

  const filtered = selectedCategory === 'All'
    ? makeupLooks
    : makeupLooks.filter(l => l.category === selectedCategory);

  const difficultyColor = (d: string) => {
    if (d === 'Beginner') return '#6d9e6a';
    if (d === 'Intermediate') return '#b8896a';
    return '#9e6e52';
  };

  if (selectedLook) {
    return (
      <div className="min-h-screen bg-[#fdf8f5]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b border-[#e0c4b0] bg-[#fdf8f5]/90 backdrop-blur-sm">
          <button onClick={() => setSelectedLook(null)} className="flex items-center gap-2 text-[#9e6e52] hover:text-[#b8896a] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm tracking-wider font-light">All Looks</span>
          </button>
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-[#b8896a] uppercase">{selectedLook.category}</p>
            <h3 className="text-lg font-medium text-[#1a1208]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{selectedLook.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full border border-[#e0c4b0] text-[#9e6e52]">{selectedLook.time}</span>
            <span className="text-xs px-3 py-1 rounded-full text-white" style={{ background: difficultyColor(selectedLook.difficulty) }}>
              {selectedLook.difficulty}
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-5">
              {/* Your Photo */}
              <div className="rounded-2xl overflow-hidden border border-[#e0c4b0] relative">
                <img src={imageUrl} alt="Your face" className="w-full object-cover h-52 object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1208]/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-xs tracking-wider opacity-80">Your Canvas</p>
                  <p className="text-white text-sm font-medium">{analysis.faceShape} Face · {analysis.skinTone} Skin</p>
                </div>
              </div>

              {/* Look Info */}
              <div className="p-5 rounded-2xl bg-white/70 border border-[#e0c4b0]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                    style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
                    {selectedLook.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[#1a1208]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{selectedLook.name}</h4>
                    <p className="text-xs text-[#9e6e52] italic">{selectedLook.tagline}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9e6e52] font-light">Occasion</span>
                    <span className="text-[#5c3d2e] text-right">{selectedLook.occasion}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9e6e52] font-light">Time</span>
                    <span className="text-[#5c3d2e]">{selectedLook.time}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9e6e52] font-light">Level</span>
                    <span className="font-medium" style={{ color: difficultyColor(selectedLook.difficulty) }}>{selectedLook.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9e6e52] font-light">Steps</span>
                    <span className="text-[#5c3d2e]">{selectedLook.steps.length} steps</span>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="p-5 rounded-2xl bg-white/70 border border-[#e0c4b0]">
                <h4 className="text-sm font-medium text-[#1a1208] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Color Palette</h4>
                <div className="flex gap-2">
                  {selectedLook.palette.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-10 rounded-lg shadow-inner"
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#9e6e52] mt-2 font-light">Curated for your {analysis.skinTone} skin tone</p>
              </div>

              {/* AI Personalization */}
              <div className="p-5 rounded-2xl text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1a1208, #3d2820)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #cfa98e, transparent)', transform: 'translate(30%, -30%)' }} />
                <span className="text-xs tracking-[0.2em] text-[#cfa98e] uppercase block mb-2">AI Personalized</span>
                <p className="text-xs text-white/75 leading-relaxed font-light">
                  This look is tailored for your <strong className="text-[#cfa98e]">{analysis.faceShape}</strong> face shape with{' '}
                  <strong className="text-[#cfa98e]">{analysis.skinUndertone}</strong> undertones.
                </p>
              </div>
            </div>

            {/* Right: Steps/Products/Tips */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-2xl bg-[#f7ede4] border border-[#e0c4b0] mb-6">
                {(['steps', 'products', 'tips'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-xl text-sm tracking-wider capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? 'bg-white text-[#5c3d2e] shadow-sm font-medium'
                        : 'text-[#9e6e52] font-light hover:text-[#7d5440]'
                    }`}
                  >
                    {tab === 'steps' ? `${selectedLook.steps.length} Steps` : tab === 'products' ? 'Products' : 'Pro Tips'}
                  </button>
                ))}
              </div>

              {/* Steps Tab */}
              {activeTab === 'steps' && (
                <div className="space-y-4 animate-fade-in">
                  {selectedLook.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-medium"
                          style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
                          {step.stepNum}
                        </div>
                        {i < selectedLook.steps.length - 1 && (
                          <div className="w-px flex-1 mt-2 bg-gradient-to-b from-[#b8896a] to-transparent min-h-8" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="p-5 rounded-2xl bg-white/70 border border-[#e0c4b0]">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-base font-medium text-[#1a1208]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {step.title}
                            </h4>
                            <span className="text-xs text-[#9e6e52] bg-[#f7ede4] px-2 py-1 rounded-full ml-2 flex-shrink-0">{step.duration}</span>
                          </div>
                          <p className="text-sm text-[#5c3d2e] font-light leading-relaxed mb-3">{step.description}</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-2 text-xs text-[#7d5440] bg-[#f7ede4] px-3 py-1.5 rounded-full">
                              <span>🪄</span>
                              <span>{step.product}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#7d5440] bg-[#f7ede4] px-3 py-1.5 rounded-full">
                              <span>✦</span>
                              <span>{step.technique}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f7ede4] to-[#fdf8f5] border border-[#e0c4b0] mb-4">
                    <p className="text-xs text-[#7d5440] font-light">
                      ✦ Products curated by AI for your <strong>{analysis.skinTone}</strong> skin tone with <strong>{analysis.skinUndertone}</strong> undertones.
                    </p>
                  </div>
                  {selectedLook.products.map((prod, i) => {
                    const personalizedShade = getPersonalizedShade(prod.category, analysis.skinTone, analysis.skinUndertone);
                    return (
                      <div key={i} className="p-5 rounded-2xl bg-white/80 border border-[#e0c4b0] flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#eeddd0]"
                          style={{ background: selectedLook.palette[i % selectedLook.palette.length] + '40' }}
                        >
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ background: selectedLook.palette[i % selectedLook.palette.length] }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] tracking-[0.25em] text-[#9e6e52] uppercase mb-1 font-light">{prod.category}</p>
                          <h4 className="text-sm font-medium text-[#1a1208] mb-1 leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{prod.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-[#9e6e52] font-light">Your shade:</span>
                            <span className="text-xs text-white font-medium px-2 py-0.5 rounded-full"
                              style={{ background: 'linear-gradient(135deg, #b8896a, #9e6e52)' }}>
                              {personalizedShade}
                            </span>
                          </div>
                        </div>
                        <div
                          className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow-md"
                          style={{ background: selectedLook.palette[i % selectedLook.palette.length] }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tips Tab */}
              {activeTab === 'tips' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-white/70 border border-[#e0c4b0]">
                    <h4 className="text-lg font-medium text-[#1a1208] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      ✦ Professional Tips
                    </h4>
                    {selectedLook.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
                          <span className="text-white text-xs">{i + 1}</span>
                        </div>
                        <p className="text-sm text-[#5c3d2e] font-light leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Confidence Mode */}
                  <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1a1208, #3d2820)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#cfa98e] text-xl">◎</span>
                      <span className="text-xs tracking-[0.2em] text-[#cfa98e] uppercase">AI Confidence Mode™ Tips</span>
                    </div>
                    <div className="space-y-2">
                      {analysis.recommendations.slice(0, 3).map((rec, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[#b8896a] text-xs mt-0.5">→</span>
                          <p className="text-xs text-white/75 font-light leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Face-specific tips */}
                  <div className="p-5 rounded-2xl bg-[#f7ede4] border border-[#e0c4b0]">
                    <h4 className="text-sm font-medium text-[#1a1208] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      For Your {analysis.faceShape} Face Shape
                    </h4>
                    <div className="space-y-2">
                      {[
                        `Contour to ${analysis.faceShape === 'Round' ? 'elongate' : analysis.faceShape === 'Square' ? 'soften angles' : 'balance proportions'}`,
                        `Your ${analysis.eyeShape} eyes suit the liner technique in this look perfectly`,
                        `${analysis.lipShape} lips are ideal for the lip technique recommended`,
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[#b8896a]">✦</span>
                          <p className="text-xs text-[#5c3d2e] font-light leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b border-[#e0c4b0] bg-[#fdf8f5]/90 backdrop-blur-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-[#9e6e52] hover:text-[#b8896a] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm tracking-wider font-light">Analysis</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
            <span className="text-white text-xs font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>M</span>
          </div>
          <span className="text-lg font-light tracking-[0.2em] text-[#3d2820]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            MAKE<span className="font-semibold">ME</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#b8896a] flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <div className="w-12 h-px bg-[#b8896a]" />
          <div className="w-6 h-6 rounded-full bg-[#b8896a] flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <div className="w-12 h-px bg-[#b8896a]" />
          <div className="w-6 h-6 rounded-full bg-[#b8896a] flex items-center justify-center">
            <span className="text-white text-xs">3</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-xs tracking-[0.4em] text-[#b8896a] uppercase mb-3">Step 03</p>
          <h2 className="text-5xl font-light text-[#1a1208] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Your <span style={{ fontStyle: 'italic', color: '#b8896a' }}>Personalized</span> Looks
          </h2>
          <p className="text-[#7d5440] font-light text-sm">
            {makeupLooks.length} looks curated for your {analysis.faceShape} face · {analysis.skinTone} skin · {analysis.skinUndertone} undertones
          </p>
        </div>

        {/* Profile Summary Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-white/70 border border-[#e0c4b0] flex flex-wrap items-center gap-4 animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#e0c4b0]">
              <img src={imageUrl} alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <p className="text-xs text-[#9e6e52] tracking-wider">Your Beauty Profile</p>
              <p className="text-sm font-medium text-[#1a1208]">{analysis.faceShape} · {analysis.skinTone} · {analysis.skinUndertone}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[#e0c4b0]" />
          {[
            { label: 'Symmetry', val: `${analysis.symmetryScore}%` },
            { label: 'Eye', val: analysis.eyeShape },
            { label: 'Lip', val: analysis.lipShape.split('\'')[0] },
            { label: 'Confidence', val: `${analysis.confidenceScore}%` },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-[#9e6e52] tracking-wider">{item.label}</p>
              <p className="text-sm font-medium text-[#5c3d2e]">{item.val}</p>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs tracking-wider"
            style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
            <span>◎</span>
            <span>AI Confidence Mode Active</span>
          </div>
        </div>

        {/* AI Confidence Mode Banner */}
        <div className="mb-8 p-5 rounded-2xl text-white relative overflow-hidden animate-fade-in-up delay-100"
          style={{ background: 'linear-gradient(135deg, #1a1208, #3d2820)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #cfa98e, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #b8896a, transparent)', transform: 'translate(-30%, 30%)' }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #b8896a, #7d5440)' }}>
                <span className="text-white text-xl">◎</span>
              </div>
              <div>
                <p className="text-xs tracking-[0.3em] text-[#cfa98e] uppercase mb-1">AI Confidence Mode™ Active</p>
                <h3 className="text-lg font-light text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Personalized Looks for <span style={{ color: '#cfa98e', fontStyle: 'italic' }}>Your Unique Beauty</span>
                </h3>
              </div>
            </div>
            <div className="sm:ml-auto flex gap-6 flex-wrap">
              {[
                { label: 'Face Shape', val: analysis.faceShape },
                { label: 'Skin Tone', val: analysis.skinTone },
                { label: 'Confidence', val: `${analysis.confidenceScore}%` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-[10px] text-[#cfa98e]/60 tracking-widest uppercase">{item.label}</p>
                  <p className="text-sm text-white font-medium">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up delay-200">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs tracking-wider transition-all duration-200 ${
                selectedCategory === cat
                  ? 'text-white shadow-md'
                  : 'border border-[#e0c4b0] text-[#9e6e52] bg-white/60 hover:border-[#b8896a]'
              }`}
              style={selectedCategory === cat ? { background: 'linear-gradient(135deg, #b8896a, #7d5440)' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Makeup Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in-up delay-300">
          {filtered.map((look) => (
            <div
              key={look.id}
              className="makeup-card cursor-pointer rounded-3xl overflow-hidden bg-white/70 border border-[#e0c4b0]"
              onClick={() => setSelectedLook(look)}
            >
              {/* Card Header */}
              <div className="relative h-36 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${look.palette[0]}, ${look.palette[2]}, ${look.palette[4]})` }}>
                <span className="text-5xl opacity-80">{look.icon}</span>
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-white text-[10px] tracking-wider bg-black/20 backdrop-blur-sm">
                  {look.category}
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-[10px]"
                  style={{ background: difficultyColor(look.difficulty) }}>
                  {look.difficulty}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <h3 className="text-lg font-medium text-[#1a1208] mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {look.name}
                </h3>
                <p className="text-xs text-[#9e6e52] italic mb-3 font-light">{look.tagline}</p>

                {/* Palette */}
                <div className="flex gap-1.5 mb-3">
                  {look.palette.map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full shadow-sm" style={{ background: c }} />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#9e6e52]">
                  <span>⏱ {look.time}</span>
                  <span>{look.steps.length} steps</span>
                </div>

                <div className="mt-3 text-[10px] text-[#cfa98e] tracking-wider truncate">{look.occasion}</div>

                <button className="mt-4 w-full py-2.5 rounded-xl text-xs tracking-widest text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #b8896a, #9e6e52)' }}>
                  Explore Look →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
