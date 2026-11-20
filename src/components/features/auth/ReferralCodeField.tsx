import { useState } from "react";
import { captureReferral, setReferralCode } from "../../../utils/referral";

export default function ReferralCodeField() {
  const [code, setCode] = useState(() => captureReferral() ?? "");
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <label htmlFor="referral-code" className="block text-sm font-semibold text-gray-900 mb-2">
        Code de parrainage <span className="font-normal text-gray-500">(optionnel)</span>
      </label>
      <input id="referral-code" form="registration-form" type="text" autoCapitalize="characters" autoComplete="off"
        spellCheck={false} minLength={4} maxLength={20} pattern="[A-Za-z0-9\-]{4,20}"
        title="Entre 4 et 20 lettres, chiffres ou tirets." value={code} placeholder="Ex. AFF-123456"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary"
        onChange={event => {
          const value = event.target.value.toUpperCase().replace(/\s/g, "");
          setCode(value); setReferralCode(value);
        }} aria-describedby="referral-help" />
      <p id="referral-help" className="text-sm text-gray-500 mt-2">
        Un proche vous a recommandé Cabunets ? Saisissez son code, même sans lien de parrainage.
        Vous pouvez aussi corriger ou retirer le code prérempli.
      </p>
    </div>
  );
}
