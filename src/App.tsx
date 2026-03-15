import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { io } from "socket.io-client";
import { HashRouter, Routes, Route, useNavigate, useParams, Navigate, useLocation, useMatch } from 'react-router-dom';
import { 
  Gift as GiftIcon, 
  MessageCircle, 
  Users, 
  CheckCircle2, 
  ShoppingBag, 
  Heart, 
  Share2,
  Plus,
  ArrowRight,
  Sparkles,
  Settings,
  Globe,
  Coins,
  X,
  Wand2,
  Loader2,
  Bell,
  Link as LinkIcon,
  CreditCard,
  ExternalLink,
  Wallet,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Mic,
  EyeOff,
  Eye,
  PartyPopper,
  User,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Gift, Comment, Wishlist, GiftStatus, PaymentInfo, Contribution, PaymentMethod } from './types';
import { formatCurrency, currencies, getLocalCurrency } from './utils/formatters';
import { auth, googleProvider, appleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';

// --- Mock Data ---
const CURRENT_USER_ID = 'u1';
const CURRENT_USER_NAME = 'Daniel G.';

// --- Socket Initialization ---
const socket = io();

const MOCK_WISHLISTS: Wishlist[] = [
  {
    id: 'w1',
    title: 'Mi Primer Hogar',
    creator: 'Daniel G.',
    ownerId: 'u1',
    description: '¡Hola amigos! Estoy muy emocionado por mi nueva etapa. Aquí les dejo algunas cositas que me ayudarían un montón a armar mi nido. ¡Gracias por ser parte! ✨',
    vibe: 'Mudanza 2026',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop',
    participantCount: 12,
    isFavorite: true,
    magicCode: 'DJINN-2026',
    paymentInfo: {
      methods: [
        { id: 'pm1', type: 'paypal', label: 'PayPal', details: 'https://paypal.me/danielgandolfo' },
        { id: 'pm2', type: 'bank', label: 'Santander Uruguay', details: 'CBU: 0000000000000000000000\nAlias: daniel.djinn.uy' }
      ]
    },
    gifts: [
      {
        id: '1',
        title: 'Cafetera Espresso Pro',
        description: 'Para mis mañanas en el nuevo depto. ¡El café es vida!',
        price: 150,
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Mood: Primer Café',
        isGroupGift: true,
        contributions: 45,
        targetAmount: 150,
        suggestedStore: {
          name: 'Mercado Libre',
          logo: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small.png',
          affiliateUrl: 'https://www.mercadolibre.com.ar'
        },
        comments: [
          { id: 'c1', user: 'Santi', text: '¡Yo pongo para el café!', timestamp: 'Hace 2h' },
          { id: 'c2', user: 'Maca', text: 'Te va a encantar esta marca.', timestamp: 'Hace 1h' }
        ]
      },
      {
        id: '2',
        title: 'Juego de Sábanas 600 Hilos',
        description: 'Color coral para que combine con mi energía.',
        price: 80,
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop',
        status: 'reserved',
        reservedBy: 'Mamá',
        category: 'Mood: Sueños Felices',
        isGroupGift: false,
        contributions: 0,
        targetAmount: 80,
        comments: []
      }
    ]
  },
  {
    id: 'w2',
    title: 'Baby Shower: Lucas',
    creator: 'Maca & Santi',
    ownerId: 'u2',
    description: '¡Esperamos a Lucas con todo el amor del mundo! Preparamos esta lista con lo que nos falta para su llegada.',
    vibe: 'Baby Shower',
    coverImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop',
    participantCount: 24,
    isFavorite: false,
    magicCode: 'LUCAS-26',
    gifts: [
      {
        id: 'b1',
        title: 'Cuna Colecho',
        description: 'Para dormir cerquita de Lucas los primeros meses.',
        price: 250,
        imageUrl: 'https://images.unsplash.com/photo-1544126592-807daa2b565b?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Mood: Sueño Seguro',
        isGroupGift: true,
        contributions: 120,
        targetAmount: 250,
        comments: []
      },
      {
        id: 'b2',
        title: 'Silla de Comer',
        description: 'Para cuando empiece con las papillas.',
        price: 150,
        imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Alimentación',
        isGroupGift: true,
        contributions: 50,
        targetAmount: 150,
        comments: [],
        isSurprise: true,
        revealed: false,
        addedBy: 'Tía Marta',
        contributionHistory: [
          {
            id: 'c1',
            userName: 'Tía Marta',
            amount: 50,
            timestamp: '2026-07-15T10:00:00Z',
            voiceMessageUrl: 'mock-url'
          }
        ]
      }
    ]
  },
  {
    id: 'w3',
    title: 'Boda: Ana & Luis',
    creator: 'Ana & Luis',
    ownerId: 'u3',
    description: '¡Nos casamos! Queremos que nuestra casa sea un reflejo de nuestro amor. Gracias por acompañarnos.',
    vibe: 'Boda Real',
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop',
    participantCount: 85,
    isFavorite: true,
    magicCode: 'BODA-AL',
    gifts: [
      {
        id: 'w3g1',
        title: 'Vajilla de Porcelana',
        description: 'Juego completo para 12 personas.',
        price: 300,
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Hogar',
        isGroupGift: true,
        contributions: 150,
        targetAmount: 300,
        comments: []
      },
      {
        id: 'w3g2',
        title: 'Smart TV 55"',
        description: 'Para nuestras noches de cine.',
        price: 500,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Tecnología',
        isGroupGift: true,
        contributions: 0,
        targetAmount: 500,
        comments: []
      }
    ]
  },
  {
    id: 'w4',
    title: 'Cumpleaños: Sofi',
    creator: 'Sofi R.',
    ownerId: 'u4',
    description: '¡Festejo mis 30! Aquí algunas ideas para los que quieran regalarme algo.',
    vibe: 'Party Time',
    coverImage: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1000&auto=format&fit=crop',
    participantCount: 42,
    isFavorite: false,
    magicCode: 'SOFI-30',
    gifts: [
      {
        id: 'w4g1',
        title: 'Cámara Instax Mini',
        description: 'Para capturar los momentos de la fiesta.',
        price: 90,
        imageUrl: 'https://images.unsplash.com/photo-1526170315870-ef68971ef022?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Tecnología',
        isGroupGift: false,
        contributions: 0,
        targetAmount: 90,
        comments: []
      }
    ]
  },
  {
    id: 'w5',
    title: 'Viaje a Japón',
    creator: 'Daniel G.',
    ownerId: 'u1',
    description: 'Mi gran sueño es conocer Japón. Cualquier ayuda para este viaje es bienvenida.',
    vibe: 'Aventura',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop',
    participantCount: 8,
    isFavorite: false,
    magicCode: 'JAPON-27',
    gifts: [
      {
        id: 'w5g1',
        title: 'Fondo para el Vuelo',
        description: 'Ayúdame a llegar al país del sol naciente.',
        price: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800&auto=format&fit=crop',
        status: 'available',
        category: 'Viajes',
        isGroupGift: true,
        contributions: 450,
        targetAmount: 1200,
        comments: []
      }
    ]
  }
];

// --- Components ---

interface GiftCardProps {
  gift: Gift;
  onClick: () => void;
  onContribute: (e: React.MouseEvent) => void;
  key?: React.Key;
}

const GiftCard = ({ gift, onClick, onContribute, secretMode, currency, isOwner }: GiftCardProps & { secretMode: boolean, currency: string, isOwner: boolean }) => {
  const { t } = useTranslation();
  const progress = (gift.contributions / gift.targetAmount) * 100;
  const isReserved = gift.status === 'reserved';
  const isCompleted = gift.status === 'completed';
  const showReserved = isReserved && (!isOwner || !secretMode);
  const isSurprise = gift.isSurprise && !gift.revealed;
  const hideDetails = isSurprise && isOwner;

  // Determine display name for reservation
  let displayReservedBy = gift.reservedBy;
  if (gift.reservedBySecret && !isOwner) {
    displayReservedBy = t('secret_genie');
  }
  if (isOwner && secretMode && isReserved) {
    displayReservedBy = null; // Hide from owner if secretMode is ON
  }

  return (
    <motion.div 
      layoutId={`gift-${gift.id}`}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-slate-100"
      whileHover={{ y: -8 }}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        {isSurprise ? (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <EyeOff size={40} className="text-jinn-neon" />
            </div>
            <p className="font-display text-lg font-black uppercase tracking-tighter">Regalo Sorpresa</p>
            <p className="text-[10px] text-white/40 uppercase font-bold mt-2">Shhh... ¡Es un secreto!</p>
          </div>
        ) : (
          <>
            <img 
              src={gift.imageUrl} 
              alt={gift.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            {gift.suggestedStore && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1 bg-jinn-dark/80 backdrop-blur-md text-white rounded-full border border-white/10">
                  <Sparkles size={10} className="text-jinn-neon" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Sugerido</span>
                </div>
              </div>
            )}
          </>
        )}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-jinn-dark shadow-sm">
            {hideDetails ? '???' : gift.category}
          </span>
        </div>
        {showReserved && (
          <div className="absolute inset-0 bg-jinn-dark/40 backdrop-blur-[2px] flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-jinn-neon text-jinn-dark px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 size={18} />
              {t('reserved')} {displayReservedBy ? `por ${displayReservedBy}` : ''}
            </motion.div>
          </div>
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg"
            >
              <Heart size={18} fill="currentColor" />
              ¡Recibido!
            </motion.div>
          </div>
        )}
        {isReserved && isOwner && secretMode && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 rounded-full bg-jinn-dark/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-xl font-bold text-slate-800 leading-tight">
            {hideDetails ? 'Deseo Misterioso' : gift.title}
          </h3>
          <span className="font-display font-bold text-jinn-violet">{formatCurrency(gift.price, currency)}</span>
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
          {hideDetails ? 'Este regalo fue añadido por un amigo y se revelará pronto.' : gift.description}
        </p>

        {(gift.isGroupGift || gift.contributions > 0) && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>{gift.isGroupGift ? t('group_gifts') : 'Contribuciones'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-jinn-violet to-jinn-coral"
              />
            </div>
          </div>
        )}

        {!isCompleted && !showReserved && (
          <div className="mt-4 flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onContribute(e);
              }}
              className="flex-1 py-3 bg-jinn-violet/10 text-jinn-violet rounded-2xl font-bold text-xs hover:bg-jinn-violet hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Coins size={14} />
              Contribuir
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick(); // Open modal to reserve
              }}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              Reservar
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${gift.id}${i}`} alt="user" referrerPolicy="no-referrer" />
              </div>
            ))}
            {gift.comments.length > 0 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-jinn-neon flex items-center justify-center text-[10px] font-bold">
                +{gift.comments.length}
              </div>
            )}
          </div>
          <button className="text-jinn-violet hover:text-jinn-coral transition-colors">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: '50%', 
            left: '50%', 
            scale: 0,
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`, 
            scale: [0, 1.5, 0],
            rotate: 360,
            opacity: [1, 1, 0] 
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: Math.random() * 0.2
          }}
          className={`absolute w-3 h-3 rounded-sm ${
            ['bg-jinn-violet', 'bg-jinn-coral', 'bg-jinn-neon', 'bg-yellow-400'][Math.floor(Math.random() * 4)]
          }`}
        />
      ))}
    </div>
  );
};

const GiftModal = ({ gift, onClose, secretMode, currency, isOwner, onMarkAsReceived, wishlistId, onContribute }: { gift: Gift, onClose: () => void, secretMode: boolean, currency: string, isOwner: boolean, onMarkAsReceived: (id: string) => void, wishlistId: string, onContribute: () => void }) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [isSecretReservation, setIsSecretReservation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const progress = (gift.contributions / gift.targetAmount) * 100;
  const isReserved = gift.status === 'reserved';
  const isCompleted = gift.status === 'completed';
  const hideReservedInfo = isReserved && isOwner && secretMode;
  const isSurprise = gift.isSurprise && !gift.revealed;
  const hideDetails = isSurprise && isOwner;

  // Determine display name for reservation
  let displayReservedBy = gift.reservedBy;
  if (gift.reservedBySecret && !isOwner) {
    displayReservedBy = t('secret_genie');
  }

  const handleAction = () => {
    setShowConfetti(true);
    // Emit reservation event
    socket.emit('gift_reserved', {
      wishlistId,
      giftId: gift.id,
      userName: CURRENT_USER_NAME,
      giftTitle: gift.title,
      isSecret: isSecretReservation
    });
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleReceived = () => {
    onMarkAsReceived(gift.id);
    // Emit received event
    socket.emit('gift_received', {
      wishlistId,
      giftId: gift.id,
      giftTitle: gift.title
    });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      wishlistId,
      giftId: gift.id,
      user: CURRENT_USER_NAME,
      text: comment,
      timestamp: 'Ahora'
    };

    socket.emit('new_message', newComment);
    setComment('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        layoutId={`gift-${gift.id}`}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        <div className="w-full md:w-1/2 relative bg-slate-100">
          {isSurprise ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-12 text-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-6"
              >
                <EyeOff size={64} className="text-jinn-neon" />
              </motion.div>
              <h3 className="font-display text-2xl font-black uppercase tracking-tighter mb-2">Deseo Misterioso</h3>
              <p className="text-white/40 text-sm uppercase font-bold">Shhh... ¡Es un secreto!</p>
            </div>
          ) : (
            <img 
              src={gift.imageUrl} 
              alt={gift.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-12 overflow-y-auto flex flex-col relative">
          {showConfetti && <Confetti />}
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-jinn-neon/30 text-jinn-dark text-xs font-bold uppercase tracking-widest mb-4">
              {hideDetails ? '???' : gift.category}
            </span>
            <h2 className="font-display text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              {hideDetails ? '¡Un regalo sorpresa!' : gift.title}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              {hideDetails ? 'Este deseo fue añadido por uno de tus genios. Se revelará cuando se complete o cuando decidas descubrirlo.' : gift.description}
            </p>
          </div>

          <div className="flex items-center justify-between mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('total_price')}</p>
              <p className="font-display text-3xl font-black text-jinn-violet">{formatCurrency(gift.price, currency)}</p>
            </div>
            {gift.isGroupGift && (
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('raised')}</p>
                <p className="font-display text-3xl font-black text-jinn-coral">{formatCurrency(gift.contributions, currency)}</p>
              </div>
            )}
          </div>

          {gift.suggestedStore && (
            <div className="mb-8 p-6 rounded-3xl bg-jinn-neon/10 border border-jinn-neon/30 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
                  <img src={gift.suggestedStore.logo} alt={gift.suggestedStore.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-jinn-dark/40 uppercase tracking-widest">Tienda Sugerida</p>
                  <p className="font-bold text-slate-800">{gift.suggestedStore.name}</p>
                </div>
              </div>
              <a 
                href={gift.suggestedStore.affiliateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-jinn-dark text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-jinn-violet transition-all"
              >
                Ver en Tienda
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {(gift.isGroupGift || gift.contributions > 0) && (
            <div className="mb-10 space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-slate-700">Progreso del Regalo</p>
                <p className="text-2xl font-black text-jinn-violet">{Math.round(progress)}%</p>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-jinn-violet via-jinn-coral to-jinn-neon rounded-full"
                />
              </div>
              <p className="text-xs text-slate-400 italic text-center">
                ¡Faltan solo {formatCurrency(gift.targetAmount - gift.contributions, currency)} para completar este deseo!
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {!hideReservedInfo && gift.status === 'available' && (
              <>
                <button 
                  onClick={() => {
                    onClose();
                    onContribute();
                  }}
                  className="flex-1 bubbly-button bg-jinn-violet/10 text-jinn-violet py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-jinn-violet/20 hover:bg-jinn-violet hover:text-white transition-all"
                >
                  <Coins size={20} />
                  Contribuir
                </button>
                <button 
                  onClick={handleAction}
                  className="flex-1 bubbly-button bg-jinn-violet text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-jinn-violet/20"
                >
                  <ShoppingBag size={20} />
                  Reservar Total
                </button>
              </>
            )}
            {!hideReservedInfo && gift.status === 'available' && (
              <div className="w-full flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="secret-reservation" 
                  checked={isSecretReservation}
                  onChange={(e) => setIsSecretReservation(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-200 text-jinn-violet focus:ring-jinn-violet"
                />
                <label htmlFor="secret-reservation" className="text-xs font-bold text-slate-500 cursor-pointer">
                  {t('be_secret_genie')}
                </label>
              </div>
            )}
            {isReserved && !hideReservedInfo && (
              <div className="flex flex-col flex-1 gap-3">
                <div className="bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} />
                  {t('reserved')} {displayReservedBy ? `por ${displayReservedBy}` : ''}
                </div>
                {isOwner && (
                  <button 
                    onClick={handleReceived}
                    className="w-full bubbly-button bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={20} />
                    ¡Ya lo recibí!
                  </button>
                )}
              </div>
            )}
            {isCompleted && (
              <div className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-100">
                <Heart size={20} fill="currentColor" />
                ¡Deseo Cumplido! {displayReservedBy ? `(Gracias, ${displayReservedBy})` : ''}
              </div>
            )}
            {isSurprise && isOwner && (
              <button 
                onClick={handleReceived}
                className="flex-1 bubbly-button bg-jinn-violet text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-jinn-violet/20"
              >
                <Eye size={20} />
                Descubrir Sorpresa
              </button>
            )}
            {hideReservedInfo && (
              <div className="flex flex-col flex-1 gap-3">
                <div className="flex-1 bg-jinn-violet/10 text-jinn-violet py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-jinn-violet/20">
                  <Sparkles size={20} />
                  ¡Es una sorpresa!
                </div>
                <button 
                  onClick={handleReceived}
                  className="w-full bubbly-button bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 size={20} />
                  ¡Ya lo recibí! (Revelar)
                </button>
              </div>
            )}
            <button className="w-14 h-14 bubbly-button border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-jinn-coral hover:border-jinn-coral/20">
              <Heart size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-[300px]">
            {gift.contributionHistory && gift.contributionHistory.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <Heart size={20} className="text-jinn-coral" />
                  <h3 className="font-display text-xl font-bold text-slate-800">Aportes de los Genios</h3>
                </div>
                <div className="space-y-4">
                  {gift.contributionHistory.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-jinn-coral/10 flex items-center justify-center text-jinn-coral">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {(c.isSecret && !isOwner) ? t('secret_genie') : c.userName}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{formatCurrency(c.amount, currency)}</p>
                        </div>
                      </div>
                      {c.voiceMessageUrl && (
                        <button className="w-10 h-10 rounded-full bg-jinn-violet text-white flex items-center justify-center shadow-lg shadow-jinn-violet/20 hover:scale-110 transition-transform">
                          <Play size={16} fill="currentColor" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <MessageCircle size={20} className="text-jinn-violet" />
              <h3 className="font-display text-xl font-bold text-slate-800">{t('accomplice_wall')}</h3>
            </div>

            <div className="flex-1 space-y-6 mb-8">
              {gift.comments.length > 0 ? (
                gift.comments.map((c) => (
                  <div key={c.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img src={`https://i.pravatar.cc/100?u=${c.user}`} alt={c.user} referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-800">{c.user}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                  <Sparkles size={40} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">{t('be_first_comment')}</p>
                </div>
              )}
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder={t('write_message')}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-jinn-violet/20 transition-all"
              />
              <button 
                onClick={handleSendComment}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-jinn-violet text-white rounded-xl flex items-center justify-center shadow-md hover:bg-jinn-coral transition-colors"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Logo = ({ className = "", size = "auto", animated = false }: { className?: string, size?: string | number, animated?: boolean }) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0, strokeOpacity: 1 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      strokeOpacity: [1, 1, 0], // Stay visible while drawing, then fade out
      transition: { 
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 },
        strokeOpacity: { delay: 1.5, duration: 0.5 }
      }
    }
  };

  const fillVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { delay: 1.2, duration: 0.8 }
    }
  };

  return (
    <svg 
      id="Capa_1" 
      data-name="Capa 1" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 48.59 26.36"
      className={className}
      style={{ height: size, width: 'auto' }}
    >
      <motion.g
        initial={animated ? "hidden" : "visible"}
        animate="visible"
        transition={{ staggerChildren: 0.2 }} // Faster stagger
      >
        {/* Drawing strokes */}
        <g fill="none" stroke="currentColor" strokeWidth="0.4">
          <motion.path variants={pathVariants} d="M5.33,21.46c-.96,0-1.85-.16-2.66-.48s-1.46-.81-1.94-1.47c-.48-.66-.72-1.48-.72-2.49s.28-2.14.84-3.46h.42c-.09.49-.14.93-.14,1.33,0,.82.17,1.5.51,2.02s.8.92,1.38,1.19,1.24.43,1.97.46v-9.04l-.35-1.05c1.06-.5,2.11-1,3.15-1.5-.79-.36-1.49-.68-2.12-.98-.69-.35-1.17-.82-1.42-1.41s-.38-1.23-.38-1.91.11-1.6.34-2.68l.18.11c.05.62.41,1.24,1.07,1.86.67.62,1.48,1.21,2.42,1.78s1.86,1.09,2.75,1.56l1.12.62c1.26.71,2.19,1.56,2.79,2.54.59.98.89,2.11.89,3.39,0,.41-.03.84-.08,1.28-.27,1.81-.94,3.33-2,4.56-1.06,1.23-2.32,2.17-3.77,2.8-1.46.64-2.88.96-4.26.96ZM5.47,18.59c1.06,0,2.17-.19,3.32-.58,1.16-.38,2.2-.9,3.13-1.55.93-.65,1.58-1.27,1.96-1.86.38-.59.57-1.26.58-2.01v-.16c0-.84-.29-1.57-.86-2.19-.58-.62-1.42-1.19-2.54-1.73l-3.08-1.45v10.21l-2.73,1.31h.21Z" />
          <motion.path variants={pathVariants} d="M13.73,26.36v-.22c.73-.3,1.3-.67,1.72-1.11.42-.44.72-.93.91-1.48.19-.55.31-1.15.37-1.79.05-.65.08-1.32.08-2.02v-8.16l-.35-1.05,3.34-1.59v10.95c0,1.9-.53,3.42-1.59,4.57-1.06,1.14-2.55,1.78-4.48,1.92ZM17.32,8.18l-1.6-2.15,2.36-2.32,1.6,2.15-2.36,2.32Z" />
          <motion.path variants={pathVariants} d="M22.61,8.18l-1.6-2.15,2.36-2.32,1.6,2.15-2.36,2.32ZM23.21,21.08c-.51,0-.93-.2-1.28-.61-.35-.41-.52-.98-.52-1.72v-7.18s-.34-1.05-.34-1.05l3.33-1.59v8.44c0,.46.1.79.3,1,.2.21.45.31.74.31.37,0,.75-.14,1.15-.44l.14.2-1.28,1.41c-.38.42-.76.73-1.14.93-.39.2-.76.3-1.1.3Z" />
          <motion.path variants={pathVariants} d="M34.13,21.2c-.51,0-.93-.17-1.27-.52-.34-.35-.51-.88-.51-1.59v-7.03c0-.41-.07-.72-.2-.92-.14-.2-.31-.3-.51-.3-.34,0-.7.25-1.08.75-.28.38-.6.91-.97,1.6v7.74l-2.99.04v-9.41l-.34-1.05,3.33-1.59v2.92l.38-.66c.21-.38.4-.71.58-.98.32-.45.7-.79,1.15-1.02.44-.23.89-.34,1.34-.34.54,0,.98.12,1.32.37.67.48,1,1.26,1,2.35v5.94c0,.79.34,1.18,1.03,1.18.37,0,.75-.14,1.15-.44l.14.2-1.28,1.41c-.81.91-1.55,1.36-2.25,1.36Z" />
          <motion.path variants={pathVariants} d="M45.06,21.2c-.51,0-.93-.17-1.27-.52-.34-.35-.51-.88-.51-1.59v-7.03c0-.41-.07-.72-.2-.92-.14-.2-.31-.3-.51-.3-.34,0-.7.25-1.08.75-.28.38-.6.91-.97,1.6v7.74l-2.99.04v-9.41l-.34-1.05,3.33-1.59v2.92l.38-.66c.21-.38.4-.71.58-.98.32-.45.7-.79,1.15-1.02.44-.23.89-.34,1.34-.34.54,0,.98.12,1.32.37.67.48,1,1.26,1,2.35v5.94c0,.79.34,1.18,1.03,1.18.37,0,.75-.14,1.15-.44l.14.2-1.28,1.41c-.81.91-1.56,1.36-2.25,1.36Z" />
          <motion.path variants={pathVariants} d="M34.74,24.92c-.67,0-1.34-.04-2-.12s-1.31-.17-1.91-.26-1.19-.17-1.75-.23-1.1-.1-1.63-.1c-1.17,0-2.13.22-2.9.67l-.29-.22c1-.87,2.04-1.47,3.1-1.79s2.14-.48,3.24-.47c.67,0,1.33.04,1.99.11s1.29.16,1.91.25,1.21.17,1.77.24,1.1.1,1.63.1c1.17,0,2.13-.22,2.9-.67l.29.22c-1,.87-2.04,1.47-3.12,1.79-1.07.32-2.15.48-3.22.47Z" />
        </g>

        {/* Fills */}
        <g fill="currentColor">
          <motion.path variants={fillVariants} d="M5.33,21.46c-.96,0-1.85-.16-2.66-.48s-1.46-.81-1.94-1.47c-.48-.66-.72-1.48-.72-2.49s.28-2.14.84-3.46h.42c-.09.49-.14.93-.14,1.33,0,.82.17,1.5.51,2.02s.8.92,1.38,1.19,1.24.43,1.97.46v-9.04l-.35-1.05c1.06-.5,2.11-1,3.15-1.5-.79-.36-1.49-.68-2.12-.98-.69-.35-1.17-.82-1.42-1.41s-.38-1.23-.38-1.91.11-1.6.34-2.68l.18.11c.05.62.41,1.24,1.07,1.86.67.62,1.48,1.21,2.42,1.78s1.86,1.09,2.75,1.56l1.12.62c1.26.71,2.19,1.56,2.79,2.54.59.98.89,2.11.89,3.39,0,.41-.03.84-.08,1.28-.27,1.81-.94,3.33-2,4.56-1.06,1.23-2.32,2.17-3.77,2.8-1.46.64-2.88.96-4.26.96ZM5.47,18.59c1.06,0,2.17-.19,3.32-.58,1.16-.38,2.2-.9,3.13-1.55.93-.65,1.58-1.27,1.96-1.86.38-.59.57-1.26.58-2.01v-.16c0-.84-.29-1.57-.86-2.19-.58-.62-1.42-1.19-2.54-1.73l-3.08-1.45v10.21l-2.73,1.31h.21Z" />
          <motion.path variants={fillVariants} d="M13.73,26.36v-.22c.73-.3,1.3-.67,1.72-1.11.42-.44.72-.93.91-1.48.19-.55.31-1.15.37-1.79.05-.65.08-1.32.08-2.02v-8.16l-.35-1.05,3.34-1.59v10.95c0,1.9-.53,3.42-1.59,4.57-1.06,1.14-2.55,1.78-4.48,1.92ZM17.32,8.18l-1.6-2.15,2.36-2.32,1.6,2.15-2.36,2.32Z" />
          <motion.path variants={fillVariants} d="M22.61,8.18l-1.6-2.15,2.36-2.32,1.6,2.15-2.36,2.32ZM23.21,21.08c-.51,0-.93-.2-1.28-.61-.35-.41-.52-.98-.52-1.72v-7.18s-.34-1.05-.34-1.05l3.33-1.59v8.44c0,.46.1.79.3,1,.2.21.45.31.74.31.37,0,.75-.14,1.15-.44l.14.2-1.28,1.41c-.38.42-.76.73-1.14.93-.39.2-.76.3-1.1.3Z" />
          <motion.path variants={fillVariants} d="M34.13,21.2c-.51,0-.93-.17-1.27-.52-.34-.35-.51-.88-.51-1.59v-7.03c0-.41-.07-.72-.2-.92-.14-.2-.31-.3-.51-.3-.34,0-.7.25-1.08.75-.28.38-.6.91-.97,1.6v7.74l-2.99.04v-9.41l-.34-1.05,3.33-1.59v2.92l.38-.66c.21-.38.4-.71.58-.98.32-.45.7-.79,1.15-1.02.44-.23.89-.34,1.34-.34.54,0,.98.12,1.32.37.67.48,1,1.26,1,2.35v5.94c0,.79.34,1.18,1.03,1.18.37,0,.75-.14,1.15-.44l.14.2-1.28,1.41c-.81.91-1.55,1.36-2.25,1.36Z" />
          <motion.path variants={fillVariants} d="M45.06,21.2c-.51,0-.93-.17-1.27-.52-.34-.35-.51-.88-.51-1.59v-7.03c0-.41-.07-.72-.2-.92-.14-.2-.31-.3-.51-.3-.34,0-.7.25-1.08.75-.28.38-.6.91-.97,1.6v7.74l-2.99.04v-9.41l-.34-1.05,3.33-1.59v2.92l.38-.66c.21-.38.4-.71.58-.98.32-.45.7-.79,1.15-1.02.44-.23.89-.34,1.34-.34.54,0,.98.12,1.32.37.67.48,1,1.26,1,2.35v5.94c0,.79.34,1.18,1.03,1.18.37,0,.75-.14,1.15-.44l.14.2-1.28,1.41c-.81.91-1.56,1.36-2.25,1.36Z" />
          <motion.path variants={fillVariants} d="M34.74,24.92c-.67,0-1.34-.04-2-.12s-1.31-.17-1.91-.26-1.19-.17-1.75-.23-1.1-.1-1.63-.1c-1.17,0-2.13.22-2.9.67l-.29-.22c1-.87,2.04-1.47,3.1-1.79s2.14-.48,3.24-.47c.67,0,1.33.04,1.99.11s1.29.16,1.91.25,1.21.17,1.77.24,1.1.1,1.63.1c1.17,0,2.13-.22,2.9-.67l.29.22c-1,.87-2.04,1.47-3.12,1.79-1.07.32-2.15.48-3.22.47Z" />
        </g>
      </motion.g>
    </svg>
  );
};

const LoginView = ({ onLogin, onShowPrivacy, onShowTerms }: { onLogin: (provider: 'google' | 'apple') => void, onShowPrivacy: () => void, onShowTerms: () => void }) => {
  return (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Living Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-jinn-violet/30 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-jinn-coral/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-jinn-violet/10 to-transparent"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <Logo className="text-white mb-16 mx-auto" size="clamp(150px, 40vw, 240px)" animated={true} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="space-y-12"
        >
          <p className="text-white/70 text-lg font-medium leading-relaxed tracking-wide">
            Tus deseos, concedidos por quienes más te quieren. <br/>
            <span className="text-white font-light opacity-50 italic">La magia empieza aquí.</span>
          </p>

          <div className="space-y-4 px-8">
            <motion.button 
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLogin('google')}
              className="w-full bg-white/5 backdrop-blur-md text-white py-4 rounded-full font-medium text-sm flex items-center justify-center gap-3 border border-white/10 transition-all"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-70" alt="Google" />
              Continuar con Google
            </motion.button>

            <motion.button 
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLogin('apple')}
              className="w-full bg-white/5 backdrop-blur-md text-white py-4 rounded-full font-medium text-sm flex items-center justify-center gap-3 border border-white/10 transition-all"
            >
              <svg className="w-4 h-4 fill-white/70" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.96.95-2.04 1.72-3.24 1.72-1.16 0-1.56-.73-2.95-.73-1.4 0-1.85.71-2.95.71-1.16 0-2.18-.73-3.21-1.75-2.1-2.08-3.69-5.88-3.69-9.2 0-3.3 2.06-5.05 4.02-5.05 1.03 0 2.01.71 2.64.71.62 0 1.76-.78 2.96-.78 1.24 0 2.34.64 3.09 1.71-2.52 1.51-2.12 5.09.43 6.13-.93 2.27-2.14 4.54-3.1 5.54zM12.03 5.07c0-2.31 1.91-4.18 4.22-4.18.03 0 .06 0 .09.01-.03 2.31-1.92 4.18-4.22 4.18-.03 0-.06 0-.09-.01z" />
              </svg>
              Continuar con Apple
            </motion.button>
          </div>

          <div className="space-y-2">
            <p className="text-white/30 text-[11px] font-medium leading-relaxed">
              Al continuar, aceptas nuestros <br/>
              <button onClick={onShowTerms} className="text-white/50 hover:text-jinn-violet underline underline-offset-4">Términos de Servicio</button> y <button onClick={onShowPrivacy} className="text-white/50 hover:text-jinn-violet underline underline-offset-4">Privacidad</button>
            </p>
            <p className="text-white/10 text-[9px] font-medium tracking-widest uppercase pt-4">
              Djinn 2026
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const WishlistCard = ({ wishlist, onClick, onToggleFavorite }: { wishlist: Wishlist, onClick: () => void, onToggleFavorite: (e: React.MouseEvent) => void }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative flex-shrink-0 w-[300px] h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <img 
        src={wishlist.coverImage} 
        alt={wishlist.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-jinn-dark/90 via-jinn-dark/20 to-transparent" />
      
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={onToggleFavorite}
          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
            wishlist.isFavorite ? 'bg-jinn-coral text-white' : 'bg-white/20 text-white hover:bg-white/40'
          }`}
        >
          <Heart size={20} fill={wishlist.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-jinn-neon text-jinn-dark text-[10px] font-black uppercase tracking-widest">
            {wishlist.vibe}
          </span>
        </div>
        <h2 className="font-display text-2xl font-black text-white mb-2 leading-tight">
          {wishlist.title}
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-xs font-bold">
            {wishlist.gifts.length} deseos • {wishlist.participantCount} genios
          </p>
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-jinn-violet transition-colors">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistSection = ({ title, wishlists, onOpen, onToggleFavorite, onAdd }: { title: string, wishlists: Wishlist[], onOpen: (id: string) => void, onToggleFavorite: (id: string) => void, onAdd?: () => void }) => {
  if (wishlists.length === 0 && !onAdd) return null;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-black text-slate-900 px-2">{title}</h2>
      <div className="flex gap-6 overflow-x-auto pb-8 px-2 scrollbar-hide snap-x">
        {onAdd && (
          <div className="snap-start">
            <motion.div
              whileHover={{ y: -8 }}
              onClick={onAdd}
              className="group relative flex-shrink-0 w-[300px] h-[400px] rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-jinn-violet/30 hover:bg-jinn-violet/5 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-full bg-jinn-violet/10 flex items-center justify-center text-jinn-violet group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <span className="font-display text-xl font-black text-slate-400 group-hover:text-jinn-violet transition-colors">Nueva Lista</span>
            </motion.div>
          </div>
        )}
        {wishlists.map((wishlist) => (
          <div key={wishlist.id} className="snap-start">
            <WishlistCard 
              wishlist={wishlist} 
              onClick={() => onOpen(wishlist.id)} 
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(wishlist.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const HelpModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: <Wand2 size={24} />,
      title: "1. Pide un Deseo",
      desc: "Crea tu 'Lámpara de Deseos' para cualquier ocasión: mudanza, boda, baby shower o simplemente porque sí.",
      img: "https://picsum.photos/seed/wish/600/400"
    },
    {
      icon: <Users size={24} />,
      title: "2. Invita Genios",
      desc: "Comparte tu código mágico o link. Tus amigos se convierten en 'Genios' que ayudan a cumplir tus sueños.",
      img: "https://picsum.photos/seed/friends/600/400"
    },
    {
      icon: <Sparkles size={24} />,
      title: "3. Modo Secreto (¡Sorpresa!)",
      desc: "Por defecto, Djinn oculta quién reservó qué en tu propia lista. Así, ¡el regalo sigue siendo una sorpresa hasta que lo recibes!",
      img: "https://picsum.photos/seed/secret/600/400"
    },
    {
      icon: <User size={24} />,
      title: "4. Genio Secreto (Anónimo)",
      desc: "Al reservar o contribuir, puedes elegir ser un 'Genio Secreto'. Nadie, excepto el dueño de la lista, sabrá quién hizo el regalo.",
      img: "https://picsum.photos/seed/anonymous/600/400"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-jinn-dark/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-jinn-violet transition-colors z-10">
          <X size={24} />
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-jinn-neon/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-jinn-dark" size={32} />
          </div>
          <h2 className="font-display text-4xl font-black text-slate-900 mb-4">Guía Mágica de Djinn</h2>
          <p className="text-slate-500">Todo lo que necesitas saber para dominar tu lámpara.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-jinn-violet/20 transition-all group">
              <div className="aspect-video rounded-2xl overflow-hidden mb-2">
                <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-jinn-violet shadow-sm flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-[2rem] bg-jinn-dark text-white mb-8">
          <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-jinn-neon" size={20} />
            ¿Quién ve qué?
          </h3>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-jinn-neon mt-1.5 flex-shrink-0" />
              <p><span className="text-white font-bold">Genios (Amigos):</span> Siempre ven qué regalos están reservados para no repetir.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-jinn-neon mt-1.5 flex-shrink-0" />
              <p><span className="text-white font-bold">Creador (Tú):</span> Con el <span className="text-jinn-neon">Modo Secreto</span> activado, los regalos reservados se ocultan tras un brillo mágico. ¡Tú eliges cuándo descubrir la sorpresa!</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-jinn-neon mt-1.5 flex-shrink-0" />
              <p><span className="text-white font-bold">Genio Secreto:</span> Si alguien regala de forma anónima, solo tú podrás ver quién fue para poder agradecerle. El resto de los genios solo verán "Genio Secreto".</p>
            </li>
          </ul>
        </div>

        <button 
          onClick={onClose}
          className="w-full bubbly-button bg-jinn-violet text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-jinn-violet/20"
        >
          ¡Listo para empezar!
        </button>
      </motion.div>
    </motion.div>
  );
};

const PrivacyModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-jinn-dark/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-jinn-violet transition-colors">
          <X size={24} />
        </button>
        <h2 className="font-display text-3xl font-black text-slate-900 mb-6">Política de Privacidad</h2>
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          <p>En Djinn, valoramos tu privacidad. Esta política describe cómo manejamos tu información.</p>
          <h3 className="font-bold text-slate-900">1. Información que recolectamos</h3>
          <p>Solo recolectamos la información necesaria para que la aplicación funcione: tu nombre, correo electrónico y los datos de tus listas de deseos.</p>
          <h3 className="font-bold text-slate-900">2. Uso de la información</h3>
          <p>Tu información se utiliza exclusivamente para gestionar tus listas y permitir que tus amigos interactúen con ellas. No vendemos tus datos a terceros.</p>
          <h3 className="font-bold text-slate-900">3. Seguridad</h3>
          <p>Implementamos medidas de seguridad estándar para proteger tu información personal.</p>
          <h3 className="font-bold text-slate-900">4. Contacto</h3>
          <p>Si tienes preguntas sobre tu privacidad, puedes contactarnos a través de nuestra sección de ayuda.</p>
        </div>
        <button 
          onClick={onClose}
          className="w-full mt-10 bubbly-button bg-jinn-dark text-white py-4 rounded-2xl font-bold"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
};

const TermsModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-jinn-dark/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-jinn-violet transition-colors">
          <X size={24} />
        </button>
        <h2 className="font-display text-3xl font-black text-slate-900 mb-6">Términos y Condiciones</h2>
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          <p className="font-bold text-red-500 uppercase tracking-tighter">Aviso Importante: Djinn es únicamente una plataforma intermediaria.</p>
          <p>Al utilizar Djinn, aceptas los siguientes términos:</p>
          <h3 className="font-bold text-slate-900">1. Naturaleza del Servicio</h3>
          <p>Djinn es una herramienta de organización y comunicación. No procesamos pagos, no vendemos productos y no gestionamos envíos. Todas las transacciones financieras ocurren fuera de nuestra plataforma.</p>
          <h3 className="font-bold text-slate-900">2. Deslinde de Responsabilidad</h3>
          <p>Djinn desinda toda responsabilidad legal por cualquier conflicto, fraude, incumplimiento o daño que pueda surgir de las interacciones entre usuarios o con terceros (tiendas, bancos, procesadores de pago). El uso de la aplicación es bajo tu propio riesgo.</p>
          <h3 className="font-bold text-slate-900">3. Contenido del Usuario</h3>
          <p>Eres responsable de la veracidad de la información que publicas en tus listas.</p>
          <h3 className="font-bold text-slate-900">4. Modificaciones</h3>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
        </div>
        <button 
          onClick={onClose}
          className="w-full mt-10 bubbly-button bg-jinn-dark text-white py-4 rounded-2xl font-bold"
        >
          Acepto los Términos
        </button>
      </motion.div>
    </motion.div>
  );
};

const PaymentSettingsModal = ({ wishlist, onClose, onSave }: { wishlist: Wishlist, onClose: () => void, onSave: (info: PaymentInfo) => void }) => {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>(wishlist.paymentInfo?.methods || []);
  const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);

  const handleAddMethod = () => {
    setEditingMethod({ id: Math.random().toString(36).substr(2, 9), type: 'bank', label: '', details: '' });
  };

  const handleSaveMethod = () => {
    if (editingMethod && editingMethod.label && editingMethod.details) {
      const newMethods = methods.filter(m => m.id !== editingMethod.id);
      newMethods.push(editingMethod as PaymentMethod);
      setMethods(newMethods);
      setEditingMethod(null);
    }
  };

  const removeMethod = (id: string) => {
    setMethods(methods.filter(m => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-2xl font-black text-slate-900">{t('payment_config_title')}</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <p className="text-slate-500 text-sm mb-6">
            {t('payment_config_desc')}
          </p>

          <div className="space-y-4 mb-8">
            {methods.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-jinn-violet shadow-sm">
                    {m.type === 'paypal' && <Globe size={18} />}
                    {m.type === 'mercadopago' && <Wallet size={18} />}
                    {m.type === 'bank' && <CreditCard size={18} />}
                    {m.type === 'debit' && <CreditCard size={18} />}
                    {m.type === 'other' && <Plus size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{m.label}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t(`payment_type_${m.type}`)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingMethod(m)} className="p-2 text-slate-400 hover:text-jinn-violet"><Settings size={16} /></button>
                  <button onClick={() => removeMethod(m.id)} className="p-2 text-slate-400 hover:text-red-500"><X size={16} /></button>
                </div>
              </div>
            ))}

            <button 
              onClick={handleAddMethod}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-jinn-violet hover:text-jinn-violet transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {t('add_payment_method')}
            </button>
          </div>

          {editingMethod && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-slate-50 border-2 border-jinn-violet/20 space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                {['paypal', 'mercadopago', 'bank', 'debit', 'other'].map(t_type => (
                  <button
                    key={t_type}
                    onClick={() => setEditingMethod({...editingMethod, type: t_type as any})}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${editingMethod.type === t_type ? 'bg-jinn-violet text-white border-jinn-violet' : 'bg-white text-slate-400 border-slate-100'}`}
                  >
                    {t(`payment_type_${t_type}`)}
                  </button>
                ))}
              </div>
              <input 
                type="text"
                placeholder={t('payment_method_name_placeholder')}
                value={editingMethod.label}
                onChange={(e) => setEditingMethod({...editingMethod, label: e.target.value})}
                className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-jinn-violet/20"
              />
              <textarea 
                placeholder={t('payment_details_placeholder')}
                value={editingMethod.details}
                onChange={(e) => setEditingMethod({...editingMethod, details: e.target.value})}
                rows={3}
                className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-jinn-violet/20 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingMethod(null)} className="flex-1 py-3 text-slate-400 font-bold text-sm">{t('cancel')}</button>
                <button onClick={handleSaveMethod} className="flex-1 py-3 bg-jinn-violet text-white rounded-xl font-bold text-sm">{t('save_method')}</button>
              </div>
            </motion.div>
          )}

          <button 
            onClick={() => onSave({ methods })}
            className="w-full bg-jinn-violet text-white py-4 rounded-2xl font-black shadow-xl shadow-jinn-violet/20 hover:bg-jinn-coral transition-all mt-8"
          >
            {t('save_all_changes')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ContributionModal = ({ gift, wishlist, onClose, onConfirm, onNotify }: { 
  gift: Gift, 
  wishlist: Wishlist, 
  onClose: () => void, 
  onConfirm: (amount: number, isSecret: boolean, voiceMessageUrl?: string) => void,
  onNotify: (title: string, msg: string) => void
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const remaining = gift.targetAmount - gift.contributions;

  const handleConfirm = () => {
    const numAmount = Number(amount);
    if (numAmount > 0 && numAmount <= remaining) {
      onConfirm(numAmount, isSecret, voiceMessage || undefined);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceMessage("mock-voice-url"); // In a real app, this would be the actual recording
    } else {
      setIsRecording(true);
      setVoiceMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-black text-slate-900">Contribuir</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
            <img src={gift.imageUrl} alt={gift.title} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
            <div>
              <h3 className="font-bold text-slate-800">{gift.title}</h3>
              <p className="text-xs text-slate-500">Faltan {formatCurrency(remaining, 'USD')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">¿Cuánto quieres aportar?</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-xl font-bold focus:outline-none focus:ring-4 transition-all ${
                    Number(amount) > remaining 
                      ? 'border-red-200 focus:ring-red-100' 
                      : 'border-slate-100 focus:ring-jinn-violet/10'
                  }`}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">USD</span>
              </div>
              {Number(amount) > remaining && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  El monto supera lo que se necesita. Faltan {formatCurrency(remaining, 'USD')}.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl">
              <input 
                type="checkbox" 
                id="secret-contribution" 
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 text-jinn-violet focus:ring-jinn-violet"
              />
              <label htmlFor="secret-contribution" className="text-xs font-bold text-slate-500 cursor-pointer">
                {t('be_secret_genie')}
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mensaje de Voz (Opcional)</label>
              <button 
                onClick={toggleRecording}
                className={`w-full py-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                  isRecording 
                  ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                  : voiceMessage 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-500' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Mic size={20} className={isRecording ? 'animate-bounce' : ''} />
                <span className="font-bold text-sm">
                  {isRecording ? 'Grabando... (Click para parar)' : voiceMessage ? '¡Mensaje grabado!' : 'Grabar mensaje de voz'}
                </span>
              </button>
            </div>

            {wishlist.paymentInfo?.methods && wishlist.paymentInfo.methods.length > 0 ? (
              <div className="p-6 rounded-[2rem] bg-jinn-violet/5 border-2 border-jinn-violet/10">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Elige cómo quieres ayudar</p>
                <div className="space-y-3">
                  {wishlist.paymentInfo.methods.map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-jinn-violet/10 text-jinn-violet rounded-lg">
                            {m.type === 'paypal' && <Globe size={14} />}
                            {m.type === 'mercadopago' && <Wallet size={14} />}
                            {m.type === 'bank' && <CreditCard size={14} />}
                            {m.type === 'debit' && <CreditCard size={14} />}
                            {m.type === 'other' && <Plus size={14} />}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{m.label}</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(m.details);
                            onNotify("¡Copiado!", "Datos de pago copiados al portapapeles");
                          }}
                          className="text-[10px] font-black text-jinn-violet uppercase tracking-widest hover:text-jinn-coral transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {m.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-100 text-amber-700 text-sm">
                <p className="font-bold mb-1">⚠️ Sin método de pago</p>
                El dueño aún no ha configurado cómo recibir el dinero. Puedes confirmar tu intención de aporte, pero deberás coordinar con él.
              </div>
            )}

            <div className="text-[10px] text-slate-400 text-center px-4 italic">
              Al confirmar, Djinn registrará tu aporte en la lista. Recuerda realizar el pago externo para que sea efectivo.
            </div>

            <button 
              onClick={handleConfirm}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > remaining}
              className="w-full bg-jinn-violet text-white py-4 rounded-2xl font-black shadow-xl shadow-jinn-violet/20 hover:bg-jinn-coral transition-all disabled:opacity-50"
            >
              Confirmar Aporte
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CreateWishlistModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (data: Partial<Wishlist>) => void }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vibe, setVibe] = useState('General');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop');

  const vibes = [
    { id: 'General', label: 'General', icon: <Sparkles size={16} /> },
    { id: 'Boda', label: 'Boda', icon: <Heart size={16} /> },
    { id: 'Baby Shower', label: 'Baby Shower', icon: <PartyPopper size={16} /> },
    { id: 'Cumpleaños', label: 'Cumpleaños', icon: <PartyPopper size={16} /> },
    { id: 'Mudanza', label: 'Mudanza', icon: <MapPin size={16} /> },
    { id: 'Viaje', label: 'Viaje', icon: <Globe size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-3xl font-black text-slate-900">Nueva Lámpara</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título de la Lista</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mi Boda, Baby Shower de Lucas..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 focus:border-jinn-violet/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Cuéntale a tus amigos de qué trata esta lista..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Vibe / Categoría</label>
              <div className="grid grid-cols-2 gap-2">
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVibe(v.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      vibe === v.id 
                      ? 'bg-jinn-violet text-white shadow-lg shadow-jinn-violet/20' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}
                  >
                    {v.icon}
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">URL de Portada (Opcional)</label>
              <input 
                type="text" 
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all"
              />
            </div>

            <button 
              onClick={() => onCreate({ title, description, vibe, coverImage })}
              disabled={!title}
              className="w-full bg-jinn-violet text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-jinn-violet/20 hover:bg-jinn-coral transition-all disabled:opacity-50 mt-4"
            >
              Crear Lámpara
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AddGiftModal = ({ onClose, onAdd, isOwner }: { 
  onClose: () => void, 
  onAdd: (gift: Partial<Gift>) => void,
  isOwner: boolean
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('General');
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [isSurprise, setIsSurprise] = useState(!isOwner);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-3xl font-black text-slate-900">Añadir Deseo</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Enlace del Producto (Opcional)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Pega el link de Amazon, Mercado Libre..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 focus:border-jinn-violet/20 transition-all"
                />
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título del Deseo</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Precio Aprox.</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Categoría</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all appearance-none"
                >
                  <option>General</option>
                  <option>Tecnología</option>
                  <option>Hogar</option>
                  <option>Experiencias</option>
                  <option>Moda</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">URL de la Imagen</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border-2 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-jinn-violet shadow-sm">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Regalo Grupal</p>
                  <p className="text-[10px] text-slate-500">Varios genios pueden aportar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsGroupGift(!isGroupGift)}
                className={`w-12 h-6 rounded-full transition-all relative ${isGroupGift ? 'bg-jinn-violet' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGroupGift ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {isOwner && (
              <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border-2 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-jinn-violet shadow-sm">
                    <EyeOff size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Regalo Sorpresa</p>
                    <p className="text-[10px] text-slate-500">Ocultar detalles al dueño</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSurprise(!isSurprise)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isSurprise ? 'bg-jinn-violet' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSurprise ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            )}

            <button 
              onClick={() => onAdd({ title, description, price: Number(price), imageUrl, category, isGroupGift, isSurprise, targetAmount: Number(price) })}
              className="w-full bg-jinn-violet text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-jinn-violet/20 hover:bg-jinn-coral transition-all mt-4"
            >
              {isOwner ? 'Añadir a mi Lámpara' : 'Añadir Regalo Sorpresa'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <DjinnApp />
    </HashRouter>
  );
}

function DjinnApp() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlistMatch = useMatch('/wishlist/:wishlistId');
  const urlWishlistId = wishlistMatch?.params.wishlistId;
  
  const [user, setUser] = useState<{ id: string, name: string, email: string, avatar: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const newUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Genio',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`
        };
        setUser(newUser);
        
        // Assign mock data to current user for testing
        setWishlists(prev => prev.map(w => {
          if (w.ownerId === 'u1') {
            return { ...w, ownerId: firebaseUser.uid, creator: newUser.name };
          }
          return w;
        }));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (provider: 'google' | 'apple') => {
    try {
      const authProvider = provider === 'google' ? googleProvider : appleProvider;
      await signInWithPopup(auth, authProvider);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const [wishlists, setWishlists] = useState<Wishlist[]>(MOCK_WISHLISTS);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [secretMode, setSecretMode] = useState(true);
  const [currency, setCurrency] = useState(getLocalCurrency());
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [showPaymentSettingsModal, setShowPaymentSettingsModal] = useState(false);
  const [modalWishlistId, setModalWishlistId] = useState<string | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributingGift, setContributingGift] = useState<Gift | null>(null);
  const [showNotification, setShowNotification] = useState<{ title: string, msg: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const selectedWishlistId = urlWishlistId || null;
  const selectedWishlist = wishlists.find(w => w.id === selectedWishlistId);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      return;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const sendPushNotification = (title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico" // Or a generic Djinn icon if available
      });
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (selectedWishlistId) {
      socket.emit('join_wishlist', selectedWishlistId);
    }

    const handleGiftReserved = (data: any) => {
      const isSecret = data.isSecret;
      const isOwner = selectedWishlist?.ownerId === user?.id;
      
      const title = "✨ ¡Deseo en camino!";
      let msg = isSecret 
        ? `Un Genio Secreto ha reservado: ${data.giftTitle}`
        : `${data.userName} ha reservado: ${data.giftTitle}`;
      
      if (isSecret && isOwner) {
        msg = `${data.userName} ha reservado un regalo en modo secreto: ${data.giftTitle}`;
      }
      
      setShowNotification({ title, msg });
      sendPushNotification(title, msg);
      
      setTimeout(() => setShowNotification(null), 5000);
      
      // Update local state to show it's reserved
      setWishlists(prev => prev.map(w => {
        if (w.id === data.wishlistId) {
          return {
            ...w,
            gifts: w.gifts.map(g => g.id === data.giftId ? { 
              ...g, 
              status: 'reserved', 
              reservedBy: data.userName,
              reservedBySecret: isSecret
            } : g)
          };
        }
        return w;
      }));
    };

    const handleGiftReceived = (data: any) => {
      const title = "🎁 ¡Regalo recibido!";
      const msg = `El deseo "${data.giftTitle}" ya está en manos de su dueño.`;
      
      setShowNotification({ title, msg });
      sendPushNotification(title, msg);
      
      setTimeout(() => setShowNotification(null), 5000);
      
      setWishlists(prev => prev.map(w => {
        if (w.id === data.wishlistId) {
          return {
            ...w,
            gifts: w.gifts.map(g => g.id === data.giftId ? { ...g, status: 'completed' } : g)
          };
        }
        return w;
      }));
    };

    const handleMessageReceived = (data: any) => {
      setWishlists(prev => prev.map(w => {
        if (w.id === data.wishlistId) {
          return {
            ...w,
            gifts: w.gifts.map(g => {
              if (g.id === data.giftId) {
                const newComment: Comment = {
                  id: Date.now().toString(),
                  user: data.user,
                  text: data.text,
                  timestamp: data.timestamp
                };
                return { ...g, comments: [...g.comments, newComment] };
              }
              return g;
            })
          };
        }
        return w;
      }));
    };

    const handleSecretModeDisabled = (data: any) => {
      const title = "🔓 ¡Se revelaron las sorpresas!";
      const msg = `El dueño de la lista ha desactivado el modo secreto. ¡Ya puedes ver quién regaló qué!`;
      setShowNotification({ title, msg });
      sendPushNotification(title, msg);
      setTimeout(() => setShowNotification(null), 5000);
    };

    const handleContributionReceived = (data: any) => {
      const isSecret = data.isSecret;
      const isOwner = selectedWishlist?.ownerId === user?.id;
      
      const title = "💰 ¡Nuevo aporte!";
      let msg = isSecret 
        ? `Un Genio Secreto ha aportado a: ${data.giftTitle}`
        : `${data.userName} ha aportado a: ${data.giftTitle}`;
      
      if (isSecret && isOwner) {
        msg = `${data.userName} ha aportado en modo secreto: ${data.giftTitle}`;
      }
      
      setShowNotification({ title, msg });
      sendPushNotification(title, msg);
      setTimeout(() => setShowNotification(null), 5000);

      setWishlists(prev => prev.map(w => {
        if (w.id === data.wishlistId) {
          return {
            ...w,
            gifts: w.gifts.map(g => {
              if (g.id === data.giftId) {
                const newContribution: Contribution = {
                  id: data.contributionId,
                  userName: data.userName,
                  amount: data.amount,
                  timestamp: data.timestamp,
                  isSecret: data.isSecret,
                  voiceMessageUrl: data.voiceMessageUrl
                };
                const newContributions = g.contributions + data.amount;
                return { 
                  ...g, 
                  contributions: newContributions,
                  status: newContributions >= g.targetAmount ? 'completed' : g.status,
                  contributionHistory: [...(g.contributionHistory || []), newContribution]
                };
              }
              return g;
            })
          };
        }
        return w;
      }));
    };

    socket.on('gift_reserved_update', handleGiftReserved);
    socket.on('gift_received_update', handleGiftReceived);
    socket.on('message_received', handleMessageReceived);
    socket.on('secret_mode_disabled_update', handleSecretModeDisabled);
    socket.on('contribution_received_update', handleContributionReceived);

    return () => {
      socket.off('gift_reserved_update', handleGiftReserved);
      socket.off('gift_received_update', handleGiftReceived);
      socket.off('message_received', handleMessageReceived);
      socket.off('secret_mode_disabled_update', handleSecretModeDisabled);
      socket.off('contribution_received_update', handleContributionReceived);
    };
  }, [selectedWishlistId]);

  const handleOpenWishlist = (id: string) => {
    navigate(`/wishlist/${id}`);
    window.scrollTo(0, 0);
  };

  const handleSavePaymentInfo = (info: PaymentInfo) => {
    if (!selectedWishlistId) return;
    setWishlists(prev => prev.map(w => {
      if (w.id === selectedWishlistId) {
        return { ...w, paymentInfo: info };
      }
      return w;
    }));
    setShowPaymentSettingsModal(false);
    setShowNotification({
      title: "💳 Pagos configurados",
      msg: "Tus genios ahora saben cómo ayudarte."
    });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleConfirmContribution = (amount: number, isSecret: boolean, voiceMessageUrl?: string) => {
    if (!selectedWishlistId || !contributingGift) return;

    const contributionId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    socket.emit('new_contribution', {
      wishlistId: selectedWishlistId,
      giftId: contributingGift.id,
      giftTitle: contributingGift.title,
      userName: user?.name || 'Un Genio',
      amount,
      isSecret,
      voiceMessageUrl,
      contributionId,
      timestamp
    });

    setShowContributionModal(false);
    setContributingGift(null);
  };

  const handleAddGift = (giftData: Partial<Gift>) => {
    if (!selectedWishlistId) return;

    const newGift: Gift = {
      id: Math.random().toString(36).substr(2, 9),
      title: giftData.title || 'Nuevo Deseo',
      description: giftData.description || '',
      price: giftData.price || 0,
      imageUrl: giftData.imageUrl || 'https://picsum.photos/seed/gift/400/400',
      status: 'available',
      category: giftData.category || 'General',
      isGroupGift: giftData.isGroupGift || false,
      contributions: 0,
      targetAmount: giftData.targetAmount || giftData.price || 0,
      comments: [],
      isSurprise: giftData.isSurprise || false,
      revealed: false,
      addedBy: user?.name || 'Un Genio',
      contributionHistory: []
    };

    setWishlists(prev => prev.map(w => {
      if (w.id === selectedWishlistId) {
        return { ...w, gifts: [...w.gifts, newGift] };
      }
      return w;
    }));

    setShowAddGiftModal(false);
    setShowNotification({
      title: newGift.isSurprise ? "🎁 ¡Sorpresa añadida!" : "✨ ¡Deseo concedido!",
      msg: newGift.isSurprise 
        ? "Has añadido un regalo secreto para tu amigo." 
        : `"${newGift.title}" ha sido añadido a tu lámpara.`
    });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleCreateWishlist = (wishlistData: Partial<Wishlist>) => {
    const newWishlist: Wishlist = {
      id: Math.random().toString(36).substr(2, 9),
      title: wishlistData.title || 'Nueva Lámpara',
      creator: user?.name || 'Un Genio',
      ownerId: user?.id || '',
      description: wishlistData.description || '',
      vibe: wishlistData.vibe || 'General',
      coverImage: wishlistData.coverImage || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
      participantCount: 0,
      isFavorite: false,
      magicCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      gifts: [],
      isArchived: false
    };

    setWishlists(prev => [newWishlist, ...prev]);
    setShowCreateModal(false);
    setShowNotification({
      title: "✨ ¡Lámpara frotada!",
      msg: `"${newWishlist.title}" ha sido creada con éxito.`
    });
    setTimeout(() => setShowNotification(null), 3000);
    navigate(`/wishlist/${newWishlist.id}`);
  };

  const handleBackToDashboard = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const handleJoinList = () => {
    if (joinCode.trim()) {
      // In a real app, we would validate the code and fetch the list
      if (joinCode === 'DJINN-2026') {
        handleOpenWishlist('w1');
      }
      setShowJoinModal(false);
      setJoinCode('');
      
      // Simulate notification for the owner
      setShowNotification({
        title: "¡Nuevo Genio!",
        msg: `Alguien se ha unido a tu lista usando el código mágico.`
      });
      setTimeout(() => setShowNotification(null), 5000);
    }
  };

  const toggleSecretMode = () => {
    const newMode = !secretMode;
    setSecretMode(newMode);
    if (!newMode && selectedWishlistId) {
      // Notify everyone that surprises are over
      socket.emit('secret_mode_disabled', {
        wishlistId: selectedWishlistId,
        userName: user?.name
      });
    }
  };

  const handleMarkAsReceived = (giftId: string) => {
    if (!selectedWishlist) return;
    
    setWishlists(prev => prev.map(w => {
      if (w.id === selectedWishlist.id) {
        return {
          ...w,
          gifts: w.gifts.map(g => {
            if (g.id === giftId) {
              const giver = g.reservedBy || 'alguien especial';
              const newComment: Comment = {
                id: Date.now().toString(),
                user: CURRENT_USER_NAME,
                text: `¡Deseo cumplido! Muchas gracias ${giver} por este regalo, me encanta. ❤️`,
                timestamp: 'Hace un momento'
              };
              return { 
                ...g, 
                status: 'completed' as GiftStatus, 
                revealed: true,
                comments: [...g.comments, newComment] 
              };
            }
            return g;
          })
        };
      }
      return w;
    }));
    
    // Update selected gift in modal if open
    if (selectedGift && selectedGift.id === giftId) {
      setSelectedGift(prev => prev ? { ...prev, status: 'completed' as GiftStatus, revealed: true } : null);
    }
  };

  const toggleFavorite = (id: string) => {
    setWishlists(prev => prev.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
  };

  const toggleArchive = (id: string) => {
    setWishlists(prev => prev.map(w => w.id === id ? { ...w, isArchived: !w.isArchived } : w));
    if (selectedWishlistId === id) {
      navigate('/');
    }
  };

  const handleShare = () => {
    if (!selectedWishlist) return;
    
    const invitationText = t('invitation_text', {
      title: selectedWishlist.title,
      creator: selectedWishlist.creator,
      url: window.location.href,
      code: selectedWishlist.magicCode
    });
    
    navigator.clipboard.writeText(invitationText);
    setShowShareModal(true);
  };

  const getShareLinks = () => {
    if (!selectedWishlist) return { whatsapp: '', email: '', instagram: '' };
    
    const text = t('invitation_text', {
      title: selectedWishlist.title,
      creator: selectedWishlist.creator,
      url: window.location.href,
      code: selectedWishlist.magicCode
    });
    
    const encodedText = encodeURIComponent(text);
    
    return {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent(t('app_name') + ': ' + selectedWishlist.title)}&body=${encodedText}`,
      instagram: `https://www.instagram.com/` // Instagram doesn't support direct text sharing via URL easily, but we can link to the app
    };
  };

  const myLists = wishlists.filter(w => w.ownerId === user?.id && !w.isArchived);
  const friendsLists = wishlists.filter(w => w.ownerId !== user?.id && !w.isArchived);
  const favoriteLists = wishlists.filter(w => w.isFavorite && !w.isArchived);
  const archivedLists = wishlists.filter(w => w.isArchived);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0b2e] flex items-center justify-center">
        <Loader2 className="text-jinn-violet animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        onShowPrivacy={() => setShowPrivacyModal(true)} 
        onShowTerms={() => setShowTermsModal(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-8 z-[120] w-80"
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-jinn-neon rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="text-jinn-dark" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-bold text-slate-900">{showNotification.title}</h4>
                <p className="text-slate-500 text-xs mt-1">{showNotification.msg}</p>
              </div>
              <button onClick={() => setShowNotification(null)} className="text-slate-300 hover:text-slate-500">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Wishlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateWishlistModal 
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateWishlist}
          />
        )}
      </AnimatePresence>

      {/* Add Gift Modal */}
      <AnimatePresence>
        {showAddGiftModal && (
          <AddGiftModal 
            onClose={() => setShowAddGiftModal(false)}
            onAdd={handleAddGift}
            isOwner={selectedWishlist?.ownerId === user?.id}
          />
        )}
      </AnimatePresence>

      {/* Payment Settings Modal */}
      <AnimatePresence>
        {showPaymentSettingsModal && (wishlists.find(w => w.id === (modalWishlistId || selectedWishlistId))) && (
          <PaymentSettingsModal 
            wishlist={wishlists.find(w => w.id === (modalWishlistId || selectedWishlistId))!}
            onClose={() => {
              setShowPaymentSettingsModal(false);
              setModalWishlistId(null);
            }}
            onSave={handleSavePaymentInfo}
          />
        )}
      </AnimatePresence>

      {/* Contribution Modal */}
      <AnimatePresence>
        {showContributionModal && contributingGift && selectedWishlist && (
          <ContributionModal 
            gift={contributingGift}
            wishlist={selectedWishlist}
            onClose={() => {
              setShowContributionModal(false);
              setContributingGift(null);
            }}
            onNotify={(title, msg) => {
              setShowNotification({ title, msg });
              setTimeout(() => setShowNotification(null), 3000);
            }}
            onConfirm={handleConfirmContribution}
          />
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacyModal && (
          <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTermsModal && (
          <TermsModal onClose={() => setShowTermsModal(false)} />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedWishlist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-jinn-violet via-jinn-coral to-jinn-neon" />
              
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 bg-jinn-violet/10 rounded-[2rem] flex items-center justify-center mb-6">
                  <Share2 className="text-jinn-violet" size={32} />
                </div>
                <h2 className="font-display text-3xl font-black text-slate-900 mb-3">{t('invitation_copied')}</h2>
                <p className="text-slate-500 leading-relaxed">
                  {t('share_success_msg', { title: selectedWishlist.title, creator: selectedWishlist.creator })}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <a 
                  href={getShareLinks().whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <MessageCircle size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">WhatsApp</span>
                </a>
                <a 
                  href={getShareLinks().instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-all border border-pink-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                    <Globe size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">Instagram</span>
                </a>
                <a 
                  href={getShareLinks().email}
                  className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Globe size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider">Gmail</span>
                </a>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-10 flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-jinn-neon rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-jinn-dark" />
                  </div>
                  <span className="text-sm font-bold text-slate-400 truncate uppercase tracking-widest">Código: {selectedWishlist.magicCode}</span>
                </div>
                <span className="text-[10px] font-black text-jinn-violet uppercase tracking-tighter">Copiado</span>
              </div>

              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full bubbly-button bg-jinn-dark text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-jinn-dark/20"
              >
                {t('ok_got_it') || '¡Entendido!'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-jinn-neon/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-jinn-dark" size={32} />
              </div>
              <h2 className="font-display text-3xl font-black text-slate-900 mb-2">Unirse a una Lámpara</h2>
              <p className="text-slate-400 mb-8">Ingresa el código mágico que te compartieron para entrar a la lista.</p>
              
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="EJ: DJINN-2026"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center font-display text-2xl font-black tracking-widest focus:outline-none focus:border-jinn-violet transition-all mb-6"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleJoinList}
                  className="flex-[2] bubbly-button bg-jinn-violet text-white py-4 rounded-2xl font-bold shadow-lg shadow-jinn-violet/20"
                >
                  Entrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-jinn-dark/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl font-black text-slate-900">{t('settings')}</h2>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('language')}</label>
                  <select 
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all"
                  >
                    <option value="es">Español (Latinoamérica)</option>
                    <option value="en">English (US)</option>
                    <option value="pt">Português (Brasil)</option>
                    <option value="fr">Français</option>
                    <option value="it">Italiano</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('currency')}</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-jinn-violet/10 transition-all"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="p-6 rounded-3xl bg-jinn-violet/5 border border-jinn-violet/10">
                  <h4 className="text-sm font-bold text-jinn-violet mb-2 flex items-center gap-2">
                    <Bell size={16} />
                    Notificaciones Push
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Recibe alertas en tiempo real cuando alguien reserve un regalo en tus listas compartidas.
                  </p>
                  <button 
                    onClick={requestNotificationPermission}
                    disabled={notificationsEnabled}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                      notificationsEnabled 
                      ? 'bg-emerald-50 text-emerald-500 border border-emerald-200 cursor-default' 
                      : 'bg-white border border-jinn-violet/20 text-jinn-violet hover:bg-jinn-violet hover:text-white'
                    }`}
                  >
                    {notificationsEnabled ? 'Notificaciones Activadas' : 'Activar Notificaciones'}
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-jinn-violet/5 border border-jinn-violet/10">
                  <h4 className="text-sm font-bold text-jinn-violet mb-2 flex items-center gap-2">
                    <CreditCard size={16} />
                    Métodos de Pago Globales
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Configura tus cuentas para recibir regalos de genios de todo el mundo.
                  </p>
                  <button 
                    onClick={() => {
                      // Find a wishlist to attach the payment info to (prefer current, then first owned)
                      const targetWishlist = selectedWishlistId 
                        ? selectedWishlistId 
                        : wishlists.find(w => w.ownerId === CURRENT_USER_ID)?.id;

                      if (targetWishlist) {
                        setModalWishlistId(targetWishlist);
                        setShowSettings(false);
                        // Small delay to ensure state updates if needed, though usually not required for render
                        setTimeout(() => setShowPaymentSettingsModal(true), 10);
                      } else {
                        setShowNotification({ 
                          title: "Crea una lista primero", 
                          msg: "Debes tener al menos una lista de deseos para configurar tus métodos de pago." 
                        });
                        setTimeout(() => setShowNotification(null), 3000);
                      }
                    }}
                    className="w-full py-3 bg-white border border-jinn-violet/20 text-jinn-violet rounded-xl font-bold text-xs hover:bg-jinn-violet hover:text-white transition-all"
                  >
                    Gestionar Cuentas y Tarjetas
                  </button>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-jinn-violet text-white py-4 rounded-2xl font-black shadow-xl shadow-jinn-violet/20 hover:bg-jinn-coral transition-all"
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer"
            onClick={handleBackToDashboard}
          >
            <Logo className="text-slate-900" size={64} />
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={handleBackToDashboard} className={`text-sm font-bold ${!selectedWishlistId ? 'text-jinn-violet' : 'text-slate-400 hover:text-jinn-violet'} transition-colors`}>
              {t('my_lists')}
            </button>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-sm font-bold text-slate-400 hover:text-jinn-violet transition-colors"
            >
              {t('how_it_works')}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-jinn-neon flex items-center justify-center font-black text-[10px] shadow-sm overflow-hidden border-2 border-white"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.name?.split(' ').map(n => n[0]).join('') || '?'
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : (
              <LoginView 
                onLogin={handleLogin} 
                onShowPrivacy={() => setShowPrivacyModal(true)} 
                onShowTerms={() => setShowTermsModal(true)} 
              />
            )
          } />
          
          <Route path="/" element={
            !user ? <Navigate to="/login" replace /> : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-16"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <header>
                    <h1 className="font-display text-5xl font-black text-slate-900 mb-4">
                      ¡Hola, <span className="text-jinn-violet">{user?.name?.split(' ')[0] || 'Genio'}</span>!
                    </h1>
                    <p className="text-slate-500 text-lg">Tienes {myLists.length} wishlists activas.</p>
                  </header>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowJoinModal(true)}
                      className="bubbly-button bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold flex items-center gap-2"
                    >
                      <Users size={20} />
                      Unirse con Código
                    </button>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="bubbly-button bg-jinn-violet text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-jinn-violet/20"
                    >
                      <Plus size={20} />
                      Nueva Lista
                    </button>
                  </div>
                </div>

                <div className="space-y-16">
                  <WishlistSection 
                    title="Tus listas de deseos" 
                    wishlists={myLists} 
                    onOpen={handleOpenWishlist}
                    onToggleFavorite={toggleFavorite}
                    onAdd={() => setShowCreateModal(true)}
                  />

                  <WishlistSection 
                    title="Listas de tus amigos" 
                    wishlists={friendsLists} 
                    onOpen={handleOpenWishlist}
                    onToggleFavorite={toggleFavorite}
                  />

                  <WishlistSection 
                    title="Listas favoritas" 
                    wishlists={favoriteLists} 
                    onOpen={handleOpenWishlist}
                    onToggleFavorite={toggleFavorite}
                  />

                  <WishlistSection 
                    title={t('archived_lists')} 
                    wishlists={archivedLists} 
                    onOpen={handleOpenWishlist}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              </motion.div>
            )
          } />

          <Route path="/wishlist/:wishlistId" element={
            !user ? <Navigate to="/login" replace /> : (
              selectedWishlist ? (
                <>
                  {/* Hero Section */}
                  <header className="mb-16">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                          <button 
                            onClick={handleBackToDashboard}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                          >
                            <ArrowRight className="rotate-180" size={20} />
                          </button>
                          <span className="px-3 py-1 rounded-full bg-jinn-coral/10 text-jinn-coral text-[10px] font-black uppercase tracking-widest">
                            {selectedWishlist.vibe}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 text-xs font-bold">{t('created_by')} {selectedWishlist.creator}</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[0.9]">
                          {selectedWishlist.title.split(' ').slice(0, -1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-jinn-violet to-jinn-coral">{selectedWishlist.title.split(' ').pop()}</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl max-w-lg leading-relaxed">
                          {selectedWishlist.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {selectedWishlist.ownerId === user?.id && (
                          <button 
                            onClick={toggleSecretMode}
                            className={`bubbly-button px-6 py-4 rounded-2xl font-bold flex items-center gap-2 border-2 transition-all ${
                              secretMode 
                              ? 'bg-jinn-dark text-white border-jinn-dark' 
                              : 'bg-white text-slate-400 border-slate-100'
                            }`}
                          >
                            <Sparkles size={20} className={secretMode ? 'text-jinn-neon' : ''} />
                            {t('secret_mode')}: {secretMode ? t('secret_on') : t('secret_off')}
                          </button>
                        )}
                        {selectedWishlist.ownerId === user?.id && (
                          <button 
                            onClick={() => setShowPaymentSettingsModal(true)}
                            className="w-14 h-14 bubbly-button bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-jinn-violet hover:border-jinn-violet/20 transition-all"
                            title="Configurar Pagos"
                          >
                            <CreditCard size={24} />
                          </button>
                        )}
                        <button 
                          onClick={handleShare}
                          className="w-14 h-14 bubbly-button bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-jinn-violet hover:border-jinn-violet/20 transition-all"
                        >
                          <Share2 size={24} />
                        </button>
                        {selectedWishlist.ownerId === user?.id && (
                          <button 
                            onClick={() => toggleArchive(selectedWishlist.id)}
                            className="w-14 h-14 bubbly-button bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
                            title="Archivar Lista"
                          >
                            <ShoppingBag size={24} />
                          </button>
                        )}
                        {selectedWishlist.ownerId === user?.id && (
                          <button 
                            onClick={() => setShowAddGiftModal(true)}
                            className="bubbly-button bg-jinn-violet text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-jinn-violet/20"
                          >
                            <Plus size={20} />
                            {t('add_wish')}
                          </button>
                        )}
                        {selectedWishlist.ownerId !== user?.id && (
                          <button 
                            onClick={() => setShowAddGiftModal(true)}
                            className="bubbly-button bg-jinn-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-jinn-dark/20"
                          >
                            <PartyPopper size={20} className="text-jinn-neon" />
                            Añadir Sorpresa
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </header>

                  {/* Filters/Tabs */}
                  <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                      { id: 'all', label: t('all_wishes'), icon: <Sparkles size={16} /> },
                      { id: 'available', label: t('available'), icon: <GiftIcon size={16} /> },
                      { id: 'group', label: t('group_gifts'), icon: <Users size={16} /> },
                      { id: 'reserved', label: t('reserved'), icon: <CheckCircle2 size={16} /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                          activeTab === tab.id 
                          ? 'bg-jinn-violet text-white shadow-lg shadow-jinn-violet/20' 
                          : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                      {selectedWishlist.gifts
                        .filter(g => {
                          if (activeTab === 'available') return g.status === 'available';
                          if (activeTab === 'group') return g.isGroupGift;
                          if (activeTab === 'reserved') return g.status === 'reserved';
                          return true;
                        })
                        .map((gift) => (
                          <GiftCard 
                            key={gift.id} 
                            gift={gift} 
                            onClick={() => setSelectedGift(gift)} 
                            onContribute={() => {
                              setContributingGift(gift);
                              setShowContributionModal(true);
                            }}
                            secretMode={secretMode}
                            currency={currency}
                            isOwner={selectedWishlist.ownerId === user?.id}
                          />
                        ))}
                    </AnimatePresence>
                  </div>

                  {/* Empty State */}
                  {selectedWishlist.gifts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <GiftIcon size={40} className="text-slate-200" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-slate-800 mb-2">
                        {selectedWishlist.ownerId === CURRENT_USER_ID ? "Tu lámpara está vacía" : "Lámpara vacía"}
                      </h3>
                      <p className="text-slate-400 max-w-xs">
                        {selectedWishlist.ownerId === CURRENT_USER_ID 
                          ? "Comienza a añadir los deseos que quieres que tus amigos te ayuden a cumplir."
                          : "Esta lista aún no tiene deseos. ¡Vuelve pronto!"}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Wishlist no encontrada</h2>
                  <button onClick={handleBackToDashboard} className="mt-4 text-jinn-violet font-bold">Volver al Dashboard</button>
                </div>
              )
            )
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedGift && (
          <GiftModal 
            gift={selectedGift} 
            onClose={() => setSelectedGift(null)} 
            secretMode={secretMode}
            currency={currency}
            isOwner={selectedWishlist?.ownerId === user?.id}
            onMarkAsReceived={handleMarkAsReceived}
            wishlistId={selectedWishlistId || ''}
            onContribute={() => {
              setContributingGift(selectedGift);
              setShowContributionModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center">
            <Logo className="text-slate-400" size={48} />
          </div>
          <p className="text-slate-400 text-[11px] font-medium text-center md:text-left">
            © 2026 Djinn - Hecho por Guten para compartir tus mejores momentos.
          </p>
          <div className="flex gap-6">
            <button onClick={() => setShowPrivacyModal(true)} className="text-slate-400 hover:text-jinn-violet transition-colors font-bold text-sm">Privacidad</button>
            <button onClick={() => setShowTermsModal(true)} className="text-slate-400 hover:text-jinn-violet transition-colors font-bold text-sm">Términos</button>
            <button onClick={() => setShowHelpModal(true)} className="text-slate-400 hover:text-jinn-violet transition-colors font-bold text-sm">Ayuda</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
