import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Trash2 } from 'lucide-react';
import { Food, Meal, MealSlot, FoodLog } from '../types';
import { parseVoiceInput, SAMPLE_VOICE_PROMPTS, VoiceParseResult, ParsedVoiceItem } from '../services/voiceParser';

interface VoiceLogModalProps {
  isOpen: boolean;
  foods: Food[];
  meals: Meal[];
  onClose: () => void;
  onConfirmLogs: (logs: Omit<FoodLog, 'id' | 'timestamp'>[]) => void;
}

export const VoiceLogModal: React.FC<VoiceLogModalProps> = ({
  isOpen,
  foods,
  meals,
  onClose,
  onConfirmLogs,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [, setParseResult] = useState<VoiceParseResult | null>(null);
  const [selectedMealSlot, setSelectedMealSlot] = useState<MealSlot>('breakfast');
  const [editableItems, setEditableItems] = useState<ParsedVoiceItem[]>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          if (event.results[0].isFinal) {
            handleProcessTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [foods, meals]);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParseResult(null);
      setEditableItems([]);
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    } else {
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleProcessTranscript = (text: string) => {
    stopListening();
    const result = parseVoiceInput(text, foods, meals);
    setParseResult(result);
    setSelectedMealSlot(result.targetMeal);
    setEditableItems(result.items);
  };

  const handleSelectSample = (sample: string) => {
    setTranscript(sample);
    handleProcessTranscript(sample);
  };

  const handleItemChange = (index: number, field: keyof ParsedVoiceItem, value: any) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = editableItems.filter((_, i) => i !== index);
    setEditableItems(updated);
  };

  const handleConfirm = () => {
    if (editableItems.length === 0) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const newLogs: Omit<FoodLog, 'id' | 'timestamp'>[] = editableItems.map((item) => ({
      date: dateStr,
      mealType: selectedMealSlot,
      name: item.name,
      portionMultiplier: 1.0,
      calories: Math.round(item.calories),
      protein: Number(item.protein.toFixed(1)),
      carbs: Number(item.carbs.toFixed(1)),
      fat: Number(item.fat.toFixed(1)),
      originalItemType: item.matchedMealId ? 'meal' : item.matchedFoodId ? 'food' : 'custom',
      originalItemId: item.matchedMealId || item.matchedFoodId,
    }));

    onConfirmLogs(newLogs);
    onClose();
  };

  if (!isOpen) return null;

  const totalCalories = editableItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = Number(editableItems.reduce((sum, item) => sum + item.protein, 0).toFixed(1));
  const totalCarbs = Number(editableItems.reduce((sum, item) => sum + item.carbs, 0).toFixed(1));
  const totalFat = Number(editableItems.reduce((sum, item) => sum + item.fat, 0).toFixed(1));

  const mealSlotTitle = selectedMealSlot.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg card-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#241e11] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="serif font-bold text-sm text-white uppercase tracking-wider">Voice Fuel Logger</h3>
              <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Natural Language Nutrition Parser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Listening & Waveform Area */}
        <div className="p-6 text-center bg-[#0e0e0e] border-b border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Animated Waveform Visual */}
          <div className="flex items-center justify-center space-x-1.5 h-12 mb-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full bg-gradient-to-t from-[#8a6d1e] to-[#d4af37] transition-all duration-300 ${
                  isListening
                    ? 'animate-pulse h-10'
                    : 'h-3 opacity-30'
                }`}
                style={{
                  animationDelay: `${i * 100}ms`,
                  height: isListening ? `${Math.sin(i) * 20 + 24}px` : '10px',
                }}
              />
            ))}
          </div>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse scale-110'
                : 'bg-gradient-to-tr from-[#d4af37] to-[#8a6d1e] hover:brightness-110 text-black shadow-[0_0_20px_rgba(212,175,55,0.35)]'
            }`}
          >
            {isListening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-black" />}
          </button>

          <span className="serif text-xs font-semibold uppercase tracking-wider text-[#d4af37] mt-3">
            {isListening ? 'Listening...' : 'Tap Mic or Select Sample'}
          </span>

          {transcript && (
            <p className="text-xs italic text-gray-200 mt-2 px-4 max-w-md bg-[#181818] py-2 rounded-lg border border-white/10 font-serif">
              "{transcript}"
            </p>
          )}
        </div>

        {/* Quick Sample Chips */}
        <div className="px-4 py-2.5 bg-[#111111] border-b border-white/5 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-wider">
              Try:
            </span>
            {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#181818] hover:bg-[#241e11] hover:border-[#d4af37]/40 text-gray-300 hover:text-[#d4af37] border border-white/5 transition-colors inline-block font-sans"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation & Editable Breakdown */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {editableItems.length > 0 ? (
            <div className="space-y-3">
              {/* Target Meal Selector */}
              <div className="flex items-center justify-between bg-[#181818] p-2.5 rounded-lg border border-white/5">
                <span className="text-xs font-semibold text-gray-300">Assign To Meal:</span>
                <div className="flex items-center space-x-1">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealSlot[]).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedMealSlot(slot)}
                      className={`text-xs px-2.5 py-1 rounded font-bold capitalize transition-all font-mono ${
                        selectedMealSlot === slot
                          ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                          : 'bg-[#0e0e0e] text-gray-400 hover:text-gray-200 border border-white/5'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="serif text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  Parsed Items (Editable)
                </span>
                {editableItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#181818] rounded-lg border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="bg-transparent font-semibold text-xs text-white border-b border-transparent focus:border-[#d4af37] focus:outline-none flex-1 mr-2"
                      />
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-gray-500 hover:text-rose-400"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-gray-400 block">Kcal</span>
                        <input
                          type="number"
                          value={item.calories}
                          onChange={(e) =>
                            handleItemChange(index, 'calories', Number(e.target.value))
                          }
                          className="w-full bg-[#0a0a0a] px-2 py-1 rounded border border-white/10 text-[#d4af37] font-mono font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-mono text-gray-400 block">Protein</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.protein}
                          onChange={(e) =>
                            handleItemChange(index, 'protein', Number(e.target.value))
                          }
                          className="w-full bg-[#0a0a0a] px-2 py-1 rounded border border-white/10 text-emerald-400 font-mono font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-mono text-gray-400 block">Carbs</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.carbs}
                          onChange={(e) =>
                            handleItemChange(index, 'carbs', Number(e.target.value))
                          }
                          className="w-full bg-[#0a0a0a] px-2 py-1 rounded border border-white/10 text-[#d4af37] font-mono font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-mono text-gray-400 block">Fat</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.fat}
                          onChange={(e) =>
                            handleItemChange(index, 'fat', Number(e.target.value))
                          }
                          className="w-full bg-[#0a0a0a] px-2 py-1 rounded border border-white/10 text-gray-300 font-mono font-semibold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation Card */}
              <div className="bg-[#1c1c1c] p-3.5 rounded-lg border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Total Summary</span>
                  <span className="serif text-base font-bold text-white font-mono">
                    {totalCalories} kcal
                  </span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <span className="text-emerald-400 font-semibold">{totalProtein}g P</span>
                  <span className="gold-text font-semibold">{totalCarbs}g C</span>
                  <span className="text-gray-300 font-semibold">{totalFat}g F</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-xs font-serif italic">
              Say e.g. "Alpen Original with semi-skimmed milk and a latte for breakfast", or select a sample above.
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-white/10 bg-[#0e0e0e]">
          <button
            onClick={handleConfirm}
            disabled={editableItems.length === 0}
            className="w-full py-3 bg-[#d4af37] hover:bg-[#b8962e] disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 text-black" />
            <span>ADD TO {mealSlotTitle}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
