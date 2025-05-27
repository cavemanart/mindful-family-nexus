// /src/components/HouseholdSelector.tsx
import { useState } from "react";
import { useHouseholds } from "../hooks/useHouseholds";

export const HouseholdSelector = ({ userId, onSwitch }: { userId: string, onSwitch: (id: string) => void }) => {
  const { households, loading } = useHouseholds(userId);
  const [selected, setSelected] = useState<string | null>(null);

  if (loading) return <p>Loading households...</p>;

  return (
    <div>
      <label htmlFor="household-select">Select Household:</label>
      <select
        id="household-select"
        value={selected || ""}
        onChange={(e) => {
          const id = e.target.value;
          setSelected(id);
          onSwitch(id);
        }}
      >
        <option value="" disabled>Select one</option>
        {households.map((h) => (
          <option key={h.household.id} value={h.household.id}>
            {h.household.name}
          </option>
        ))}
      </select>
    </div>
  );
};
