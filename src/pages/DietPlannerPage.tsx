import React, {useState} from 'react';
import {Droplets, Plus, Sparkles, Trash2, Utensils} from 'lucide-react';
import type {AIDietPlan, MealRecord, MealType, SupportedLanguage} from '../types/wellness';
import {OFFLINE_DIET_PLANS} from '../data/wellnessContent';
import {createId} from '../db/rituDb';
import {formatReadableDate, toISODate} from '../utils/cycleMath';
import {WellnessImage} from '../components/RituLogo';

interface DietPlannerPageProps {
  language: SupportedLanguage;
  isOnline: boolean;
  meals: MealRecord[];
  onSaveMeal: (meal: MealRecord) => Promise<void>;
  onDeleteMeal: (id: string) => Promise<void>;
}

export const DietPlannerPage: React.FC<DietPlannerPageProps> = ({
  language,
  isOnline,
  meals,
  onSaveMeal,
  onDeleteMeal,
}) => {
  const [preference, setPreference] = useState<'vegetarian' | 'eggetarian' | 'non-vegetarian'>(
    'vegetarian',
  );
  const [goalFocus, setGoalFocus] = useState('Balanced energy & gentle cycle nourishment');
  const [allergiesOrNotes, setAllergiesOrNotes] = useState('');
  const [activePlan, setActivePlan] = useState<AIDietPlan>(OFFLINE_DIET_PLANS.vegetarian);
  const [isAIPlan, setIsAIPlan] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Daily Meal Log State
  const [mealDate, setMealDate] = useState(toISODate(new Date()));
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealItems, setMealItems] = useState('');
  const [waterGlasses, setWaterGlasses] = useState(2);
  const [mealNotes, setMealNotes] = useState('');
  const [waterCountToday, setWaterCountToday] = useState(5);

  const handleGeneratePlan = async () => {
    setAiError(null);
    if (!isOnline) {
      setActivePlan(OFFLINE_DIET_PLANS[preference]);
      setIsAIPlan(false);
      setAiError(
        'You are currently offline. Showing RituSaathi’s offline balanced Indian meal plan instead.',
      );
      return;
    }

    setLoadingAI(true);
    try {
      const response = await fetch('/api/ai/diet-plan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          preference,
          goalFocus,
          allergiesOrNotes,
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate AI diet plan.');
      }
      setActivePlan(data.plan);
      setIsAIPlan(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach AI Diet Planner.';
      setAiError(msg);
      setActivePlan(OFFLINE_DIET_PLANS[preference]);
      setIsAIPlan(false);
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePreferenceSwitch = (pref: 'vegetarian' | 'eggetarian' | 'non-vegetarian') => {
    setPreference(pref);
    if (!isAIPlan) {
      setActivePlan(OFFLINE_DIET_PLANS[pref]);
    }
  };

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealItems.trim()) return;
    await onSaveMeal({
      id: createId('meal'),
      date: mealDate,
      mealType,
      items: mealItems.trim(),
      waterGlasses: Number(waterGlasses),
      notes: mealNotes.trim(),
      isDemo: false,
      createdAt: new Date().toISOString(),
    });
    setMealItems('');
    setMealNotes('');
  };

  const mealSlots = [
    {label: 'Breakfast', data: activePlan.breakfast},
    {label: 'Lunch', data: activePlan.lunch},
    {label: 'Evening Snack', data: activePlan.eveningSnack},
    {label: 'Dinner', data: activePlan.dinner},
  ];

  return (
    <div className="space-y-8">
      {/* Header Split with Food Photography */}
      <section className="overflow-hidden rounded-3xl border border-[#E6DDF0] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
          <div className="p-6 sm:p-8 lg:col-span-7">
            <p className="text-xs font-medium text-[#6D28D9]">
              Balanced Indian nutrition · Non-restrictive wellness
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[#221830]">
              AI Indian Diet &amp; Meal Planner
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#524366]">
              Gentle, accessible Indian meal ideas built around home staples — idli, dosa, dal,
              seasonal sabzi, curd, fruits, sprouts, eggs, and paneer. No crash diets or weight-loss
              challenges.
            </p>

            {/* Preferences Controls */}
            <div className="mt-5 space-y-4">
              <div>
                <span className="block text-xs font-medium text-[#4A3D5C]">Dietary preference</span>
                <div className="mt-1.5 inline-flex flex-wrap gap-1 rounded-xl bg-[#F3EEF9] p-1">
                  {(['vegetarian', 'eggetarian', 'non-vegetarian'] as const).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handlePreferenceSwitch(pref)}
                      className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        preference === pref
                          ? 'bg-white text-[#6D28D9] shadow-xs'
                          : 'text-[#524366] hover:text-[#221830]'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-[#4A3D5C]">Wellness focus</span>
                  <select
                    value={goalFocus}
                    onChange={(e) => setGoalFocus(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
                  >
                    <option value="Balanced energy & gentle cycle nourishment">
                      Balanced daily energy
                    </option>
                    <option value="Iron-rich comfort during period days">
                      Period days comfort &amp; iron support
                    </option>
                    <option value="Steady blood sugar & PCOS-friendly home meals">
                      PCOS-friendly steady nutrition
                    </option>
                    <option value="Light digestion & hydration">
                      Light digestion &amp; hydration
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-[#4A3D5C]">
                    Allergies or food notes (optional)
                  </span>
                  <input
                    type="text"
                    value={allergiesOrNotes}
                    onChange={(e) => setAllergiesOrNotes(e.target.value)}
                    placeholder="e.g. No dairy, prefer South Indian breakfast"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={loadingAI}
                onClick={handleGeneratePlan}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5B21B6] disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {loadingAI
                    ? 'Generating Indian meal plan...'
                    : isOnline
                      ? 'Generate Personalized Gemini Meal Plan'
                      : 'Load Offline Meal Plan'}
                </span>
              </button>

              {aiError && (
                <p className="rounded-xl border border-[#E6DDF0] bg-[#FAF8FC] px-3.5 py-2.5 text-xs text-[#524366]">
                  {aiError}
                </p>
              )}
            </div>
          </div>

          <div className="relative min-h-[220px] border-t border-[#E6DDF0] lg:col-span-5 lg:border-t-0 lg:border-l">
            <WellnessImage
              src="/src/assets/images/ritusaathi_nutrition_bowl_1795252247208.jpg"
              alt="Wholesome Indian thali with idli, yellow moong dal, sprouted salad with pomegranate, and curd"
              fallbackTitle="Wholesome Indian Nutrition"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Meal Schedule Cards */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-[#221830]">
            {isAIPlan ? 'Gemini personalized meal schedule' : 'Balanced Indian meal schedule'}
          </h2>
          <span className="text-xs text-[#6B5B7E]">
            {isAIPlan ? 'AI-generated general wellness ideas' : 'Offline wellness template'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {mealSlots.map((slot) => (
            <div key={slot.label} className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-[#6D28D9]">{slot.label}</span>
                <span className="text-xs text-[#6B5B7E] tabular-nums">
                  {slot.data.suggestedTime}
                </span>
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#221830]">
                {slot.data.title}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-[#4A3D5C]">
                {slot.data.items.map((food) => (
                  <li key={food} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DB2777]" />
                    <span>{food}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-[#F0E9F7] pt-3 text-xs text-[#6B5B7E]">
                {slot.data.benefitNote}
              </p>
            </div>
          ))}
        </div>

        {/* Hydration & Gentle Guidance */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E6DDF0] bg-[#FAF5FF] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[#5B21B6]">
                <Droplets className="h-5 w-5" />
                <h3 className="font-display text-base font-semibold">Hydration check-in</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWaterCountToday((c) => Math.max(0, c - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFD4EE] bg-white text-sm font-semibold text-[#4C1D95]"
                >
                  −
                </button>
                <span className="min-w-[68px] text-center text-sm font-semibold text-[#221830] tabular-nums">
                  {waterCountToday} / 8 glasses
                </span>
                <button
                  type="button"
                  onClick={() => setWaterCountToday((c) => Math.min(16, c + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFD4EE] bg-white text-sm font-semibold text-[#4C1D95]"
                >
                  +
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-[#4A3D5C]">
              {activePlan.hydrationTip}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6DDF0] bg-white p-5">
            <h3 className="font-display text-base font-semibold text-[#221830]">
              Gentle nourishment reminder
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#524366]">{activePlan.gentleNote}</p>
          </div>
        </div>
      </section>

      {/* Log Daily Meal & View Meal History */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleLogMeal}
          className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-[#6D28D9]" />
            <h2 className="font-display text-xl font-semibold text-[#221830]">Log daily meal</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Date</span>
              <input
                type="date"
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Meal slot</span>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Evening snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-[#4A3D5C]">What did you eat?</span>
            <input
              type="text"
              required
              value={mealItems}
              onChange={(e) => setMealItems(e.target.value)}
              placeholder="e.g. 2 dosas with sambar, curd & sprouts"
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Water glasses</span>
              <input
                type="number"
                min={0}
                max={12}
                value={waterGlasses}
                onChange={(e) => setWaterGlasses(Number(e.target.value))}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830] tabular-nums"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#4A3D5C]">Comfort note</span>
              <input
                type="text"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="Felt energized"
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DFD4EE] bg-[#FAF8FC] px-3 text-sm text-[#221830]"
              />
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-medium text-white hover:bg-[#5B21B6]"
          >
            <Plus className="h-4 w-4" />
            <span>Save Meal Record</span>
          </button>
        </form>

        <div className="rounded-2xl border border-[#E6DDF0] bg-white p-6 lg:col-span-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-[#221830]">Daily meal records</h2>
            <span className="text-xs text-[#6B5B7E] tabular-nums">{meals.length} saved</span>
          </div>
          {meals.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B5B7E]">
              No meal records yet. Log your first home meal on the left.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#F0E9F7]">
              {meals.map((meal) => (
                <li
                  key={meal.id}
                  className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-medium text-[#6D28D9] capitalize tabular-nums">
                      {meal.mealType} · {formatReadableDate(meal.date)} · {meal.waterGlasses}{' '}
                      glasses water{meal.isDemo ? ' · Demo sample' : ''}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#221830]">{meal.items}</p>
                    {meal.notes && <p className="mt-0.5 text-xs text-[#6B5B7E]">{meal.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDeleteMeal(meal.id)}
                    aria-label="Delete meal record"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#9F1239] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
